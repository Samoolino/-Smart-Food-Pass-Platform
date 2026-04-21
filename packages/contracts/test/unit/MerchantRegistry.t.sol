// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MerchantRegistry} from "../../contracts/registry/MerchantRegistry.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract MerchantRegistryTest is Test {
    MerchantRegistry internal registry;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);
    address internal settlementWallet = address(0xCAFE);
    address internal newSettlementWallet = address(0xD00D);
    address internal stranger = address(0xF00D);

    bytes32 internal merchantId = keccak256("merchant-1");
    bytes32 internal legalEntityHash = keccak256("legal-entity");
    bytes32 internal settlementRefHash = keccak256("settlement-ref");

    function setUp() public {
        vm.prank(admin);
        registry = new MerchantRegistry(admin);

        vm.prank(admin);
        registry.grantRole(Roles.REGISTRY_ROLE, operator);
    }

    function testApprovedMerchantRecognized() public {
        vm.prank(operator);
        registry.addMerchant(merchantId, legalEntityHash, settlementWallet, settlementRefHash, 566, 0xff);

        assertTrue(registry.isApprovedMerchant(merchantId));
        assertEq(registry.merchantByWallet(settlementWallet), merchantId);

        DataTypes.Merchant memory merchant = registry.getMerchant(merchantId);
        assertEq(merchant.settlementWallet, settlementWallet);
        assertEq(uint256(merchant.status), uint256(DataTypes.MerchantStatus.APPROVED));
    }

    function testSuspendedMerchantBlockedFromApprovedState() public {
        vm.startPrank(operator);
        registry.addMerchant(merchantId, legalEntityHash, settlementWallet, settlementRefHash, 566, 0xff);
        registry.suspendMerchant(merchantId);
        vm.stopPrank();

        assertFalse(registry.isApprovedMerchant(merchantId));
    }

    function testUpdateSettlementWalletWorks() public {
        vm.startPrank(operator);
        registry.addMerchant(merchantId, legalEntityHash, settlementWallet, settlementRefHash, 566, 0xff);
        registry.updateSettlementWallet(merchantId, newSettlementWallet);
        vm.stopPrank();

        assertEq(registry.merchantByWallet(settlementWallet), bytes32(0));
        assertEq(registry.merchantByWallet(newSettlementWallet), merchantId);

        DataTypes.Merchant memory merchant = registry.getMerchant(merchantId);
        assertEq(merchant.settlementWallet, newSettlementWallet);
    }

    function testUnauthorizedUpdateRejected() public {
        vm.prank(operator);
        registry.addMerchant(merchantId, legalEntityHash, settlementWallet, settlementRefHash, 566, 0xff);

        vm.prank(stranger);
        vm.expectRevert();
        registry.updateSettlementWallet(merchantId, newSettlementWallet);
    }
}
