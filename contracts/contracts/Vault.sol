// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Vault
 * @notice Holds USDC collateral and allows an authorized agent to release funds for rescues.
 */
contract Vault is Ownable {
    IERC20 public immutable usdc;
    address public agent;

    event RescueReleased(address indexed recipient, uint256 amount, string destinationChain, bytes32 reasonHash);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);

    error Unauthorized();
    error InsufficientBalance();
    error TransferFailed();

    modifier onlyAgent() {
        if (msg.sender != agent && msg.sender != owner()) revert Unauthorized();
        _;
    }

    constructor(address _usdc, address _agent) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        agent = _agent;
    }

    /**
     * @notice Updates the authorized agent address.
     * @param _newAgent The new agent address.
     */
    function setAgent(address _newAgent) external onlyOwner {
        if (_newAgent == address(0)) revert Unauthorized();
        emit AgentUpdated(agent, _newAgent);
        agent = _newAgent;
    }

    /**
     * @notice Releases USDC for a liquidation rescue.
     * @param _amount The amount of USDC (6 decimals) to release.
     * @param _destinationChain The target chain identifier for the Circle Gateway.
     * @param _recipient The recipient address on the destination chain.
     * @param _reasonHash The hash of the reasoning trace for this rescue.
     */
    function releaseForRescue(
        uint256 _amount,
        string calldata _destinationChain,
        address _recipient,
        bytes32 _reasonHash
    ) external onlyAgent {
        if (usdc.balanceOf(address(this)) < _amount) revert InsufficientBalance();
        
        // Transfer USDC to the agent (who handles the off-chain Circle call)
        if (!usdc.transfer(agent, _amount)) revert TransferFailed();
        
        emit RescueReleased(_recipient, _amount, _destinationChain, _reasonHash);
    }

    /**
     * @notice Allows the owner to emergency withdraw funds.
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        if (!usdc.transfer(owner(), _amount)) revert TransferFailed();
    }
}
