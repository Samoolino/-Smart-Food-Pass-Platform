// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

interface IMerchantRegistry {
    function addMerchant(
        bytes32 merchantId,
        bytes32 legalEntityHash,
        address settlementWallet,
        bytes32 settlementRefHash,
        uint256 regionCode,
        uint256 categoryMask
    ) external;

    function updateSettlementWallet(bytes32 merchantId, address newWallet) external;
    function suspendMerchant(bytes32 merchantId) external;
    function reactivateMerchant(bytes32 merchantId) external;
    function isApprovedMerchant(bytes32 merchantId) external view returns (bool);
    function merchantByWallet(address wallet) external view returns (bytes32);
    function getMerchant(bytes32 merchantId) external view returns (DataTypes.Merchant memory);
}
