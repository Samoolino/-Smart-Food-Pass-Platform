// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

interface IRedemptionVerifier {
    event RedemptionIntentRegistered(
        bytes32 indexed redemptionId,
        bytes32 indexed primaryPassId,
        bytes32 indexed merchantId,
        bytes32 passSetHash,
        bytes32 nutritionScopeHash
    );
    event RedemptionIntentCaptured(bytes32 indexed redemptionId, uint256 amount);
    event RedemptionIntentVoided(bytes32 indexed redemptionId);
    event RedemptionNonceConsumed(bytes32 indexed nonce);

    function registerIntent(DataTypes.RedemptionIntent calldata intent) external;
    function captureIntent(bytes32 redemptionId, uint256 amount) external;
    function voidIntent(bytes32 redemptionId) external;
    function isNonceConsumed(bytes32 nonce) external view returns (bool);
    function validateIntent(bytes32 redemptionId) external view returns (bool);
    function getIntent(bytes32 redemptionId) external view returns (DataTypes.RedemptionIntent memory);
}
