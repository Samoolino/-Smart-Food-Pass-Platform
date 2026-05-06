// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {INutritionPolicyAnchor} from "../interfaces/INutritionPolicyAnchor.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract NutritionPolicyAnchor is AccessControl, INutritionPolicyAnchor {
    mapping(bytes32 => DataTypes.NutritionPolicyVersion) private policyVersions;

    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.COMPLIANCE_ROLE, admin);
        _grantRole(Roles.REGISTRY_ROLE, admin);
    }

    function anchorPolicyVersion(DataTypes.NutritionPolicyVersion calldata policyVersion)
        external
        onlyRole(Roles.COMPLIANCE_ROLE)
    {
        if (policyVersion.policyId == bytes32(0) || policyVersion.versionHash == bytes32(0)) {
            revert Errors.InvalidIdentifier();
        }
        if (policyVersion.effectiveTo != 0 && policyVersion.effectiveTo <= policyVersion.effectiveFrom) {
            revert Errors.InvalidPolicy();
        }

        policyVersions[policyVersion.policyId] = DataTypes.NutritionPolicyVersion({
            policyId: policyVersion.policyId,
            versionHash: policyVersion.versionHash,
            categoryMask: policyVersion.categoryMask,
            effectiveFrom: policyVersion.effectiveFrom,
            effectiveTo: policyVersion.effectiveTo,
            active: true,
            lastUpdatedAt: block.timestamp
        });

        emit NutritionPolicyVersionAnchored(policyVersion.policyId, policyVersion.versionHash);
    }

    function deactivatePolicyVersion(bytes32 policyId) external onlyRole(Roles.COMPLIANCE_ROLE) {
        DataTypes.NutritionPolicyVersion storage policyVersion = policyVersions[policyId];
        if (policyVersion.policyId == bytes32(0)) revert Errors.NotBound();
        if (!policyVersion.active) revert Errors.InvalidPolicy();

        policyVersion.active = false;
        policyVersion.lastUpdatedAt = block.timestamp;

        emit NutritionPolicyVersionDeactivated(policyId);
    }

    function validatePolicyVersion(bytes32 policyId) external view returns (bool) {
        DataTypes.NutritionPolicyVersion memory policyVersion = policyVersions[policyId];
        if (policyVersion.policyId == bytes32(0)) return false;
        if (!policyVersion.active) return false;
        if (policyVersion.effectiveFrom != 0 && block.timestamp < policyVersion.effectiveFrom) return false;
        if (policyVersion.effectiveTo != 0 && block.timestamp >= policyVersion.effectiveTo) return false;
        return true;
    }

    function getPolicyVersion(bytes32 policyId) external view returns (DataTypes.NutritionPolicyVersion memory) {
        return policyVersions[policyId];
    }
}
