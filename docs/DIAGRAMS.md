# AGORA-glass: Architectural Diagrams

This document contains the complete suite of architectural diagrams for the AGORA-glass system, detailing the interactions between the Agent Layer, Arc Testnet, Circle Financial Stack, and Frontend Dashboard.

---

### 1. Idea Selection & Scoring  
Shows the four candidate ideas, their inspiration from Canteen’s research, and the final scores that led to our pick.

```mermaid
flowchart TD
    Start[("Idea Selection")] --> E1["Cross‑Chain Liquidation Protector<br>(Glass‑Box Rescue Agent)"]
    Start --> E2["Slash‑Bonded Whale Index Manager"]
    Start --> E3["Reasoning‑Template Staking Arena"]
    Start --> E4["Signal Marketplace<br>(Reputation Slashing)"]

    subgraph Canteen[Original Canteen Research]
        C1[("Trading‑R1 Reasoning Traces")]
        C2[("Hyperliquid Whale Index")]
        C3[("Slash‑Bonded Copy‑Trading")]
        C4[("Translation as Alpha")]
    end

    Start -.->|"inspired by"| Canteen

    E1 -.- S1["Score: 89"]
    E2 -.- S2["Score: 88"]
    E3 -.- S3["Score: 82"]
    E4 -.- S4["Score: 80"]

    classDef chosen fill:#e0ffe0,stroke:#2d8a2d,stroke-width:4px,color:#000;
    class E1 chosen;
    class S1 chosen;

    classDef others fill:#f5f5f5,stroke:#aaa,stroke-width:1px,color:#000;
    class E2,E3,E4,S2,S3,S4 others;

    classDef original fill:#e8e8e8,stroke:#999,stroke-dasharray: 4 2,color:#666;
    class C1,C2,C3,C4 original;
```

---

### 2. Full Technical Architecture
The complete high‑level view of all four layers working together.

```mermaid
flowchart TD
    subgraph Agent_Layer["Agent Layer – Python (off‑chain)"]
        Monitor["PerpMonitor<br>(Fetches live positions)"]
        Engine["RiskEngine<br>(Margin ratio, leverage, thresholds)"]
        Tracer["ReasoningTracer<br>(JSON trace + SHA256 hash)"]
        Dispatcher["RescueDispatcher<br>(Gateway mock + Vault call)"]
        Bus["MessageBus (in‑memory)"]

        Monitor -->|position_update| Bus
        Bus -->|position_update| Engine
        Engine -->|risk_verdict| Bus
        Bus -->|risk_verdict| Tracer
        Bus -->|"risk_verdict (CRITICAL)"| Dispatcher
        Tracer -->|reasoning_trace, trace_pinned| Bus
        Dispatcher -->|rescue_initiated, rescue_complete| Bus
    end

    subgraph Arc_Layer["Arc Testnet – Smart Contracts"]
        Registry["AttributionRegistry.sol<br>storeReason(bytes32)"]
        Vault["Vault.sol<br>USDC custody, agent‑gated rescue"]
        Bond["BondEscrow.sol (optional)"]
    end

    subgraph Circle_Stack["Circle Financial Stack"]
        Gateway["Circle Gateway (mock)<br>sub‑500ms cross‑chain USDC"]
        DCW["Developer‑Controlled Wallets"]
        AppKit["Circle App Kit (frontend)"]
        CLI["Arc CLI<br>(RPC, updates, context)"]
    end

    subgraph Frontend["Frontend Dashboard"]
        UI["Next.js + WebSocket<br>Position health, rescue feed"]
    end

    Tracer -->|store hash tx| Registry
    Dispatcher -->|rescue release| Vault
    Dispatcher -->|initiate transfer| Gateway
    Vault -.->|funds managed by| DCW
    Bus -.->|"WebSocket bridge"| UI
    UI -.->|read events| Registry
    UI -.->|read events| Vault
    Bond -.->|slash if rules broken| Engine

    style Agent_Layer fill:none,stroke:#d4a017,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style Arc_Layer fill:none,stroke:#0052ff,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style Circle_Stack fill:none,stroke:#6700eb,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style Frontend fill:none,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:#000
```

---

### 3. Agent Layer – Python Module Internals  
How the off‑chain components communicate over the MessageBus.

