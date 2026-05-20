import AttributionRegistryAbi from './abis/AttributionRegistry.json';
import VaultAbi from './abis/Vault.json';

export const CONTRACT_CONFIG = {
  arcTestnet: {
    chainId: 5042002,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_42b1f431a6cfa6a62d2c14e6c91d2c39545bc99bb8ee5c241f85f8108a4af369',
    contracts: {
      attributionRegistry: {
        address: (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
        abi: AttributionRegistryAbi,
      },
      vault: {
        address: (process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
        abi: VaultAbi,
      },
      usdc: {
        address: '0x3600000000000000000000000000000000000000' as `0x${string}`, // Native USDC ERC-20 on Arc
        decimals: 6,
      }
    },
  }
};
