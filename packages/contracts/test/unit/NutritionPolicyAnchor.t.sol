// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {NutritionPolicyAnchor} from "../../contracts/policy/NutritionPolicyAnchor.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract NutritionPolicyAnchorTest is Test {
    NutritionPolicyAnchor internal anchor;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);

    bytes32 internal policyId = keccak256("nutrition-policy-1");
    bytes32 internal versionHash = keccak256("policy-version-1");

    function setUp() public {
        vm.prank(admin);
        anchor = new NutritionPolicyAnchor(admin);

        vm.prank(admin);
        anchor.grantRole(Roles.COMPLIANCE_ROLE, operator);
    }

    function _policy(uint256 effectiveFrom, uint256 effectiveTo)
        internal
        view
        returns (DataTypes.NutritionPolicyVersion memory)
    {
        return DataTypes.NutritionPolicyVersion({
            policyId: policyId,
            versionHash: versionHash,
            categoryMask: 0xff,
            effectiveFrom: effectiveFrom,
            effectiveTo: effectiveTo,
            active: true,
            lastUpdatedAt: 0
        });
    }

    function testAnchorPolicyVersionWorks() public {
        vm.prank(operator);
        anchor.anchorPolicyVersion(_policy(block.timestamp - 1, block.timestamp + 30 days));

        assertTrue(anchor.validatePolicyVersion(policyId));

        DataTypes.NutritionPolicyVersion memory stored = anchor.getPolicyVersion(policyId);
        assertEq(stored.policyId, policyId);
        assertEq(stored.versionHash, versionHash);
        assertEq(stored.categoryMask, 0xff);
        assertTrue(stored.active);
    }

    function testFuturePolicyNotYetValid() public {
        vm.prank(operator);
        anchor.anchorPolicyVersion(_policy(block.timestamp + 1 days, block.timestamp + 30 days));

        assertFalse(anchor.validatePolicyVersion(policyId));
    }

    function testExpiredPolicyInvalid() public {
        vm.prank(operator);
        anchor.anchorPolicyVersion(_policy(block.timestamp - 30 days, block.timestamp - 1));

        assertFalse(anchor.validatePolicyVersion(policyId));
    }

    function testDeactivatePolicyVersionWorks() public {
        vm.prank(operator);
        anchor.anchorPolicyVersion(_policy(block.timestamp - 1, block.timestamp + 30 days));

        vm.prank(operator);
        anchor.deactivatePolicyVersion(policyId);

        assertFalse(anchor.validatePolicyVersion(policyId));

        DataTypes.NutritionPolicyVersion memory stored = anchor.getPolicyVersion(policyId);
        assertFalse(stored.active);
    }

    function testUnauthorizedAnchorRejected() public {
        vm.expectRevert();
        anchor.anchorPolicyVersion(_policy(block.timestamp - 1, block.timestamp + 30 days));
    }
}
