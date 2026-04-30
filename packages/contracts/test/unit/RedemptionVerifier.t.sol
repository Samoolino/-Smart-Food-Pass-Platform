// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {RedemptionVerifier} from "../../contracts/redemption/RedemptionVerifier.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract RedemptionVerifierTest is Test {
    RedemptionVerifier internal verifier;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);
    address internal merchant = address(0xCAFE);

    bytes32 internal redemptionId = keccak256("redemption-1");
    bytes32 internal primaryPassId = keccak256("primary-pass-1");
    bytes32 internal merchantId = keccak256("merchant-1");
    bytes32 internal basketHash = keccak256("basket-1");
    bytes32 internal passSetHash = keccak256("pass-a|pass-b|pass-c");
    bytes32 internal nutritionScopeHash = keccak256("combined-nutrition-scope-1");
    bytes32 internal nonce = keccak256("nonce-1");

    function setUp() public {
        vm.prank(admin);
        verifier = new RedemptionVerifier(admin);

        vm.prank(admin);
        verifier.grantRole(Roles.REGISTRY_ROLE, operator);

        vm.prank(admin);
        verifier.grantRole(Roles.MERCHANT_ROLE, merchant);
    }

    function _intent(bytes32 id, bytes32 intentNonce) internal view returns (DataTypes.RedemptionIntent memory) {
        return DataTypes.RedemptionIntent({
            redemptionId: id,
            primaryPassId: primaryPassId,
            merchantId: merchantId,
            basketHash: basketHash,
            passSetHash: passSetHash,
            nutritionScopeHash: nutritionScopeHash,
            valueLimit: 100 ether,
            expiresAt: block.timestamp + 1 days,
            nonce: intentNonce,
            status: DataTypes.RedemptionStatus.NONE
        });
    }

    function testRegisterIntentStoresMultiPassScope() public {
        vm.prank(operator);
        verifier.registerIntent(_intent(redemptionId, nonce));

        assertTrue(verifier.validateIntent(redemptionId));
        assertTrue(verifier.isNonceConsumed(nonce));

        DataTypes.RedemptionIntent memory stored = verifier.getIntent(redemptionId);
        assertEq(stored.primaryPassId, primaryPassId);
        assertEq(stored.passSetHash, passSetHash);
        assertEq(stored.nutritionScopeHash, nutritionScopeHash);
        assertEq(uint256(stored.status), uint256(DataTypes.RedemptionStatus.RESERVED));
    }

    function testCaptureIntentWorks() public {
        vm.prank(operator);
        verifier.registerIntent(_intent(redemptionId, nonce));

        vm.prank(merchant);
        verifier.captureIntent(redemptionId, 60 ether);

        assertFalse(verifier.validateIntent(redemptionId));
        DataTypes.RedemptionIntent memory stored = verifier.getIntent(redemptionId);
        assertEq(uint256(stored.status), uint256(DataTypes.RedemptionStatus.CAPTURED));
    }

    function testCannotCaptureAboveLimit() public {
        vm.prank(operator);
        verifier.registerIntent(_intent(redemptionId, nonce));

        vm.prank(merchant);
        vm.expectRevert();
        verifier.captureIntent(redemptionId, 101 ether);
    }

    function testDuplicateNonceRejected() public {
        vm.prank(operator);
        verifier.registerIntent(_intent(redemptionId, nonce));

        vm.prank(operator);
        vm.expectRevert();
        verifier.registerIntent(_intent(keccak256("redemption-2"), nonce));
    }

    function testVoidIntentWorks() public {
        vm.prank(operator);
        verifier.registerIntent(_intent(redemptionId, nonce));

        vm.prank(operator);
        verifier.voidIntent(redemptionId);

        assertFalse(verifier.validateIntent(redemptionId));
        DataTypes.RedemptionIntent memory stored = verifier.getIntent(redemptionId);
        assertEq(uint256(stored.status), uint256(DataTypes.RedemptionStatus.VOIDED));
    }

    function testUnauthorizedRegisterRejected() public {
        vm.expectRevert();
        verifier.registerIntent(_intent(redemptionId, nonce));
    }
}
