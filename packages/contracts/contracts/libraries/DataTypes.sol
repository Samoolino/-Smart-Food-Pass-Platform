// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library DataTypes {
    enum PassStatus {
        NONE,
        CREATED,
        ACTIVE,
        SUSPENDED,
        EXPIRED
    }

    enum RedemptionStatus {
        NONE,
        RESERVED,
        CAPTURED,
        VOIDED
    }

    enum MerchantStatus {
        NONE,
        APPROVED,
        SUSPENDED
    }

    enum ProductStatus {
        NONE,
        ACTIVE,
        DEACTIVATED
    }

    enum CadenceType {
        NONE,
        DAILY,
        WEEKLY,
        MONTHLY,
        CUSTOM
    }

    enum PlanStatus {
        NONE,
        DRAFT,
        ACTIVE,
        SUSPENDED,
        CLOSED
    }

    enum SettlementStatus {
        NONE,
        CREATED,
        READY,
        SETTLED,
        FAILED
    }

    struct PassConfig {
        bytes32 passId;
        address beneficiary;
        bytes32 beneficiaryId;
        bytes32 programId;
        uint256 categoryMaskOverride;
    }

    struct PassState {
        bytes32 passId;
        address beneficiary;
        bytes32 beneficiaryId;
        bytes32 programId;
        uint256 fundedAmount;
        uint256 consumedAmount;
        uint256 reservedAmount;
        uint256 activatedAt;
        uint256 expiresAt;
        uint256 lastPeriodCheckpoint;
        uint256 periodConsumedAmount;
        uint256 categoryMaskOverride;
        PassStatus status;
    }

    struct RedemptionRecord {
        bytes32 redemptionId;
        bytes32 passId;
        bytes32 merchantId;
        address beneficiary;
        bytes32 orderId;
        uint256 amount;
        RedemptionStatus status;
        uint256 createdAt;
        uint256 reservedAt;
        uint256 expiresAt;
        uint256 capturedAt;
    }

    struct Merchant {
        bytes32 merchantId;
        bytes32 legalEntityHash;
        address settlementWallet;
        bytes32 settlementRefHash;
        uint256 regionCode;
        uint256 categoryMask;
        MerchantStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct ProductAnchor {
        bytes32 productId;
        bytes32 versionHash;
        uint256 categoryCode;
        uint256 nutritionClass;
        uint256 complianceCode;
        ProductStatus status;
        uint256 effectiveFrom;
        uint256 effectiveTo;
        uint256 lastUpdatedAt;
    }

    struct ProgramPolicy {
        bytes32 programId;
        uint256 categoryMask;
        uint256 maxPerPeriod;
        uint256 totalCap;
        uint256 validityDays;
        CadenceType cadenceType;
        bool allowPartialRedemption;
        bool active;
    }

    struct SubscriptionPlan {
        bytes32 planId;
        bytes32 planMetadataHash;
        address purchaser;
        uint256 fundingValue;
        uint256 creditAmount;
        uint256 creditIntervalDays;
        uint256 validityDays;
        uint256 carryoverDays;
        uint256 maxIssuablePasses;
        uint256 issuedPasses;
        PlanStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct EntitlementSchedule {
        bytes32 passId;
        bytes32 planId;
        uint256 creditAmount;
        uint256 creditIntervalDays;
        uint256 nextCreditAt;
        uint256 expiresAt;
        uint256 carryoverDays;
        bool active;
    }

    struct NutritionPolicyVersion {
        bytes32 policyId;
        bytes32 versionHash;
        uint256 categoryMask;
        uint256 effectiveFrom;
        uint256 effectiveTo;
        bool active;
        uint256 lastUpdatedAt;
    }

    struct RedemptionIntent {
        bytes32 redemptionId;
        bytes32 passId;
        bytes32 merchantId;
        bytes32 basketHash;
        uint256 valueLimit;
        uint256 expiresAt;
        bytes32 nonce;
        RedemptionStatus status;
    }

    struct SettlementBatchAnchor {
        bytes32 batchId;
        bytes32 merchantId;
        bytes32 ledgerRootHash;
        uint256 totalAmount;
        SettlementStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }
}
