// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice On-chain store for GLASS reasoning-trace hashes.
/// The off-chain agent calls storeReason() with the SHA-256 hash of each
/// JSON trace, creating an immutable audit trail on Arc.
contract AttributionRegistry {
    address public owner;
    address public agent;

    struct TraceEntry {
        address recorder;
        uint256 timestamp;
        uint256 blockNumber;
    }

    mapping(bytes32 => TraceEntry) public traces;
    bytes32[] public traceLog;

    event ReasonStored(address indexed recorder, bytes32 indexed traceHash, uint256 timestamp);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);

    error Unauthorized();
    error AlreadyStored();

    constructor(address _agent) {
        owner = msg.sender;
        agent = _agent;
    }

    modifier onlyAgent() {
        if (msg.sender != agent && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    /// @notice Store a reasoning-trace hash. Only callable by the authorized agent.
    /// @param traceHash SHA-256 hash of the JSON reasoning trace emitted by the agent.
    function storeReason(bytes32 traceHash) external onlyAgent {
        if (traces[traceHash].timestamp != 0) revert AlreadyStored();

        traces[traceHash] = TraceEntry({
            recorder: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
        traceLog.push(traceHash);

        emit ReasonStored(msg.sender, traceHash, block.timestamp);
    }

    function setAgent(address _agent) external onlyOwner {
        emit AgentUpdated(agent, _agent);
        agent = _agent;
    }

    function getTrace(bytes32 traceHash) external view returns (TraceEntry memory) {
        return traces[traceHash];
    }

    function traceCount() external view returns (uint256) {
        return traceLog.length;
    }
}
