// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SubscriptionPlanRegistry} from "../../contracts/registry/SubscriptionPlanRegistry.sol";
import {VictualsPassManager} from "../../contracts/core/VictualsPassManager.sol";
import {EntitlementScheduler} from "../../contracts/core/EntitlementScheduler.sol";
import {NutritionPolicyAnchor} from "../../contracts/policy/NutritionPolicyAnchor.sol";
import {RedemptionVerifier} from "../../contracts/redemption/RedemptionVerifier.sol";
import {SettlementAnchor} from "../../contracts/settlement/SettlementAnchor.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract VictualsLifecycleIntegrationTest is Test {
    SubscriptionPlanRegistry internal planRegistry;
    VictualsPassManager internal passManager;
    EntitlementScheduler internal scheduler;
    NutritionPolicyAnchor internal nutritionAnchor;
    RedemptionVerifier internal redemptionVerifier;
    SettlementAnchor internal settlementAnchor;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);
    address internal merchantOperator = address(0xCAFE);
    address internal treasury = address(0xD00D);
    address internal purchaser = address(0xF00D);
    address internal passHolder = address(0xFACE);

    bytes32 internal planId = keccak256("target-nutrition-plan-package");
    bytes32 internal planMetadataHash = keccak256("products-matrix-target-value-v1");
    bytes32 internal passId = keccak256("pass-1");
    bytes32 internal passIdTwo = keccak256("pass-2");
    bytes32 internal holderRef = keccak256("holder-ref-1");
    bytes32 internal policyId = keccak256("nutrition-policy-1");
    bytes32 internal policyVersionHash = keccak256("nutrition-matrix-v1");
    bytes32 internal merchantId = keccak256("merchant-1");
    bytes32 internal redemptionId = keccak256("redemption-1");
    bytes32 internal basketHash = keccak256("approved-products-basket-1");
    bytes32 internal passSetHash = keccak256("pass-1|pass-2");
    bytes32 internal nutritionScopeHash = keccak256("combined-nutrition-goals-v1");
    bytes32 internal nonce = keccak256("redemption-nonce-1");
    bytes32 internal settlementBatchId = keccak256("settlement-batch-1");
    bytes32 internal ledgerRootHash = keccak256("ledger-root-redemption-1");

    function setUp() public {
        vm.startPrank(admin);
        planRegistry = new SubscriptionPlanRegistry(admin);
        passManager = new VictualsPassManager(admin);
        scheduler = new EntitlementScheduler(admin);
        nutritionAnchor = new NutritionPolicyAnchor(admin);
        redemptionVerifier = new RedemptionVerifier(admin);
        settlementAnchor = new SettlementAnchor(admin);

        planRegistry.grantRole(Roles.PROGRAM_ADMIN_ROLE, operator);
        planRegistry.grantRole(Roles.REGISTRY_ROLE, operator);
        passManager.grantRole(Roles.REGISTRY_ROLE, operator);
        passManager.grantRole(Roles.MERCHANT_ROLE, merchantOperator);
        scheduler.grantRole(Roles.REGISTRY_ROLE, operator);
        nutritionAnchor.grantRole(Roles.COMPLIANCE_ROLE, operator);
        redemptionVerifier.grantRole(Roles.REGISTRY_ROLE, operator);
        redemptionVerifier.grantRole(Roles.MERCHANT_ROLE, merchantOperator);
        settlementAnchor.grantRole(Roles.SETTLEMENT_SIGNER_ROLE, operator);
        settlementAnchor.grantRole(Roles.TREASURY_ROLE, treasury);
        vm.stopPrank();
    }

    function testPlanPassSchedulePolicyRedemptionSettlementFlow() public {
        uint256 planValue = 1_000 ether;
        uint256 creditValue = 100 ether;
        uint256 redemptionValue = 75 ether;

        vm.prank(operator);
        planRegistry.createPlan(DataTypes.SubscriptionPlan({
            planId: planId,
            planMetadataHash: planMetadataHash,
            purchaser: purchaser,
            fundingValue: planValue,
            creditAmount: creditValue,
            creditIntervalDays: 14,
            validityDays: 365,
            carryoverDays: 70,
            maxIssuablePasses: 2,
            issuedPasses: 0,
            status: DataTypes.PlanStatus.ACTIVE,
            createdAt: 0,
            updatedAt: 0
        }));

        assertTrue(planRegistry.isPlanActive(planId));

        vm.prank(operator);
        planRegistry.incrementIssuedPasses(planId);

        vm.prank(operator);
        passManager.issuePass(DataTypes.PassConfig({
            passId: passId,
            beneficiary: passHolder,
            beneficiaryId: holderRef,
            programId: planId,
            categoryMaskOverride: 0xff
        }), creditValue, block.timestamp + 90 days);

        vm.prank(operator);
        passManager.activatePass(passId);

        assertTrue(passManager.isPassActive(passId));
        assertEq(passManager.availableValue(passId), creditValue);

        uint256 firstCreditAt = block.timestamp + 14 days;

        vm.prank(operator);
        scheduler.createSchedule(DataTypes.EntitlementSchedule({
            passId: passId,
            planId: planId,
            creditAmount: creditValue,
            creditIntervalDays: 14,
            nextCreditAt: firstCreditAt,
            expiresAt: block.timestamp + 90 days,
            carryoverDays: 70,
            active: true
        }));

        assertTrue(scheduler.isCreditDue(passId, firstCreditAt));

        vm.prank(operator);
        nutritionAnchor.anchorPolicyVersion(DataTypes.NutritionPolicyVersion({
            policyId: policyId,
            versionHash: policyVersionHash,
            categoryMask: 0xff,
            effectiveFrom: block.timestamp - 1,
            effectiveTo: block.timestamp + 365 days,
            active: true,
            lastUpdatedAt: 0
        }));

        assertTrue(nutritionAnchor.validatePolicyVersion(policyId));

        vm.prank(operator);
        redemptionVerifier.registerIntent(DataTypes.RedemptionIntent({
            redemptionId: redemptionId,
            primaryPassId: passId,
            merchantId: merchantId,
            basketHash: basketHash,
            passSetHash: passSetHash,
            nutritionScopeHash: nutritionScopeHash,
            valueLimit: redemptionValue,
            expiresAt: block.timestamp + 1 days,
            nonce: nonce,
            status: DataTypes.RedemptionStatus.NONE
        }));

        assertTrue(redemptionVerifier.validateIntent(redemptionId));
        assertTrue(redemptionVerifier.isNonceConsumed(nonce));

        DataTypes.RedemptionIntent memory intent = redemptionVerifier.getIntent(redemptionId);
        assertEq(intent.primaryPassId, passId);
        assertEq(intent.passSetHash, passSetHash);
        assertEq(intent.nutritionScopeHash, nutritionScopeHash);

        vm.prank(merchantOperator);
        passManager.reserveValue(passId, redemptionValue);

        vm.prank(merchantOperator);
        redemptionVerifier.captureIntent(redemptionId, redemptionValue);

        vm.prank(merchantOperator);
        passManager.captureReservedValue(passId, redemptionValue);

        assertEq(passManager.availableValue(passId), creditValue - redemptionValue);

        vm.prank(operator);
        settlementAnchor.createBatch(DataTypes.SettlementBatchAnchor({
            batchId: settlementBatchId,
            merchantId: merchantId,
            ledgerRootHash: ledgerRootHash,
            totalAmount: redemptionValue,
            status: DataTypes.SettlementStatus.NONE,
            createdAt: 0,
            updatedAt: 0
        }));

        vm.prank(operator);
        settlementAnchor.markBatchReady(settlementBatchId);

        vm.prank(treasury);
        settlementAnchor.markBatchSettled(settlementBatchId);

        assertTrue(settlementAnchor.isBatchSettled(settlementBatchId));
    }
}
