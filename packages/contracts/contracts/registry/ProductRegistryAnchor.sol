// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IProductRegistryAnchor} from "../interfaces/IProductRegistryAnchor.sol";
import {Roles} from "../access/Roles.sol";
import {Errors} from "../libraries/Errors.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

contract ProductRegistryAnchor is AccessControl, IProductRegistryAnchor {
    mapping(bytes32 => DataTypes.ProductAnchor) private productAnchors;

    event ProductRegistered(bytes32 indexed productId, bytes32 indexed versionHash);
    event ProductVersionUpdated(bytes32 indexed productId, bytes32 indexed versionHash);
    event ProductDeactivated(bytes32 indexed productId);

    constructor(address admin) {
        if (admin == address(0)) revert Errors.ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.REGISTRY_ROLE, admin);
    }

    function registerProduct(
        bytes32 productId,
        bytes32 versionHash,
        uint256 categoryCode,
        uint256 nutritionClass,
        uint256 complianceCode,
        uint256 effectiveFrom,
        uint256 effectiveTo
    ) external onlyRole(Roles.REGISTRY_ROLE) {
        if (productId == bytes32(0) || versionHash == bytes32(0)) revert Errors.InvalidPolicy();
        if (productAnchors[productId].productId != bytes32(0)) revert Errors.InvalidPolicy();
        if (effectiveTo != 0 && effectiveTo < effectiveFrom) revert Errors.InvalidPolicy();

        productAnchors[productId] = DataTypes.ProductAnchor({
            productId: productId,
            versionHash: versionHash,
            categoryCode: categoryCode,
            nutritionClass: nutritionClass,
            complianceCode: complianceCode,
            status: DataTypes.ProductStatus.ACTIVE,
            effectiveFrom: effectiveFrom,
            effectiveTo: effectiveTo,
            lastUpdatedAt: block.timestamp
        });

        emit ProductRegistered(productId, versionHash);
    }

    function updateProductVersion(
        bytes32 productId,
        bytes32 newVersionHash,
        uint256 complianceCode,
        uint256 effectiveFrom,
        uint256 effectiveTo
    ) external onlyRole(Roles.REGISTRY_ROLE) {
        if (newVersionHash == bytes32(0)) revert Errors.InvalidPolicy();

        DataTypes.ProductAnchor storage anchor = productAnchors[productId];
        if (anchor.productId == bytes32(0)) revert Errors.InvalidPolicy();
        if (effectiveTo != 0 && effectiveTo < effectiveFrom) revert Errors.InvalidPolicy();

        anchor.versionHash = newVersionHash;
        anchor.complianceCode = complianceCode;
        anchor.effectiveFrom = effectiveFrom;
        anchor.effectiveTo = effectiveTo;
        anchor.lastUpdatedAt = block.timestamp;
        anchor.status = DataTypes.ProductStatus.ACTIVE;

        emit ProductVersionUpdated(productId, newVersionHash);
    }

    function deactivateProduct(bytes32 productId) external onlyRole(Roles.REGISTRY_ROLE) {
        DataTypes.ProductAnchor storage anchor = productAnchors[productId];
        if (anchor.productId == bytes32(0)) revert Errors.InvalidPolicy();

        anchor.status = DataTypes.ProductStatus.INACTIVE;
        anchor.lastUpdatedAt = block.timestamp;

        emit ProductDeactivated(productId);
    }

    function validateProduct(bytes32 productId) external view returns (bool) {
        DataTypes.ProductAnchor memory anchor = productAnchors[productId];
        if (anchor.productId == bytes32(0)) return false;
        if (anchor.status != DataTypes.ProductStatus.ACTIVE) return false;
        if (anchor.effectiveFrom != 0 && block.timestamp < anchor.effectiveFrom) return false;
        if (anchor.effectiveTo != 0 && block.timestamp > anchor.effectiveTo) return false;
        return true;
    }

    function getProductAnchor(bytes32 productId) external view returns (DataTypes.ProductAnchor memory) {
        return productAnchors[productId];
    }
}
