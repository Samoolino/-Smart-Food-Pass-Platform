// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ISettlementAnchor} from "../interfaces/ISettlementAnchor.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract SettlementAnchor is AccessControl, ISettlementAnchor {
    mapping(bytes32 => DataTypes.SettlementBatchAnchor) private batches;

    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.TREASURY_ROLE, admin);
        _grantRole(Roles.SETTLEMENT_SIGNER_ROLE, admin);
    }

    function createBatch(DataTypes.SettlementBatchAnchor calldata batch)
        external
        onlyRole(Roles.SETTLEMENT_SIGNER_ROLE)
    {
        if (batch.batchId == bytes32(0) || batch.merchantId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (batch.ledgerRootHash == bytes32(0)) revert Errors.InvalidIdentifier();
        if (batch.totalAmount == 0) revert Errors.ZeroAmount();
        if (batches[batch.batchId].batchId != bytes32(0)) revert Errors.AlreadyBound();

        batches[batch.batchId] = DataTypes.SettlementBatchAnchor({
            batchId: batch.batchId,
            merchantId: batch.merchantId,
            ledgerRootHash: batch.ledgerRootHash,
            totalAmount: batch.totalAmount,
            status: DataTypes.SettlementStatus.CREATED,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit SettlementBatchCreated(batch.batchId, batch.merchantId, batch.ledgerRootHash);
    }

    function markBatchReady(bytes32 batchId) external onlyRole(Roles.SETTLEMENT_SIGNER_ROLE) {
        DataTypes.SettlementBatchAnchor storage batch = batches[batchId];
        if (batch.batchId == bytes32(0)) revert Errors.NotBound();
        if (batch.status != DataTypes.SettlementStatus.CREATED) revert Errors.InvalidPolicy();

        batch.status = DataTypes.SettlementStatus.READY;
        batch.updatedAt = block.timestamp;

        emit SettlementBatchReady(batchId);
    }

    function markBatchSettled(bytes32 batchId) external onlyRole(Roles.TREASURY_ROLE) {
        DataTypes.SettlementBatchAnchor storage batch = batches[batchId];
        if (batch.batchId == bytes32(0)) revert Errors.NotBound();
        if (batch.status != DataTypes.SettlementStatus.READY) revert Errors.InvalidPolicy();

        batch.status = DataTypes.SettlementStatus.SETTLED;
        batch.updatedAt = block.timestamp;

        emit SettlementBatchSettled(batchId);
    }

    function markBatchFailed(bytes32 batchId) external onlyRole(Roles.SETTLEMENT_SIGNER_ROLE) {
        DataTypes.SettlementBatchAnchor storage batch = batches[batchId];
        if (batch.batchId == bytes32(0)) revert Errors.NotBound();
        if (batch.status == DataTypes.SettlementStatus.SETTLED) revert Errors.InvalidPolicy();

        batch.status = DataTypes.SettlementStatus.FAILED;
        batch.updatedAt = block.timestamp;

        emit SettlementBatchFailed(batchId);
    }

    function getBatch(bytes32 batchId) external view returns (DataTypes.SettlementBatchAnchor memory) {
        return batches[batchId];
    }

    function isBatchSettled(bytes32 batchId) external view returns (bool) {
        return batches[batchId].status == DataTypes.SettlementStatus.SETTLED;
    }
}
