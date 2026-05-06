// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IEntitlementScheduler} from "../interfaces/IEntitlementScheduler.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract EntitlementScheduler is AccessControl, IEntitlementScheduler {
    mapping(bytes32 => DataTypes.EntitlementSchedule) private schedules;

    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.REGISTRY_ROLE, admin);
        _grantRole(Roles.PROGRAM_ADMIN_ROLE, admin);
    }

    function createSchedule(DataTypes.EntitlementSchedule calldata schedule)
        external
        onlyRole(Roles.REGISTRY_ROLE)
    {
        if (schedule.passId == bytes32(0) || schedule.planId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (schedule.creditAmount == 0) revert Errors.ZeroAmount();
        if (schedule.creditIntervalDays == 0 || schedule.nextCreditAt == 0) revert Errors.InvalidPolicy();
        if (schedule.expiresAt != 0 && schedule.expiresAt <= schedule.nextCreditAt) revert Errors.InvalidPolicy();
        if (schedules[schedule.passId].passId != bytes32(0)) revert Errors.AlreadyBound();

        schedules[schedule.passId] = DataTypes.EntitlementSchedule({
            passId: schedule.passId,
            planId: schedule.planId,
            creditAmount: schedule.creditAmount,
            creditIntervalDays: schedule.creditIntervalDays,
            nextCreditAt: schedule.nextCreditAt,
            expiresAt: schedule.expiresAt,
            carryoverDays: schedule.carryoverDays,
            active: true
        });

        emit EntitlementScheduleCreated(schedule.passId, schedule.planId);
    }

    function updateSchedule(bytes32 passId, uint256 nextCreditAt, uint256 expiresAt)
        external
        onlyRole(Roles.REGISTRY_ROLE)
    {
        DataTypes.EntitlementSchedule storage schedule = schedules[passId];
        if (schedule.passId == bytes32(0)) revert Errors.NotBound();
        if (nextCreditAt == 0) revert Errors.InvalidPolicy();
        if (expiresAt != 0 && expiresAt <= nextCreditAt) revert Errors.InvalidPolicy();

        schedule.nextCreditAt = nextCreditAt;
        schedule.expiresAt = expiresAt;

        emit EntitlementScheduleUpdated(passId, nextCreditAt, expiresAt);
    }

    function anchorCredit(bytes32 passId, uint256 amount, uint256 creditedAt)
        external
        onlyRole(Roles.REGISTRY_ROLE)
    {
        DataTypes.EntitlementSchedule storage schedule = schedules[passId];
        if (schedule.passId == bytes32(0)) revert Errors.NotBound();
        if (!schedule.active) revert Errors.InvalidPolicy();
        if (amount == 0) revert Errors.ZeroAmount();
        if (creditedAt < schedule.nextCreditAt) revert Errors.InvalidPolicy();
        if (schedule.expiresAt != 0 && creditedAt >= schedule.expiresAt) revert Errors.InvalidPolicy();

        schedule.nextCreditAt = creditedAt + (schedule.creditIntervalDays * 1 days);

        emit EntitlementCreditAnchored(passId, amount, creditedAt);
        emit EntitlementScheduleUpdated(passId, schedule.nextCreditAt, schedule.expiresAt);
    }

    function disableSchedule(bytes32 passId) external onlyRole(Roles.REGISTRY_ROLE) {
        DataTypes.EntitlementSchedule storage schedule = schedules[passId];
        if (schedule.passId == bytes32(0)) revert Errors.NotBound();
        if (!schedule.active) revert Errors.InvalidPolicy();

        schedule.active = false;

        emit EntitlementScheduleDisabled(passId);
    }

    function getSchedule(bytes32 passId) external view returns (DataTypes.EntitlementSchedule memory) {
        return schedules[passId];
    }

    function isCreditDue(bytes32 passId, uint256 timestamp) external view returns (bool) {
        DataTypes.EntitlementSchedule memory schedule = schedules[passId];
        if (schedule.passId == bytes32(0)) return false;
        if (!schedule.active) return false;
        if (timestamp < schedule.nextCreditAt) return false;
        if (schedule.expiresAt != 0 && timestamp >= schedule.expiresAt) return false;
        return true;
    }
}
