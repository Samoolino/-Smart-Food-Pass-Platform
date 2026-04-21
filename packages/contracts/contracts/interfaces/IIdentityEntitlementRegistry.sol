// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IIdentityEntitlementRegistry {
    function bindWallet(address wallet, bytes32 beneficiaryId, bytes32 metadataHash) external;
    function unbindWallet(address wallet) external;
    function suspendBeneficiary(bytes32 beneficiaryId) external;
    function reactivateBeneficiary(bytes32 beneficiaryId) external;
    function isEntitled(address wallet) external view returns (bool);
    function getBeneficiaryId(address wallet) external view returns (bytes32);
    function beneficiaryWalletOf(bytes32 beneficiaryId) external view returns (address);
    function beneficiaryMetadataHashOf(bytes32 beneficiaryId) external view returns (bytes32);
}
