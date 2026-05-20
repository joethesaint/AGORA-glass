// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Vault
 * @notice Holds USDC collateral and allows an authorized agent to release funds for rescues.
 */
contract Vault is Ownable {
    IERC20 public immutable usdc;
    address public agent;

    event RescueReleased(address indexed recipient, uint256 amount, string destinationChain, bytes32 reasonHash);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);

    modifier onlyAgent() {
        require(msg.sender == agent, "Caller is not the authorized agent");
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
        require(_newAgent != address(0), "New agent is the zero address");
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
        require(usdc.balanceOf(address(this)) >= _amount, "Insufficient vault balance");
        
        // Transfer USDC to the agent (who will then route it via Circle Gateway)
        // or directly to the recipient if using a specific Gateway integration pattern.
        // For this PoC, we transfer to the agent who handles the off-chain Circle call.
        require(usdc.transfer(agent, _amount), "USDC transfer failed");
        
        emit RescueReleased(_recipient, _amount, _destinationChain, _reasonHash);
    }

    /**
     * @notice Allows the owner to emergency withdraw funds.
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(usdc.transfer(owner(), _amount), "Emergency withdraw failed");
    }
}
