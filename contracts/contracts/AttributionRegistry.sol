// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AttributionRegistry
 * @notice Stores hashes of agent reasoning traces to provide on-chain transparency (Glass-Box model).
 */
contract AttributionRegistry is Ownable {
    address public agent;

    /// @notice Maps reasoning trace hashes to their submission timestamp.
    mapping(bytes32 => uint256) public reasonHashes;

    /// @notice Emitted when a new reasoning hash is stored.
    event ReasonHashStored(bytes32 indexed hash, uint256 timestamp);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);

    modifier onlyAgent() {
        require(msg.sender == agent || msg.sender == owner(), "Caller is not authorized");
        _;
    }

    constructor(address _agent) Ownable(msg.sender) {
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
     * @notice Stores a reasoning trace hash.
     * @param _hash The SHA256 hash of the off-chain JSON reasoning trace.
     */
    function storeReason(bytes32 _hash) external onlyAgent {
        require(reasonHashes[_hash] == 0, "Hash already exists");
        
        reasonHashes[_hash] = block.timestamp;
        emit ReasonHashStored(_hash, block.timestamp);
    }

    /**
     * @notice Checks if a hash exists and returns its timestamp.
     * @param _hash The hash to verify.
     * @return The timestamp of submission (0 if not found).
     */
    function verifyReason(bytes32 _hash) external view returns (uint256) {
        return reasonHashes[_hash];
    }
}
