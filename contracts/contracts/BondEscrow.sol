// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BondEscrow
 * @notice Manages performance bonds for AGORA-glass agents. 
 * If the agent violates safety bands, the manager can slash the bond.
 */
contract BondEscrow is Ownable {
    IERC20 public immutable usdc;
    mapping(address => uint256) public bonds;

    event BondStaked(address indexed agent, uint256 amount);
    event BondSlashed(address indexed agent, uint256 amount);

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Agents stake USDC to prove commitment to safety rules.
     */
    function stake(uint256 amount) external {
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        bonds[msg.sender] += amount;
        emit BondStaked(msg.sender, amount);
    }

    /**
     * @notice Manager slashes the bond if reasoning traces show rule violations.
     */
    function slash(address agent, uint256 amount) external onlyOwner {
        require(bonds[agent] >= amount, "Insufficient bond");
        bonds[agent] -= amount;
        require(usdc.transfer(owner(), amount), "Slash transfer failed");
        emit BondSlashed(agent, amount);
    }
}
