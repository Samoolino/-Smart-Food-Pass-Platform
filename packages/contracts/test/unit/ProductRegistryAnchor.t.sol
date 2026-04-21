// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ProductRegistryAnchor} from "../../contracts/registry/ProductRegistryAnchor.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract ProductRegistryAnchorTest is Test {
    ProductRegistryAnchor internal registry;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);

    bytes32 internal productId = keccak256("product-1");
    bytes32 internal versionHash = keccak256("version-1");
    bytes32 internal newVersionHash = keccak256("version-2");

    function setUp() public {
        registry = new ProductRegistryAnchor(admin);

        vm.prank(admin);
        registry.grantRole(Roles.REGISTRY_ROLE, operator);
    }

    function testActiveProductValidates() public {
        vm.prank(operator);
        registry.registerProduct(productId, versionHash, 4, 1, 200, block.timestamp - 1, block.timestamp + 10 days);

        assertTrue(registry.validateProduct(productId));
    }

    function testExpiredEffectiveWindowFails() public {
        vm.prank(operator);
        registry.registerProduct(productId, versionHash, 4, 1, 200, block.timestamp - 10 days, block.timestamp - 1);

        assertFalse(registry.validateProduct(productId));
    }

    function testDeactivatedProductFails() public {
        vm.startPrank(operator);
        registry.registerProduct(productId, versionHash, 4, 1, 200, block.timestamp - 1, block.timestamp + 10 days);
        registry.deactivateProduct(productId);
        vm.stopPrank();

        assertFalse(registry.validateProduct(productId));

        DataTypes.ProductAnchor memory anchor = registry.getProductAnchor(productId);
        assertEq(uint256(anchor.status), uint256(DataTypes.ProductStatus.DEACTIVATED));
    }

    function testUpdateVersionWorks() public {
        vm.startPrank(operator);
        registry.registerProduct(productId, versionHash, 4, 1, 200, block.timestamp - 1, block.timestamp + 10 days);
        registry.updateProductVersion(productId, newVersionHash, 300, block.timestamp - 1, block.timestamp + 20 days);
        vm.stopPrank();

        DataTypes.ProductAnchor memory anchor = registry.getProductAnchor(productId);
        assertEq(anchor.versionHash, newVersionHash);
        assertEq(anchor.complianceCode, 300);
    }
}
