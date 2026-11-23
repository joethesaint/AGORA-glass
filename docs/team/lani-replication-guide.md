# 🛡️ AGORA-glass: Lani's Replication Guide

Welcome Lani! Use this guide to quickly replicate the AGORA-glass (Glass-Box Sentinel) environment and run both the backend agent and frontend dashboard.

## 1. Initial Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 20+**
- **[uv](https://github.com/astral-sh/uv)** (Highly recommended for fast Python package management)

### Step 1: Clone the Repository
```bash
git clone https://github.com/joethesaint/AGORA-glass.git
cd AGORA-glass
```

### Step 2: Arc CLI Setup
The Arc CLI is used for environment configuration and traction tracking.
```bash
uv tool install git+https://github.com/the-canteen-dev/ARC-cli.git
arc-canteen login
arc-canteen shell-init
```

## 2. Backend Setup (Sentinel Agent)

### Step 1: Virtual Environment & Dependencies
```bash
uv venv
source .venv/bin/activate
uv sync
```

### Step 2: Configure Environment Variables
```bash
cp .env.example .env
```
Open `.env` and fill in the following:
- `AGENT_PRIVATE_KEY`: Your Arc wallet private key (for pinning reasoning hashes).
- `MONITOR_ACCOUNT`: The Hyperliquid account address to monitor (use your own or a known testnet address).

## 3. Frontend Setup (Dashboard)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
cd ..
```

## 4. Running the System

To see the "Glass-Box" in action, you need to run both the agent and the dashboard simultaneously.

### Terminal 1: Run the Backend Agent (Mock Mode)
Mock mode simulates position liquidations and rescues without needing live Hyperliquid API keys or real funds.
```bash
source .venv/bin/activate
python src/main.py --mode mock
```
*Note: The agent also starts a WebSocket server on port 8765 to feed data to the frontend.*

### Terminal 2: Run the Frontend Dashboard
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You should see live "Position Update" and "Risk Verdict" signals appearing in the rescue feed.

## 5. Lani's Special Tasks (DevRel & Traction)

As our DevRel lead, you are responsible for broadcasting our progress using `arc-canteen`.

### Update Product Status
Run this after you've verified the frontend and backend are communicating correctly:
```bash
arc-canteen update-product "Completed high-fidelity Next.js dashboard with live 'Glass-Box' transparency auditing, integrated rescue metrics, and real Web3 connectivity."
```

### Update Traction
Run this to record the successful integration of the core rescue loop:
```bash
arc-canteen update-traction "Integrated full 'Glass-Box' rescue cycle: Monitoring -> Risk Eval -> Reasoning Hash -> Arc Pinning -> Vault Authorization -> Circle DCW Execution."
```

### Check Global Status
```bash
arc-canteen status
```

---
*Maintained by the AGORA-glass Team.*
