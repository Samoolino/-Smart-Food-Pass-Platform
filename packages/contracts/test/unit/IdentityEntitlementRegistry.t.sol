// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IdentityEntitlementRegistry} from "../../contracts/core/IdentityEntitlementRegistry.sol";
import {Roles} from "../../contracts/access/Roles.sol";

contract IdentityEntitlementRegistryTest is Test {
    IdentityEntitlementRegistry internal registry;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);
    address internal wallet = address(0xCAFE);
    address internal otherWallet = address(0xD00D);

    bytes32 internal beneficiaryId = keccak256("beneficiary-1");
    bytes32 internal metadataHash = keccak256("meta-1");

    function setUp() public {
        vm.prank(admin);
        registry = new IdentityEntitlementRegistry(admin);

        vm.prank(admin);
        registry.grantRole(Roles.REGISTRY_ROLE, operator);
    }

    function testBindWalletSuccess() public {
        vm.prank(operator);
        registry.bindWallet(wallet, beneficiaryId, metadataHash);

        assertEq(registry.getBeneficiaryId(wallet), beneficiaryId);
        assertEq(registry.beneficiaryWalletOf(beneficiaryId), wallet);
        assertEq(registry.beneficiaryMetadataHashOf(beneficiaryId), metadataHash);
        assertTrue(registry.isEntitled(wallet));
    }

    function testDuplicateBindRejectedForWallet() public {
        vm.startPrank(operator);
        registry.bindWallet(wallet, beneficiaryId, metadataHash);
        vm.expectRevert();
        registry.bindWallet(wallet, keccak256("beneficiary-2"), keccak256("meta-2"));
        vm.stopPrank();
    }

    function testDuplicateBindRejectedForBeneficiary() public {
        vm.startPrank(operator);
        registry.bindWallet(wallet, beneficiaryId, metadataHash);
        vm.expectRevert();
        registry.bindWallet(otherWallet, beneficiaryId, keccak256("meta-2"));
        vm.stopPrank();
    }

    function testSuspendedBeneficiaryNotEntitled() public {
        vm.startPrank(operator);
        registry.bindWallet(wallet, beneficiaryId, metadataHash);
        registry.suspendBeneficiary(beneficiaryId);
        vm.stopPrank();

        assertFalse(registry.isEntitled(wallet));
    }

    function testReactivateBeneficiaryRestoresEntitlement() public {
        vm.startPrank(operator);
        registry.bindWallet(wallet, beneficiaryId, metadataHash);
        registry.suspendBeneficiary(beneficiaryId);
        registry.reactivateBeneficiary(beneficiaryId);
        vm.stopPrank();

        assertTrue(registry.isEntitled(wallet));
    }

    function testUnbindPreservesInactiveEntitlementStateButRemovesWalletLink() public {
        vm.prank(operator);
        registry.bindWallet(wallet, beneficiaryId, metadataHash);

        vm.prank(operator);
        registry.unbindWallet(wallet);

        assertEq(registry.getBeneficiaryId(wallet), bytes32(0));
        assertEq(registry.beneficiaryWalletOf(beneficiaryId), address(0));
        assertFalse(registry.isEntitled(wallet));
    }
}
