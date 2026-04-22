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
        INACTIVE
    }

    enum CadenceType {
        NONE,
        DAILY,
        WEEKLY,
        MONTHLY,
        CUSTOM
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
}
