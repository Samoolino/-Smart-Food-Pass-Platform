// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ICompliancePolicy} from "../interfaces/ICompliancePolicy.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract CompliancePolicy is AccessControl, ICompliancePolicy {
    mapping(bytes32 => DataTypes.ProgramPolicy) private programPolicies;

    event ProgramPolicySet(bytes32 indexed programId);
    event ProgramPolicyDisabled(bytes32 indexed programId);

    constructor(address admin) {
        if (admin == address(0)) revert Errors.InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.COMPLIANCE_ROLE, admin);
    }

    function setProgramPolicy(bytes32 programId, DataTypes.ProgramPolicy calldata policy)
        external
        onlyRole(Roles.COMPLIANCE_ROLE)
    {
        if (programId == bytes32(0)) revert Errors.InvalidPolicy();
        if (policy.programId != programId) revert Errors.InvalidPolicy();
        if (policy.totalCap == 0) revert Errors.InvalidPolicy();
        if (policy.maxPerPeriod > policy.totalCap) revert Errors.InvalidPolicy();
        if (policy.validityDays == 0) revert Errors.InvalidPolicy();

        programPolicies[programId] = policy;
        emit ProgramPolicySet(programId);
    }

    function disableProgramPolicy(bytes32 programId) external onlyRole(Roles.COMPLIANCE_ROLE) {
        DataTypes.ProgramPolicy storage policy = programPolicies[programId];
        if (policy.programId == bytes32(0)) revert Errors.InvalidPolicy();

        policy.active = false;
        emit ProgramPolicyDisabled(programId);
    }

    function isCategoryAllowed(bytes32 programId, uint256 categoryCode) external view returns (bool) {
        DataTypes.ProgramPolicy memory policy = programPolicies[programId];
        if (!policy.active) return false;
        if (categoryCode >= 256) return false;

        uint256 mask = (uint256(1) << categoryCode);
        return (policy.categoryMask & mask) != 0;
    }

    function getProgramPolicy(bytes32 programId) external view returns (DataTypes.ProgramPolicy memory) {
        return programPolicies[programId];
    }
}
