// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AttributionRegistry} from "../src/AttributionRegistry.sol";
import {Vault} from "../src/Vault.sol";

/// @notice Deploys AttributionRegistry and Vault to Arc testnet.
/// Usage:
///   forge script script/Deploy.s.sol:DeployGlass \
///     --rpc-url $ARC_RPC_URL \
///     --private-key $PRIVATE_KEY \
///     --broadcast \
///     --verify \
///     --verifier blockscout \
///     --verifier-url $ARCSCAN_API_URL
contract DeployGlass is Script {
    function run() external {
        address agent = vm.envAddress("AGENT_ADDRESS");
        address usdc = vm.envAddress("USDC_ADDRESS");

        vm.startBroadcast();

        AttributionRegistry registry = new AttributionRegistry(agent);
        Vault vault = new Vault(usdc, agent);

        vm.stopBroadcast();

        console.log("AttributionRegistry:", address(registry));
        console.log("Vault:              ", address(vault));
        console.log("Agent:              ", agent);
        console.log("USDC:               ", usdc);
    }
}
