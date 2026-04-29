// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

interface INutritionPolicyAnchor {
    event NutritionPolicyVersionAnchored(bytes32 indexed policyId, bytes32 indexed versionHash);
    event NutritionPolicyVersionDeactivated(bytes32 indexed policyId);

    function anchorPolicyVersion(DataTypes.NutritionPolicyVersion calldata policyVersion) external;
    function deactivatePolicyVersion(bytes32 policyId) external;
    function validatePolicyVersion(bytes32 policyId) external view returns (bool);
    function getPolicyVersion(bytes32 policyId) external view returns (DataTypes.NutritionPolicyVersion memory);
}
