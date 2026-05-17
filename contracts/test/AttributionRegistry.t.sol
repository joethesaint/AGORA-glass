// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/AttributionRegistry.sol";

contract AttributionRegistryTest is Test {
    AttributionRegistry public registry;

    event ReasonHashStored(bytes32 indexed hash, uint256 timestamp);

    function setUp() public {
        registry = new AttributionRegistry();
    }

    function testStoreReason() public {
        bytes32 reason = keccak256("test reasoning");
        
        vm.expectEmit(true, false, false, true);
        emit ReasonHashStored(reason, block.timestamp);
        
        registry.storeReason(reason);
        assertEq(registry.verifyReason(reason), block.timestamp);
    }

    function testFailStoreDuplicate() public {
        bytes32 reason = keccak256("duplicate");
        registry.storeReason(reason);
        registry.storeReason(reason); // Should fail
    }
}
