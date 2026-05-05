// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

interface ISettlementAnchor {
    event SettlementBatchCreated(bytes32 indexed batchId, bytes32 indexed merchantId, bytes32 ledgerRootHash);
    event SettlementBatchReady(bytes32 indexed batchId);
    event SettlementBatchSettled(bytes32 indexed batchId);
    event SettlementBatchFailed(bytes32 indexed batchId);

    function createBatch(DataTypes.SettlementBatchAnchor calldata batch) external;
    function markBatchReady(bytes32 batchId) external;
    function markBatchSettled(bytes32 batchId) external;
    function markBatchFailed(bytes32 batchId) external;
    function getBatch(bytes32 batchId) external view returns (DataTypes.SettlementBatchAnchor memory);
    function isBatchSettled(bytes32 batchId) external view returns (bool);
}
