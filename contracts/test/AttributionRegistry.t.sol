// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AttributionRegistry} from "../src/AttributionRegistry.sol";

contract AttributionRegistryTest is Test {
    event ReasonStored(address indexed recorder, bytes32 indexed traceHash, uint256 timestamp);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);

    AttributionRegistry public registry;

    address public agent = makeAddr("agent");
    address public stranger = makeAddr("stranger");

    function setUp() public {
        registry = new AttributionRegistry(agent);
    }

    function test_StoreReason() public {
        bytes32 hash = keccak256("trace_001");
        vm.prank(agent);
        registry.storeReason(hash);

        AttributionRegistry.TraceEntry memory entry = registry.getTrace(hash);
        assertEq(entry.recorder, agent);
        assertEq(entry.timestamp, block.timestamp);
        assertEq(registry.traceCount(), 1);
        assertEq(registry.traceLog(0), hash);
    }

    function test_StoreReason_EmitsEvent() public {
        bytes32 hash = keccak256("trace_001");
        vm.prank(agent);
        vm.expectEmit(true, true, false, true);
        emit ReasonStored(agent, hash, block.timestamp);
        registry.storeReason(hash);
    }

    function test_StoreReason_OwnerCanAlsoStore() public {
        bytes32 hash = keccak256("trace_owner");
        registry.storeReason(hash);
        assertEq(registry.traceCount(), 1);
    }

    function test_StoreReason_RevertsOnDuplicate() public {
        bytes32 hash = keccak256("trace_dup");
        vm.startPrank(agent);
        registry.storeReason(hash);
        vm.expectRevert(AttributionRegistry.AlreadyStored.selector);
        registry.storeReason(hash);
        vm.stopPrank();
    }

    function test_StoreReason_RevertsIfUnauthorized() public {
        vm.prank(stranger);
        vm.expectRevert(AttributionRegistry.Unauthorized.selector);
        registry.storeReason(keccak256("trace_x"));
    }

    function test_SetAgent() public {
        address newAgent = makeAddr("newAgent");
        registry.setAgent(newAgent);
        assertEq(registry.agent(), newAgent);
    }

    function test_SetAgent_RevertsIfNotOwner() public {
        vm.prank(stranger);
        vm.expectRevert(AttributionRegistry.Unauthorized.selector);
        registry.setAgent(stranger);
    }

    function testFuzz_StoreMultipleTraces(bytes32[] calldata hashes) public {
        vm.startPrank(agent);
        uint256 stored = 0;
        for (uint256 i = 0; i < hashes.length; i++) {
            // skip duplicates within the fuzz input
            if (registry.getTrace(hashes[i]).timestamp == 0) {
                registry.storeReason(hashes[i]);
                stored++;
            }
        }
        vm.stopPrank();
        assertEq(registry.traceCount(), stored);
    }
}
