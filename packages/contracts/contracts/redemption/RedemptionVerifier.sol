// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IRedemptionVerifier} from "../interfaces/IRedemptionVerifier.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract RedemptionVerifier is AccessControl, IRedemptionVerifier {
    mapping(bytes32 => DataTypes.RedemptionIntent) private intents;
    mapping(bytes32 => bool) private consumedNonces;

    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.REGISTRY_ROLE, admin);
        _grantRole(Roles.MERCHANT_ROLE, admin);
    }

    function registerIntent(DataTypes.RedemptionIntent calldata intent) external onlyRole(Roles.REGISTRY_ROLE) {
        if (intent.redemptionId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (intent.primaryPassId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (intent.merchantId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (intent.basketHash == bytes32(0)) revert Errors.InvalidIdentifier();
        if (intent.passSetHash == bytes32(0)) revert Errors.InvalidIdentifier();
        if (intent.nutritionScopeHash == bytes32(0)) revert Errors.InvalidIdentifier();
        if (intent.nonce == bytes32(0)) revert Errors.InvalidIdentifier();
        if (intent.valueLimit == 0) revert Errors.ZeroAmount();
        if (intent.expiresAt <= block.timestamp) revert Errors.InvalidPolicy();
        if (intents[intent.redemptionId].redemptionId != bytes32(0)) revert Errors.AlreadyBound();
        if (consumedNonces[intent.nonce]) revert Errors.DuplicateOrderId();

        intents[intent.redemptionId] = DataTypes.RedemptionIntent({
            redemptionId: intent.redemptionId,
            primaryPassId: intent.primaryPassId,
            merchantId: intent.merchantId,
            basketHash: intent.basketHash,
            passSetHash: intent.passSetHash,
            nutritionScopeHash: intent.nutritionScopeHash,
            valueLimit: intent.valueLimit,
            expiresAt: intent.expiresAt,
            nonce: intent.nonce,
            status: DataTypes.RedemptionStatus.RESERVED
        });

        consumedNonces[intent.nonce] = true;

        emit RedemptionNonceConsumed(intent.nonce);
        emit RedemptionIntentRegistered(
            intent.redemptionId,
            intent.primaryPassId,
            intent.merchantId,
            intent.passSetHash,
            intent.nutritionScopeHash
        );
    }

    function captureIntent(bytes32 redemptionId, uint256 amount) external onlyRole(Roles.MERCHANT_ROLE) {
        DataTypes.RedemptionIntent storage intent = intents[redemptionId];
        if (intent.redemptionId == bytes32(0)) revert Errors.NotBound();
        if (intent.status != DataTypes.RedemptionStatus.RESERVED) revert Errors.RedemptionNotCapturable();
        if (amount == 0) revert Errors.ZeroAmount();
        if (amount > intent.valueLimit) revert Errors.InsufficientAvailableValue();
        if (block.timestamp >= intent.expiresAt) revert Errors.RedemptionNotCapturable();

        intent.status = DataTypes.RedemptionStatus.CAPTURED;

        emit RedemptionIntentCaptured(redemptionId, amount);
    }

    function voidIntent(bytes32 redemptionId) external onlyRole(Roles.REGISTRY_ROLE) {
        DataTypes.RedemptionIntent storage intent = intents[redemptionId];
        if (intent.redemptionId == bytes32(0)) revert Errors.NotBound();
        if (intent.status != DataTypes.RedemptionStatus.RESERVED) revert Errors.RedemptionNotReservable();

        intent.status = DataTypes.RedemptionStatus.VOIDED;

        emit RedemptionIntentVoided(redemptionId);
    }

    function isNonceConsumed(bytes32 nonce) external view returns (bool) {
        return consumedNonces[nonce];
    }

    function validateIntent(bytes32 redemptionId) external view returns (bool) {
        DataTypes.RedemptionIntent memory intent = intents[redemptionId];
        if (intent.redemptionId == bytes32(0)) return false;
        if (intent.status != DataTypes.RedemptionStatus.RESERVED) return false;
        if (block.timestamp >= intent.expiresAt) return false;
        return true;
    }

    function getIntent(bytes32 redemptionId) external view returns (DataTypes.RedemptionIntent memory) {
        return intents[redemptionId];
    }
}
