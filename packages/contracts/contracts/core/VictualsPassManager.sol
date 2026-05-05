// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IVictualsPassManager} from "../interfaces/IVictualsPassManager.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract VictualsPassManager is AccessControl, IVictualsPassManager {
    mapping(bytes32 => DataTypes.PassState) private passes;

    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.REGISTRY_ROLE, admin);
        _grantRole(Roles.PROGRAM_ADMIN_ROLE, admin);
    }

    function issuePass(DataTypes.PassConfig calldata config, uint256 fundedAmount, uint256 expiresAt)
        external
        onlyRole(Roles.REGISTRY_ROLE)
    {
        if (config.passId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (config.beneficiary == address(0)) revert Errors.ZeroAddress();
        if (config.beneficiaryId == bytes32(0) || config.programId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (fundedAmount == 0) revert Errors.ZeroAmount();
        if (expiresAt <= block.timestamp) revert Errors.InvalidPolicy();
        if (passes[config.passId].passId != bytes32(0)) revert Errors.AlreadyBound();

        passes[config.passId] = DataTypes.PassState({
            passId: config.passId,
            beneficiary: config.beneficiary,
            beneficiaryId: config.beneficiaryId,
            programId: config.programId,
            fundedAmount: fundedAmount,
            consumedAmount: 0,
            reservedAmount: 0,
            activatedAt: 0,
            expiresAt: expiresAt,
            lastPeriodCheckpoint: block.timestamp,
            periodConsumedAmount: 0,
            categoryMaskOverride: config.categoryMaskOverride,
            status: DataTypes.PassStatus.CREATED
        });

        emit VictualsPassIssued(config.passId, config.programId, config.beneficiary);
    }

    function activatePass(bytes32 passId) external onlyRole(Roles.REGISTRY_ROLE) {
        DataTypes.PassState storage passState = passes[passId];
        if (passState.passId == bytes32(0)) revert Errors.NotBound();
        if (passState.status != DataTypes.PassStatus.CREATED) revert Errors.InvalidPassState();
        if (block.timestamp >= passState.expiresAt) revert Errors.PassExpired();

        passState.status = DataTypes.PassStatus.ACTIVE;
        passState.activatedAt = block.timestamp;

        emit VictualsPassActivated(passId);
        emit VictualsPassStateUpdated(passId, DataTypes.PassStatus.ACTIVE);
    }

    function suspendPass(bytes32 passId) external onlyRole(Roles.REGISTRY_ROLE) {
        DataTypes.PassState storage passState = passes[passId];
        if (passState.passId == bytes32(0)) revert Errors.NotBound();
        if (passState.status != DataTypes.PassStatus.ACTIVE) revert Errors.InvalidPassState();

        passState.status = DataTypes.PassStatus.SUSPENDED;

        emit VictualsPassSuspended(passId);
        emit VictualsPassStateUpdated(passId, DataTypes.PassStatus.SUSPENDED);
    }

    function expirePass(bytes32 passId) external onlyRole(Roles.REGISTRY_ROLE) {
        DataTypes.PassState storage passState = passes[passId];
        if (passState.passId == bytes32(0)) revert Errors.NotBound();
        if (passState.status == DataTypes.PassStatus.EXPIRED) revert Errors.InvalidPassState();

        passState.status = DataTypes.PassStatus.EXPIRED;

        emit VictualsPassExpired(passId);
        emit VictualsPassStateUpdated(passId, DataTypes.PassStatus.EXPIRED);
    }

    function reserveValue(bytes32 passId, uint256 amount) external onlyRole(Roles.MERCHANT_ROLE) {
        DataTypes.PassState storage passState = _activePass(passId);
        if (amount == 0) revert Errors.ZeroAmount();
        if (_availableValue(passState) < amount) revert Errors.InsufficientAvailableValue();

        passState.reservedAmount += amount;
    }

    function captureReservedValue(bytes32 passId, uint256 amount) external onlyRole(Roles.MERCHANT_ROLE) {
        DataTypes.PassState storage passState = _activePass(passId);
        if (amount == 0) revert Errors.ZeroAmount();
        if (passState.reservedAmount < amount) revert Errors.InsufficientAvailableValue();

        passState.reservedAmount -= amount;
        passState.consumedAmount += amount;
        passState.periodConsumedAmount += amount;
    }

    function releaseReservedValue(bytes32 passId, uint256 amount) external onlyRole(Roles.MERCHANT_ROLE) {
        DataTypes.PassState storage passState = passes[passId];
        if (passState.passId == bytes32(0)) revert Errors.NotBound();
        if (amount == 0) revert Errors.ZeroAmount();
        if (passState.reservedAmount < amount) revert Errors.InsufficientAvailableValue();

        passState.reservedAmount -= amount;
    }

    function getPass(bytes32 passId) external view returns (DataTypes.PassState memory) {
        return passes[passId];
    }

    function availableValue(bytes32 passId) external view returns (uint256) {
        DataTypes.PassState storage passState = passes[passId];
        if (passState.passId == bytes32(0)) return 0;
        return _availableValue(passState);
    }

    function isPassActive(bytes32 passId) external view returns (bool) {
        DataTypes.PassState storage passState = passes[passId];
        return passState.status == DataTypes.PassStatus.ACTIVE && block.timestamp < passState.expiresAt;
    }

    function _activePass(bytes32 passId) private view returns (DataTypes.PassState storage passState) {
        passState = passes[passId];
        if (passState.passId == bytes32(0)) revert Errors.NotBound();
        if (passState.status != DataTypes.PassStatus.ACTIVE) revert Errors.InvalidPassState();
        if (block.timestamp >= passState.expiresAt) revert Errors.PassExpired();
    }

    function _availableValue(DataTypes.PassState storage passState) private view returns (uint256) {
        if (passState.fundedAmount <= passState.consumedAmount + passState.reservedAmount) return 0;
        return passState.fundedAmount - passState.consumedAmount - passState.reservedAmount;
    }
}
