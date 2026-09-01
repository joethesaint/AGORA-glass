@AGENTS.md

## LLM access — local Claude Code, not the API

When the software we build needs to call an LLM, do NOT use an LLM API (Anthropic API, OpenAI API, any hosted inference endpoint) unless I explicitly instructs it. Route the call through the local Claude Code instead.

If no LLM service exists yet in the project, build one. Create a self-contained LLM service that shells out to local Claude Code, with its own contract, tests, and evals. Every other service calls that contract, never an external API.
