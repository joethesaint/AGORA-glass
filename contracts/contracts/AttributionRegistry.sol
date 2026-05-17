// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/**
 * @title AttributionRegistry
 * @notice Stores hashes of agent reasoning traces to provide on-chain transparency (Glass-Box model).
 */
contract AttributionRegistry {
    /// @notice Maps reasoning trace hashes to their submission timestamp.
    mapping(bytes32 => uint256) public reasonHashes;

    /// @notice Emitted when a new reasoning hash is stored.
    event ReasonHashStored(bytes32 indexed hash, uint256 timestamp);

    /**
     * @notice Stores a reasoning trace hash.
     * @param _hash The SHA256 hash of the off-chain JSON reasoning trace.
     */
    function storeReason(bytes32 _hash) external {
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
