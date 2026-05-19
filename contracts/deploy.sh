#!/bin/bash
# AGORA-glass Deployment Script
# Run this on your local Linux machine to deploy contracts to Arc Testnet.

set -e # Exit on error

echo "🚀 Starting AGORA-glass deployment sequence..."

# 1. Initialize environment via arc-canteen
if command -v arc-canteen &> /dev/null; then
    echo "📦 Initializing arc-canteen environment..."
    arc-canteen shell-init
else
    echo "⚠️ arc-canteen not found. Ensure it is installed and in your PATH."
fi

# 2. Navigate to contracts directory
cd "$(dirname "$0")"

# 3. Ensure RPC is set
if [ -z "$RPC" ]; then
    echo "❌ RPC environment variable is not set."
    echo "Please set it: export RPC='https://testnet.arc.network'"
    exit 1
fi

# 4. Deploy contracts
echo "🛠️ Deploying contracts to Arc Testnet..."
# Run forge script and capture output to a log file for easier parsing
forge script scripts/Deploy.s.sol --rpc-url "$RPC" --broadcast --verify | tee deployment.log

echo "✅ Deployment complete. Check 'contracts/deployment.log' for contract addresses."
echo "Please paste the AttributionRegistry and Vault addresses here to proceed with frontend integration."
