// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CompliancePolicy} from "../../contracts/policy/CompliancePolicy.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract CompliancePolicyTest is Test {
    CompliancePolicy internal policyContract;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);

    bytes32 internal programId = keccak256("program-1");

    function setUp() public {
        vm.prank(admin);
        policyContract = new CompliancePolicy(admin);

        vm.prank(admin);
        policyContract.grantRole(Roles.COMPLIANCE_ROLE, operator);
    }

    function testAllowedCategoryPasses() public {
        DataTypes.ProgramPolicy memory policy = DataTypes.ProgramPolicy({
            programId: programId,
            categoryMask: (uint256(1) << 3) | (uint256(1) << 5),
            maxPerPeriod: 100 ether,
            totalCap: 1000 ether,
            validityDays: 30,
            cadenceType: DataTypes.CadenceType.MONTHLY,
            allowPartialRedemption: true,
            active: true
        });

        vm.prank(operator);
        policyContract.setProgramPolicy(programId, policy);

        assertTrue(policyContract.isCategoryAllowed(programId, 3));
        assertTrue(policyContract.isCategoryAllowed(programId, 5));
        assertFalse(policyContract.isCategoryAllowed(programId, 2));
    }

    function testDisabledPolicyRejectedByCategoryCheck() public {
        DataTypes.ProgramPolicy memory policy = DataTypes.ProgramPolicy({
            programId: programId,
            categoryMask: (uint256(1) << 3),
            maxPerPeriod: 100 ether,
            totalCap: 1000 ether,
            validityDays: 30,
            cadenceType: DataTypes.CadenceType.MONTHLY,
            allowPartialRedemption: true,
            active: true
        });

        vm.prank(operator);
        policyContract.setProgramPolicy(programId, policy);

        vm.prank(operator);
        policyContract.disableProgramPolicy(programId);

        assertFalse(policyContract.isCategoryAllowed(programId, 3));
    }

    function testInvalidCapsRejected() public {
        DataTypes.ProgramPolicy memory badPolicy = DataTypes.ProgramPolicy({
            programId: programId,
            categoryMask: (uint256(1) << 3),
            maxPerPeriod: 2000 ether,
            totalCap: 1000 ether,
            validityDays: 30,
            cadenceType: DataTypes.CadenceType.MONTHLY,
            allowPartialRedemption: true,
            active: true
        });

        vm.prank(operator);
        vm.expectRevert();
        policyContract.setProgramPolicy(programId, badPolicy);
    }
}
