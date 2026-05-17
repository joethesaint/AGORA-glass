# SDK & Integration Mapping: Circle x Arc

This document outlines the technical implementation patterns for the AGORA-glass closed-loop system, utilizing the official Circle and Arc SDKs.

## 1. Circle Stack Integration

### Circle Gateway SDK (Cross-Chain Rescue)
Used by the `RescueDispatcher` to move USDC from the Arc Vault to the target chain (e.g., Arbitrum).

**Implementation Pattern (Python):**
```python
from circle.gateway import CircleGatewayClient

async def initiate_cross_chain_rescue(amount: int, destination_chain: str, recipient: str):
    client = CircleGatewayClient(api_key=os.getenv("CIRCLE_API_KEY"))
    
    # Initiate sub-500ms transfer via CCTP/Gateway
    transfer = await client.transfers.create(
        source_chain="arc-testnet",
        destination_chain=destination_chain,
        amount=amount,
        currency="USDC",
        recipient_address=recipient,
        execution_mode="FAST_FINALITY"
    )
    return transfer.id
```

### Circle Developer-Controlled Wallets
Used to manage the Agent's signing authority for the Vault.

**Config (TypeScript/viem):**
```typescript
import { createWalletClient, http } from 'viem'
import { arcTestnet } from './chains'

const agentWallet = createWalletClient({
  account: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
  chain: arcTestnet,
  transport: http(process.env.RPC)
})
```

---

## 2. Arc Network Integration (arc-web3 / arc-canteen)

### Attribution Registry (Reasoning Trace Pinning)
Every `RiskEngine` verdict must be hashed and pinned.

**Logic (Python):**
```python
from eth_hash.auto import keccak
from web3 import Web3

def generate_reason_hash(trace_json: dict) -> bytes:
    # Deterministic JSON stringify
    content = json.dumps(trace_json, sort_keys=True).encode('utf-8')
    return keccak(content)

async def pin_trace_to_arc(reason_hash: bytes):
    w3 = Web3(Web3.HTTPProvider(os.getenv("RPC")))
    registry = w3.eth.contract(address=REGISTRY_ADDR, abi=REGISTRY_ABI)
    
    tx = await registry.functions.storeReason(reason_hash).transact({
        'from': AGENT_ADDR,
        'gasPrice': w3.to_wei('0.01', 'mwei') # Fixed USDC gas
    })
    return tx.hex()
```

### Vault Contract (Rescue Release)
The `Vault.sol` contract enforces the `onlyAgent` modifier.

**Solidity Interface:**
```solidity
interface IVault {
    function releaseForRescue(
        uint256 amount, 
        string calldata destinationChain, 
        address recipient, 
        bytes32 reasonHash
    ) external;
}
```

---

## 3. The Closed-Loop Flow (Final Integration)

1. **Observe**: Python Agent monitor fetches Hyperliquid state.
2. **Decide**: RiskEngine generates `RiskVerdict` and `ReasoningTrace`.
3. **Log**: Agent calls `pin_trace_to_arc(hash(ReasoningTrace))`.
4. **Act**: Agent calls `Vault.releaseForRescue(...)` on Arc.
5. **Move**: Circle Gateway executes the cross-chain USDC transfer.
6. **Verify**: Frontend reads `ReasonHashStored` event from Arc to confirm the loop is closed.

---
*Reference: [ARCHITECTURE.md](./ARCHITECTURE.md), [HACKATHON.md](./HACKATHON.md)*
