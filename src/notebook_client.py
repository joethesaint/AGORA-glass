import os
import json
import asyncio
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

logger = logging.getLogger("NotebookLMClient")


class NotebookLMClient:
    """
    Headless client that runs `npx @roomi-fields/notebooklm-mcp` as a subprocess
    and communicates using JSON-RPC 2.0 over stdin/stdout.
    """

    def __init__(self, notebook_id: Optional[str] = None):
        self.notebook_id = notebook_id or os.getenv("NOTEBOOKLM_AGORA_ID")
        self.process: Optional[asyncio.subprocess.Process] = None
        self.pending_requests: Dict[int, asyncio.Future] = {}
        self.msg_id = 1
        self.reader_task: Optional[asyncio.Task] = None

    async def start(self):
        """Starts the headless MCP subprocess and the stdout reader loop."""
        if self.process:
            return

        logger.info("Starting npx @roomi-fields/notebooklm-mcp subprocess...")
        # Start subprocess, pipe stdin and stdout, let stderr print to console or redirect
        self.process = await asyncio.create_subprocess_exec(
            "npx",
            "-y",
            "@roomi-fields/notebooklm-mcp",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        self.reader_task = asyncio.create_task(self._read_loop())
        logger.info("Subprocess started and reader task spawned.")

    async def stop(self):
        """Cleanly stops the subprocess and reader task."""
        if self.reader_task:
            self.reader_task.cancel()
            try:
                await self.reader_task
            except asyncio.CancelledError:
                pass
            self.reader_task = None

        if self.process:
            try:
                self.process.terminate()
                await self.process.wait()
            except Exception as e:
                logger.warning(f"Error terminating subprocess: {e}")
            self.process = None

        # Cancel any remaining pending futures
        for fut in self.pending_requests.values():
            if not fut.done():
                fut.set_exception(
                    RuntimeError("Client was stopped before response received.")
                )
        self.pending_requests.clear()

    async def _read_loop(self):
        """Reads lines from subprocess stdout and matches them to pending requests."""
        try:
            while self.process and self.process.stdout:
                line_bytes = await self.process.stdout.readline()
                if not line_bytes:
                    break
                line = line_bytes.decode("utf-8").strip()
                if not line:
                    continue

                try:
                    msg = json.loads(line)
                    if "id" in msg:
                        req_id = msg["id"]
                        if req_id in self.pending_requests:
                            fut = self.pending_requests.pop(req_id)
                            if not fut.done():
                                fut.set_result(msg)
                except json.JSONDecodeError:
                    # Ignore non-JSON-RPC lines (e.g. debugging logs from standard output)
                    logger.debug(f"Non-JSON output from MCP stdout: {line}")
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error in stdout reader loop: {e}")

    async def send_request(
        self, method: str, params: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Sends a JSON-RPC request to the MCP server and awaits the response."""
        if not self.process or not self.process.stdin:
            raise RuntimeError("Subprocess is not running. Call .start() first.")

        req_id = self.msg_id
        self.msg_id += 1

        req = {"jsonrpc": "2.0", "id": req_id, "method": method, "params": params or {}}

        fut = asyncio.get_running_loop().create_future()
        self.pending_requests[req_id] = fut

        payload = json.dumps(req) + "\n"
        self.process.stdin.write(payload.encode("utf-8"))
        await self.process.stdin.drain()

        # Await response with a timeout (allowing 120 seconds for AI tools)
        try:
            return await asyncio.wait_for(fut, timeout=120.0)
        except asyncio.TimeoutError:
            if req_id in self.pending_requests:
                self.pending_requests.pop(req_id)
            raise TimeoutError(
                f"Request {method} (id={req_id}) timed out after 120 seconds."
            )

    async def list_tools(self) -> Dict[str, Any]:
        """Lists available tools from the MCP server."""
        response = await self.send_request("tools/list")
        if "error" in response:
            raise RuntimeError(f"Error listing tools: {response['error']}")
        return response.get("result", {})

    async def ask(self, question: str) -> str:
        """Asks a question targeting the configured notebook ID."""
        if not self.notebook_id:
            raise ValueError(
                "Notebook ID is not configured. Set NOTEBOOKLM_AGORA_ID in env or pass to constructor."
            )

        params = {
            "name": "notebook.ask",
            "arguments": {"notebook_id": self.notebook_id, "question": question},
        }

        logger.info(f"Asking NotebookLM: '{question}'...")
        response = await self.send_request("tools/call", params)
        if "error" in response:
            raise RuntimeError(f"Error calling notebook.ask: {response['error']}")

        result = response.get("result", {})
        content_list = result.get("content", [])
        if content_list and isinstance(content_list, list):
            texts = [c.get("text", "") for c in content_list if c.get("type") == "text"]
            return "\n".join(texts)

        return str(result)
