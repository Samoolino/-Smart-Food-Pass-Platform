// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IMerchantRegistry} from "../interfaces/IMerchantRegistry.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract MerchantRegistry is AccessControl, IMerchantRegistry {
    mapping(bytes32 => DataTypes.Merchant) private merchants;
    mapping(address => bytes32) private walletToMerchantId;

    event MerchantAdded(bytes32 indexed merchantId, address indexed settlementWallet);
    event SettlementWalletUpdated(bytes32 indexed merchantId, address indexed newWallet);
    event MerchantSuspended(bytes32 indexed merchantId);
    event MerchantReactivated(bytes32 indexed merchantId);

    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.REGISTRY_ROLE, admin);
    }

    function addMerchant(
        bytes32 merchantId,
        bytes32 legalEntityHash,
        address settlementWallet,
        bytes32 settlementRefHash,
        uint256 regionCode,
        uint256 categoryMask
    ) external onlyRole(Roles.REGISTRY_ROLE) {
        if (merchantId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (settlementWallet == address(0)) revert Errors.ZeroAddress();
        if (merchants[merchantId].merchantId != bytes32(0)) revert Errors.AlreadyBound();
        if (walletToMerchantId[settlementWallet] != bytes32(0)) revert Errors.AlreadyBound();

        merchants[merchantId] = DataTypes.Merchant({
            merchantId: merchantId,
            legalEntityHash: legalEntityHash,
            settlementWallet: settlementWallet,
            settlementRefHash: settlementRefHash,
            regionCode: regionCode,
            categoryMask: categoryMask,
            status: DataTypes.MerchantStatus.APPROVED,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        walletToMerchantId[settlementWallet] = merchantId;

        emit MerchantAdded(merchantId, settlementWallet);
    }

    function updateSettlementWallet(bytes32 merchantId, address newWallet)
        external
        onlyRole(Roles.REGISTRY_ROLE)
    {
        if (newWallet == address(0)) revert Errors.ZeroAddress();

        DataTypes.Merchant storage merchant = merchants[merchantId];
        if (merchant.merchantId == bytes32(0)) revert Errors.NotBound();
        if (walletToMerchantId[newWallet] != bytes32(0)) revert Errors.AlreadyBound();

        delete walletToMerchantId[merchant.settlementWallet];
        merchant.settlementWallet = newWallet;
        merchant.updatedAt = block.timestamp;
        walletToMerchantId[newWallet] = merchantId;

        emit SettlementWalletUpdated(merchantId, newWallet);
    }

    function suspendMerchant(bytes32 merchantId) external onlyRole(Roles.REGISTRY_ROLE) {
        DataTypes.Merchant storage merchant = merchants[merchantId];
        if (merchant.merchantId == bytes32(0)) revert Errors.NotBound();

        merchant.status = DataTypes.MerchantStatus.SUSPENDED;
        merchant.updatedAt = block.timestamp;

        emit MerchantSuspended(merchantId);
    }

    function reactivateMerchant(bytes32 merchantId) external onlyRole(Roles.REGISTRY_ROLE) {
        DataTypes.Merchant storage merchant = merchants[merchantId];
        if (merchant.merchantId == bytes32(0)) revert Errors.NotBound();

        merchant.status = DataTypes.MerchantStatus.APPROVED;
        merchant.updatedAt = block.timestamp;

        emit MerchantReactivated(merchantId);
    }

    function isApprovedMerchant(bytes32 merchantId) external view returns (bool) {
        return merchants[merchantId].status == DataTypes.MerchantStatus.APPROVED;
    }

    function merchantByWallet(address wallet) external view returns (bytes32) {
        return walletToMerchantId[wallet];
    }

    function getMerchant(bytes32 merchantId) external view returns (DataTypes.Merchant memory) {
        return merchants[merchantId];
    }
}
