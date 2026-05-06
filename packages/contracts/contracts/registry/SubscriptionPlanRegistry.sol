// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ISubscriptionPlanRegistry} from "../interfaces/ISubscriptionPlanRegistry.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract SubscriptionPlanRegistry is AccessControl, ISubscriptionPlanRegistry {
    mapping(bytes32 => DataTypes.SubscriptionPlan) private plans;

    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.PROGRAM_ADMIN_ROLE, admin);
        _grantRole(Roles.REGISTRY_ROLE, admin);
    }

    function createPlan(DataTypes.SubscriptionPlan calldata plan) external onlyRole(Roles.PROGRAM_ADMIN_ROLE) {
        if (plan.planId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (plan.planMetadataHash == bytes32(0)) revert Errors.InvalidPolicy();
        if (plan.purchaser == address(0)) revert Errors.ZeroAddress();
        if (plan.fundingValue == 0 || plan.creditAmount == 0) revert Errors.ZeroAmount();
        if (plan.creditAmount > plan.fundingValue) revert Errors.InvalidPolicy();
        if (plan.creditIntervalDays == 0 || plan.validityDays == 0) revert Errors.InvalidPolicy();
        if (plans[plan.planId].planId != bytes32(0)) revert Errors.AlreadyBound();

        DataTypes.PlanStatus initialStatus = plan.status == DataTypes.PlanStatus.ACTIVE
            ? DataTypes.PlanStatus.ACTIVE
            : DataTypes.PlanStatus.DRAFT;

        plans[plan.planId] = DataTypes.SubscriptionPlan({
            planId: plan.planId,
            planMetadataHash: plan.planMetadataHash,
            purchaser: plan.purchaser,
            fundingValue: plan.fundingValue,
            creditAmount: plan.creditAmount,
            creditIntervalDays: plan.creditIntervalDays,
            validityDays: plan.validityDays,
            carryoverDays: plan.carryoverDays,
            maxIssuablePasses: plan.maxIssuablePasses,
            issuedPasses: 0,
            status: initialStatus,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit SubscriptionPlanCreated(plan.planId, plan.purchaser, plan.planMetadataHash);
        if (initialStatus == DataTypes.PlanStatus.ACTIVE) {
            emit SubscriptionPlanActivated(plan.planId);
        }
    }

    function updatePlan(bytes32 planId, bytes32 planMetadataHash) external onlyRole(Roles.PROGRAM_ADMIN_ROLE) {
        if (planMetadataHash == bytes32(0)) revert Errors.InvalidPolicy();

        DataTypes.SubscriptionPlan storage plan = plans[planId];
        if (plan.planId == bytes32(0)) revert Errors.NotBound();
        if (plan.status == DataTypes.PlanStatus.CLOSED) revert Errors.InvalidPolicy();

        plan.planMetadataHash = planMetadataHash;
        plan.updatedAt = block.timestamp;

        emit SubscriptionPlanUpdated(planId, planMetadataHash);
    }

    function activatePlan(bytes32 planId) external onlyRole(Roles.PROGRAM_ADMIN_ROLE) {
        DataTypes.SubscriptionPlan storage plan = plans[planId];
        if (plan.planId == bytes32(0)) revert Errors.NotBound();
        if (plan.status == DataTypes.PlanStatus.CLOSED) revert Errors.InvalidPolicy();

        plan.status = DataTypes.PlanStatus.ACTIVE;
        plan.updatedAt = block.timestamp;

        emit SubscriptionPlanActivated(planId);
    }

    function suspendPlan(bytes32 planId) external onlyRole(Roles.PROGRAM_ADMIN_ROLE) {
        DataTypes.SubscriptionPlan storage plan = plans[planId];
        if (plan.planId == bytes32(0)) revert Errors.NotBound();
        if (plan.status != DataTypes.PlanStatus.ACTIVE) revert Errors.InvalidPolicy();

        plan.status = DataTypes.PlanStatus.SUSPENDED;
        plan.updatedAt = block.timestamp;

        emit SubscriptionPlanSuspended(planId);
    }

    function closePlan(bytes32 planId) external onlyRole(Roles.PROGRAM_ADMIN_ROLE) {
        DataTypes.SubscriptionPlan storage plan = plans[planId];
        if (plan.planId == bytes32(0)) revert Errors.NotBound();
        if (plan.status == DataTypes.PlanStatus.CLOSED) revert Errors.InvalidPolicy();

        plan.status = DataTypes.PlanStatus.CLOSED;
        plan.updatedAt = block.timestamp;

        emit SubscriptionPlanClosed(planId);
    }

    function incrementIssuedPasses(bytes32 planId) external onlyRole(Roles.REGISTRY_ROLE) {
        DataTypes.SubscriptionPlan storage plan = plans[planId];
        if (plan.planId == bytes32(0)) revert Errors.NotBound();
        if (plan.status != DataTypes.PlanStatus.ACTIVE) revert Errors.InvalidPolicy();
        if (plan.maxIssuablePasses != 0 && plan.issuedPasses >= plan.maxIssuablePasses) {
            revert Errors.InvalidPolicy();
        }

        plan.issuedPasses += 1;
        plan.updatedAt = block.timestamp;
    }

    function getPlan(bytes32 planId) external view returns (DataTypes.SubscriptionPlan memory) {
        return plans[planId];
    }

    function isPlanActive(bytes32 planId) external view returns (bool) {
        return plans[planId].status == DataTypes.PlanStatus.ACTIVE;
    }
}
