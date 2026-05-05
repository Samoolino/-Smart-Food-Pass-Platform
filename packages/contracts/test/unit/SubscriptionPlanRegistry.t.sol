// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SubscriptionPlanRegistry} from "../../contracts/registry/SubscriptionPlanRegistry.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract SubscriptionPlanRegistryTest is Test {
    SubscriptionPlanRegistry internal registry;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);
    address internal purchaser = address(0xCAFE);

    bytes32 internal planId = keccak256("victuals-plan-1");
    bytes32 internal metadataHash = keccak256("plan-metadata-v1");
    bytes32 internal updatedMetadataHash = keccak256("plan-metadata-v2");

    function setUp() public {
        vm.prank(admin);
        registry = new SubscriptionPlanRegistry(admin);

        vm.prank(admin);
        registry.grantRole(Roles.PROGRAM_ADMIN_ROLE, operator);

        vm.prank(admin);
        registry.grantRole(Roles.REGISTRY_ROLE, operator);
    }

    function _plan(DataTypes.PlanStatus status) internal view returns (DataTypes.SubscriptionPlan memory) {
        return DataTypes.SubscriptionPlan({
            planId: planId,
            planMetadataHash: metadataHash,
            purchaser: purchaser,
            fundingValue: 1_000 ether,
            creditAmount: 50 ether,
            creditIntervalDays: 14,
            validityDays: 365,
            carryoverDays: 70,
            maxIssuablePasses: 10,
            issuedPasses: 0,
            status: status,
            createdAt: 0,
            updatedAt: 0
        });
    }

    function testCreateActivePlanWorks() public {
        vm.prank(operator);
        registry.createPlan(_plan(DataTypes.PlanStatus.ACTIVE));

        assertTrue(registry.isPlanActive(planId));

        DataTypes.SubscriptionPlan memory stored = registry.getPlan(planId);
        assertEq(stored.planId, planId);
        assertEq(stored.planMetadataHash, metadataHash);
        assertEq(stored.purchaser, purchaser);
        assertEq(stored.fundingValue, 1_000 ether);
        assertEq(uint256(stored.status), uint256(DataTypes.PlanStatus.ACTIVE));
    }

    function testCreateDraftThenActivateWorks() public {
        vm.prank(operator);
        registry.createPlan(_plan(DataTypes.PlanStatus.DRAFT));

        assertFalse(registry.isPlanActive(planId));

        vm.prank(operator);
        registry.activatePlan(planId);

        assertTrue(registry.isPlanActive(planId));
    }

    function testUpdatePlanMetadataWorks() public {
        vm.prank(operator);
        registry.createPlan(_plan(DataTypes.PlanStatus.ACTIVE));

        vm.prank(operator);
        registry.updatePlan(planId, updatedMetadataHash);

        DataTypes.SubscriptionPlan memory stored = registry.getPlan(planId);
        assertEq(stored.planMetadataHash, updatedMetadataHash);
    }

    function testIssuedPassLimitEnforced() public {
        vm.prank(operator);
        registry.createPlan(_plan(DataTypes.PlanStatus.ACTIVE));

        for (uint256 i = 0; i < 10; i++) {
            vm.prank(operator);
            registry.incrementIssuedPasses(planId);
        }

        vm.prank(operator);
        vm.expectRevert();
        registry.incrementIssuedPasses(planId);
    }

    function testUnauthorizedCreateRejected() public {
        vm.expectRevert();
        registry.createPlan(_plan(DataTypes.PlanStatus.ACTIVE));
    }
}
