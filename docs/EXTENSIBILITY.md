# 🛠️ AGORA-glass: Framework Extensibility Guide

AGORA-glass is designed as a modular **"Glass-Box"** framework. This means you don't have to use our default logic; you can "swap" any component with your own proprietary code while keeping the Arc and Circle settlement infrastructure intact.

## 🏗️ The "Swap" Mechanism: How to Customize

Currently, customization is handled via **Code Injection**. Because AGORA-glass is an open-source framework, you can follow these steps to build your own agent:

### 1. Clone the Repository
Start by cloning the AGORA-glass repo to your local machine or server.
```bash
git clone https://github.com/joethesaint/AGORA-glass.git
cd AGORA-glass
```

### 2. The "Drop-In Plugin" Folder
We have implemented a dynamic plugin loader. You do **not** need to modify `src/main.py` or any core infrastructure code. 

To add a new agent:
1. Write a Python file containing your class (which must inherit from `BaseComponent`).
2. Drop it into the `plugins/` directory.

The system will automatically discover, instantiate, and wire your agent into the message bus on startup.

**Example: Swapping/Adding a New Risk Engine**
Create `plugins/my_ai_engine.py`:
```python
import asyncio
from src.base import BaseComponent
from src.events import PositionUpdate, RiskVerdict

class MyAIEngine(BaseComponent):
    def __init__(self):
        super().__init__("MyAIEngine")
        self.subscribe(PositionUpdate, self.on_position)

    async def on_position(self, event: PositionUpdate):
        # Your proprietary AI logic here
        if event.margin_ratio < 0.15:
            await self.publish(RiskVerdict(status="CRITICAL", ...))
```
That's it. When you start the sentinel, you will see `Loading custom plugin agent: MyAIEngine` in your logs.

---

## 🌐 Remote Swapping: The "Agentic Economy" Reality

If you don't want to clone the repo or manage the Python environment, you can use **Remote Swapping**. This allows you to host your risk logic anywhere (Lambda, FastAPI, etc.) and "plug it in" via a URL.

### 1. Host your Agent API
Implement a simple web server that listens for `POST /evaluate`.

**Example (FastAPI):**
```python
@app.post("/evaluate")
async def evaluate(position: dict):
    # Your proprietary logic
    if position["margin_ratio"] < 0.05:
        return {"status": "CRITICAL", "risk_rating": 5}
    return {"status": "SAFE", "risk_rating": 1}
```

### 2. Configure the Sentinel
In your `.env` file, set the `REMOTE_AGENT_URL`.
```env
REMOTE_AGENT_URL=http://your-agent-api.com
```

### 3. Execution
The AGORA sentinel will now automatically delegate all risk decisions to your remote API. You get the **Transparency (Arc)** and **Speed (Circle)** of our infrastructure, powered by **Your Alpha**.

---

## 🚀 Why Build on AGORA-glass?
By using our framework, you don't have to worry about:
- **On-chain Pinning:** `ArcPinner` handles the reasoning hashes.
- **Fast Settlement:** `CircleRescuer` handles the USDC movement.
- **Job Auditing:** `JobService` handles the ERC-8183 lifecycle.
- **Monitoring:** `PerpMonitor` handles the live exchange data.

You focus 100% on the **Alpha** (the decision logic), and we handle the **Execution**.
