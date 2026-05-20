/**
 * AGORA-glass Dashboard Configuration Constants
 */

// WebSocket Configuration
export const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8765';
export const WEBSOCKET_RECONNECT_DELAY = 3000; // ms
export const WEBSOCKET_MAX_RETRIES = 10;

// Arc Network Configuration
export const ARC_CHAIN_ID = 5042002;
export const ARC_CHAIN_NAME = 'Arc Testnet';
export const ARC_RPC_URL = 'https://rpc.testnet.arc-node.thecanteenapp.com';
export const ARC_BLOCK_EXPLORER = 'https://testnet.arcscan.com';

// Risk Thresholds (matching Python agent)
export const CRITICAL_MARGIN_THRESHOLD = 0.12; // 12%
export const WARNING_MARGIN_THRESHOLD = 0.25; // 25%
export const MAX_LEVERAGE = 5;
export const TARGET_MARGIN_RATIO = 0.25; // 25%

// Circle Configuration
export const CIRCLE_APP_ID = import.meta.env.VITE_CIRCLE_APP_ID || '';

// UI Configuration
export const MAX_HISTORY_ITEMS = 50;
export const CHART_DATA_POINTS = 20;
export const REFRESH_INTERVAL = 2000; // ms

// Contract Addresses (to be set via environment variables)
export const ATTRIBUTION_REGISTRY_ADDRESS = import.meta.env.VITE_REGISTRY_ADDRESS || '';
export const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS || '';
