// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";

/// @dev Minimal mock so we don't depend on a live USDC deployment in unit tests.
contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    string public name = "USD Coin";
    string public symbol = "USDC";
    uint8 public decimals = 6;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract VaultTest is Test {
    Vault public vault;
    MockUSDC public usdc;

    address public agent = makeAddr("agent");
    address public trader = makeAddr("trader");
    address public depositor = makeAddr("depositor");
    address public stranger = makeAddr("stranger");

    uint256 constant DEPOSIT_AMOUNT = 1000e6; // 1,000 USDC

    function setUp() public {
        usdc = new MockUSDC();
        vault = new Vault(address(usdc), agent);

        usdc.mint(depositor, DEPOSIT_AMOUNT);
        vm.prank(depositor);
        usdc.approve(address(vault), type(uint256).max);
    }

    // --- deposit ---

    function test_Deposit() public {
        vm.prank(depositor);
        vault.deposit(500e6);

        assertEq(vault.vaultBalance(), 500e6);
        assertEq(vault.deposits(depositor), 500e6);
        assertEq(vault.totalDeposited(), 500e6);
    }

    function test_Deposit_EmitsEvent() public {
        vm.prank(depositor);
        vm.expectEmit(true, false, false, true);
        emit Vault.Deposited(depositor, 500e6);
        vault.deposit(500e6);
    }

    function test_Deposit_RevertsOnZero() public {
        vm.prank(depositor);
        vm.expectRevert(Vault.ZeroAmount.selector);
        vault.deposit(0);
    }

    // --- rescue ---

    function test_Rescue() public {
        vm.prank(depositor);
        vault.deposit(DEPOSIT_AMOUNT);

        bytes32 traceHash = keccak256("rescue_trace_001");
        vm.prank(agent);
        vault.rescue(trader, 200e6, traceHash);

        assertEq(usdc.balanceOf(trader), 200e6);
        assertEq(vault.vaultBalance(), 800e6);
    }

    function test_Rescue_EmitsEvent() public {
        vm.prank(depositor);
        vault.deposit(DEPOSIT_AMOUNT);

        bytes32 traceHash = keccak256("rescue_trace_002");
        vm.prank(agent);
        vm.expectEmit(true, false, true, true);
        emit Vault.RescueReleased(trader, 200e6, traceHash);
        vault.rescue(trader, 200e6, traceHash);
    }

    function test_Rescue_RevertsIfNotAgent() public {
        vm.prank(depositor);
        vault.deposit(DEPOSIT_AMOUNT);

        vm.prank(stranger);
        vm.expectRevert(Vault.Unauthorized.selector);
        vault.rescue(trader, 200e6, bytes32(0));
    }

    function test_Rescue_RevertsOnZeroAmount() public {
        vm.prank(agent);
        vm.expectRevert(Vault.ZeroAmount.selector);
        vault.rescue(trader, 0, bytes32(0));
    }

    function test_Rescue_RevertsIfInsufficientBalance() public {
        vm.prank(agent);
        vm.expectRevert(Vault.InsufficientBalance.selector);
        vault.rescue(trader, 1e6, bytes32(0));
    }

    // --- withdraw (owner) ---

    function test_Withdraw() public {
        vm.prank(depositor);
        vault.deposit(DEPOSIT_AMOUNT);

        vault.withdraw(DEPOSIT_AMOUNT);
        assertEq(vault.vaultBalance(), 0);
    }

    function test_Withdraw_RevertsIfNotOwner() public {
        vm.prank(depositor);
        vault.deposit(DEPOSIT_AMOUNT);

        vm.prank(stranger);
        vm.expectRevert(Vault.Unauthorized.selector);
        vault.withdraw(DEPOSIT_AMOUNT);
    }

    // --- setAgent ---

    function test_SetAgent() public {
        address newAgent = makeAddr("newAgent");
        vault.setAgent(newAgent);
        assertEq(vault.agent(), newAgent);
    }

    function test_SetAgent_RevertsIfNotOwner() public {
        vm.prank(stranger);
        vm.expectRevert(Vault.Unauthorized.selector);
        vault.setAgent(stranger);
    }
}
