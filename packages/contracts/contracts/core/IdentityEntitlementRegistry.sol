// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IIdentityEntitlementRegistry} from "../interfaces/IIdentityEntitlementRegistry.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";

contract IdentityEntitlementRegistry is AccessControl, IIdentityEntitlementRegistry {
    mapping(address => bytes32) private walletToBeneficiaryId;
    mapping(bytes32 => bool) private beneficiaryActive;
    mapping(bytes32 => address) private beneficiaryWallet;
    mapping(bytes32 => bytes32) private beneficiaryMetadataHash;

    event WalletBound(address indexed wallet, bytes32 indexed beneficiaryId, bytes32 metadataHash);
    event WalletUnbound(address indexed wallet, bytes32 indexed beneficiaryId);
    event BeneficiarySuspended(bytes32 indexed beneficiaryId);
    event BeneficiaryReactivated(bytes32 indexed beneficiaryId);

    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.REGISTRY_ROLE, admin);
    }

    function bindWallet(address wallet, bytes32 beneficiaryId, bytes32 metadataHash)
        external
        onlyRole(Roles.REGISTRY_ROLE)
    {
        if (wallet == address(0)) revert Errors.ZeroAddress();
        if (beneficiaryId == bytes32(0)) revert Errors.InvalidIdentifier();
        if (walletToBeneficiaryId[wallet] != bytes32(0)) revert Errors.AlreadyBound();

        address currentWallet = beneficiaryWallet[beneficiaryId];
        if (currentWallet != address(0) && currentWallet != wallet) revert Errors.AlreadyBound();

        walletToBeneficiaryId[wallet] = beneficiaryId;
        beneficiaryWallet[beneficiaryId] = wallet;
        beneficiaryMetadataHash[beneficiaryId] = metadataHash;
        beneficiaryActive[beneficiaryId] = true;

        emit WalletBound(wallet, beneficiaryId, metadataHash);
    }

    function unbindWallet(address wallet) external onlyRole(Roles.REGISTRY_ROLE) {
        bytes32 beneficiaryId = walletToBeneficiaryId[wallet];
        if (beneficiaryId == bytes32(0)) revert Errors.NotBound();

        delete walletToBeneficiaryId[wallet];
        delete beneficiaryWallet[beneficiaryId];

        emit WalletUnbound(wallet, beneficiaryId);
    }

    function suspendBeneficiary(bytes32 beneficiaryId) external onlyRole(Roles.REGISTRY_ROLE) {
        if (beneficiaryWallet[beneficiaryId] == address(0) && !beneficiaryActive[beneficiaryId]) {
            revert Errors.NotBound();
        }

        beneficiaryActive[beneficiaryId] = false;
        emit BeneficiarySuspended(beneficiaryId);
    }

    function reactivateBeneficiary(bytes32 beneficiaryId) external onlyRole(Roles.REGISTRY_ROLE) {
        if (beneficiaryWallet[beneficiaryId] == address(0)) revert Errors.NotBound();

        beneficiaryActive[beneficiaryId] = true;
        emit BeneficiaryReactivated(beneficiaryId);
    }

    function isEntitled(address wallet) external view returns (bool) {
        bytes32 beneficiaryId = walletToBeneficiaryId[wallet];
        if (beneficiaryId == bytes32(0)) return false;
        return beneficiaryActive[beneficiaryId];
    }

    function getBeneficiaryId(address wallet) external view returns (bytes32) {
        return walletToBeneficiaryId[wallet];
    }

    function beneficiaryWalletOf(bytes32 beneficiaryId) external view returns (address) {
        return beneficiaryWallet[beneficiaryId];
    }

    function beneficiaryMetadataHashOf(bytes32 beneficiaryId) external view returns (bytes32) {
        return beneficiaryMetadataHash[beneficiaryId];
    }
}