```mermaid
flowchart LR
    subgraph Agent["Agent Layer (Python)"]
        direction TB
        Monitor["PerpMonitor"] -->|position_update| Bus["MessageBus"]
        Bus -->|position_update| Engine["RiskEngine"]
        Engine -->|risk_verdict| Bus
        Bus -->|risk_verdict| Tracer["ReasoningTracer"]
        Bus -->|"risk_verdict (CRITICAL)"| Disp["RescueDispatcher"]
        Tracer -->|reasoning_trace| Bus
        Tracer -->|trace_pinned| Bus
        Disp -->|rescue_initiated| Bus
        Disp -->|rescue_complete| Bus
    end

    style Agent fill:none,stroke:#d4a017,stroke-width:2px,stroke-dasharray:5 5,color:#000
    style Bus fill:#fdfcf0,stroke:#d4a017,stroke-width:1px
```

---

### 4. Arc Layer – On‑Chain Contracts & Identity  
The smart contracts deployed on Arc testnet.

```mermaid
flowchart TD
    subgraph Arc["Arc Testnet (Chain ID 5042002)"]
        Registry["AttributionRegistry.sol"]
        Vault["Vault.sol<br>(USDC custody)"]
        Bond["BondEscrow.sol (optional)"]
    end

    Agent["Python Agent"] -->|"storeReason(bytes32)"| Registry
    Agent -->|"releaseForRescue()"| Vault
    Vault -.->|"funds managed by"| DCW["Circle DCW"]
    Bond -.->|"slash if rules broken"| Agent

    style Arc fill:none,stroke:#0052ff,stroke-width:2px,stroke-dasharray:5 5,color:#000
```

---

### 5. Circle Financial Stack – Gateway, Wallets & App Kit  
How the Circle tools connect the agent to cross‑chain liquidity.

```mermaid
flowchart LR
    subgraph Circle["Circle Financial Stack"]
        Gateway["Circle Gateway<br>(sub‑500ms cross‑chain)"]
        CCTP["CCTP<br>(native burn‑and‑mint)"]
        DCW["Dev‑Controlled Wallets"]
        AppKit["App Kit (Bridge, Swap, Send)"]
        CLI["Arc CLI (RPC, updates)"]
    end

    Agent["Python Agent"] -->|"initiate transfer"| Gateway
    Gateway -->|"uses"| CCTP
    Agent -->|"signs via"| DCW
    Vault["Arc Vault"] -.->|"controlled by"| DCW
    Frontend["Next.js"] -->|"UI components"| AppKit

    style Circle fill:none,stroke:#6700eb,stroke-width:2px,stroke-dasharray:5 5,color:#000
```

---

### 6. Frontend Dashboard – Data Flow & Components  
How Andy’s dashboard consumes data and interacts with the contracts.

```mermaid
flowchart TD
    subgraph Frontend["Frontend Dashboard (Next.js)"]
        WS["WebSocket Client<br>(live signals)"]
        EventReader["Contract Event Reader<br>(ethers.js / viem)"]
        UI["UI Components"]
    end

    subgraph Components["Components"]
        PosCard["PositionCard"]
        TraceFeed["TraceFeed"]
        VaultPanel["VaultPanel"]
        RescueAnim["RescueAnimation"]
    end

    WS -->|position_update, risk_verdict| PosCard
    WS -->|reasoning_trace| TraceFeed
    EventReader -->|ReasonHashStored events| TraceFeed
    EventReader -->|Vault balance| VaultPanel
    WS -->|rescue_initiated, rescue_complete| RescueAnim
    UI --- Components

    style Frontend fill:none,stroke:#333,stroke-width:2px,stroke-dasharray:5 5,color:#000
```

---

### 7. Lani’s DevRel & Traction Workflow  
Lani’s daily loop: updates, community, and demo preparation.

```mermaid
flowchart LR
    subgraph Lani["Lani – DevRel / Traction"]
        CLI1["arc-canteen update-product"]
        CLI2["arc-canteen update-traction"]
        Status["arc-canteen status"]
        Demo["Demo script & pitch deck"]
        Community["Community outreach (Discord, Twitter)"]
    end

    Standup["Daily standup"] -->|progress report| CLI1
    Standup -->|metrics| CLI2
    Status -->|dashboard| Standup
    Demo -->|incorporates| Status
    Community -->|test users| CLI2
    Community -->|feedback| Demo

    style Lani fill:none,stroke:#e75480,stroke-width:2px,stroke-dasharray:5 5,color:#000
```
