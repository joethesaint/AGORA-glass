// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "forge-std/interfaces/IERC20.sol";

/// @notice USDC custody vault with agent-gated rescue releases.
/// Traders or the protocol fund this vault with USDC. The authorized
/// off-chain GLASS agent (Joe's address) calls rescue() to transfer
/// USDC directly to a trader's position before a liquidation hits.
contract Vault {
    address public owner;
    address public agent;
    IERC20 public usdc;

    mapping(address => uint256) public deposits;
    uint256 public totalDeposited;

    event Deposited(address indexed depositor, uint256 amount);
    event RescueReleased(address indexed trader, uint256 amount, bytes32 indexed traceHash);
    event Withdrawn(address indexed to, uint256 amount);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);

    error Unauthorized();
    error InsufficientBalance();
    error ZeroAmount();
    error TransferFailed();

    constructor(address _usdc, address _agent) {
        owner = msg.sender;
        usdc = IERC20(_usdc);
        agent = _agent;
    }

    modifier onlyAgent() {
        if (msg.sender != agent) revert Unauthorized();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    /// @notice Deposit USDC into the rescue vault. Requires prior approval.
    function deposit(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        deposits[msg.sender] += amount;
        totalDeposited += amount;
        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        emit Deposited(msg.sender, amount);
    }

    /// @notice Release USDC to a trader's address. Only callable by the authorized agent.
    /// @param trader  Destination address (trader's wallet or perp exchange margin account).
    /// @param amount  Amount of USDC (6 decimals) to transfer.
    /// @param traceHash  SHA-256 hash of the reasoning trace that authorized this rescue.
    function rescue(address trader, uint256 amount, bytes32 traceHash) external onlyAgent {
        if (amount == 0) revert ZeroAmount();
        if (usdc.balanceOf(address(this)) < amount) revert InsufficientBalance();
        bool success = usdc.transfer(trader, amount);
        if (!success) revert TransferFailed();
        emit RescueReleased(trader, amount, traceHash);
    }

    /// @notice Emergency withdrawal by owner only.
    function withdraw(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        if (usdc.balanceOf(address(this)) < amount) revert InsufficientBalance();
        bool success = usdc.transfer(owner, amount);
        if (!success) revert TransferFailed();
        emit Withdrawn(owner, amount);
    }

    function setAgent(address _agent) external onlyOwner {
        emit AgentUpdated(agent, _agent);
        agent = _agent;
    }

    function vaultBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
