// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/AttributionRegistry.sol";
import "../contracts/Vault.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("AGENT_PRIVATE_KEY");
        address usdcAddress = 0x3600000000000000000000000000000000000000;
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AttributionRegistry
        AttributionRegistry registry = new AttributionRegistry();
        console.log("AttributionRegistry deployed to:", address(registry));

        // 2. Deploy Vault
        Vault vault = new Vault(usdcAddress, vm.addr(deployerPrivateKey));
        console.log("Vault deployed to:", address(vault));

        vm.stopBroadcast();
    }
}
