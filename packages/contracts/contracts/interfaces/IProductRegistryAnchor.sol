// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

interface IProductRegistryAnchor {
    function registerProduct(
        bytes32 productId,
        bytes32 versionHash,
        uint256 categoryCode,
        uint256 nutritionClass,
        uint256 complianceCode,
        uint256 effectiveFrom,
        uint256 effectiveTo
    ) external;

    function updateProductVersion(
        bytes32 productId,
        bytes32 newVersionHash,
        uint256 complianceCode,
        uint256 effectiveFrom,
        uint256 effectiveTo
    ) external;

    function deactivateProduct(bytes32 productId) external;
    function validateProduct(bytes32 productId) external view returns (bool);
    function getProductAnchor(bytes32 productId) external view returns (DataTypes.ProductAnchor memory);
}
