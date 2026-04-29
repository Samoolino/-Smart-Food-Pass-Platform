// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {VictualsPassManager} from "../../contracts/core/VictualsPassManager.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract VictualsPassManagerTest is Test {
    VictualsPassManager internal manager;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);
    address internal merchant = address(0xCAFE);
    address internal beneficiary = address(0xD00D);

    bytes32 internal passId = keccak256("victuals-pass-1");
    bytes32 internal beneficiaryId = keccak256("beneficiary-1");
    bytes32 internal programId = keccak256("plan-1");

    function setUp() public {
        vm.prank(admin);
        manager = new VictualsPassManager(admin);

        vm.prank(admin);
        manager.grantRole(Roles.REGISTRY_ROLE, operator);

        vm.prank(admin);
        manager.grantRole(Roles.MERCHANT_ROLE, merchant);
    }

    function _config() internal view returns (DataTypes.PassConfig memory) {
        return DataTypes.PassConfig({
            passId: passId,
            beneficiary: beneficiary,
            beneficiaryId: beneficiaryId,
            programId: programId,
            categoryMaskOverride: 0xff
        });
    }

    function _issueAndActivate(uint256 fundedAmount) internal {
        vm.prank(operator);
        manager.issuePass(_config(), fundedAmount, block.timestamp + 30 days);

        vm.prank(operator);
        manager.activatePass(passId);
    }

    function testIssueAndActivatePassWorks() public {
        _issueAndActivate(100 ether);

        assertTrue(manager.isPassActive(passId));
        assertEq(manager.availableValue(passId), 100 ether);

        DataTypes.PassState memory stored = manager.getPass(passId);
        assertEq(stored.passId, passId);
        assertEq(stored.beneficiary, beneficiary);
        assertEq(stored.fundedAmount, 100 ether);
        assertEq(uint256(stored.status), uint256(DataTypes.PassStatus.ACTIVE));
    }

    function testReserveCaptureAndReleaseValueWorks() public {
        _issueAndActivate(100 ether);

        vm.prank(merchant);
        manager.reserveValue(passId, 40 ether);
        assertEq(manager.availableValue(passId), 60 ether);

        vm.prank(merchant);
        manager.captureReservedValue(passId, 25 ether);
        assertEq(manager.availableValue(passId), 60 ether);

        DataTypes.PassState memory afterCapture = manager.getPass(passId);
        assertEq(afterCapture.consumedAmount, 25 ether);
        assertEq(afterCapture.reservedAmount, 15 ether);

        vm.prank(merchant);
        manager.releaseReservedValue(passId, 15 ether);
        assertEq(manager.availableValue(passId), 75 ether);
    }

    function testCannotReserveMoreThanAvailable() public {
        _issueAndActivate(100 ether);

        vm.prank(merchant);
        vm.expectRevert();
        manager.reserveValue(passId, 101 ether);
    }

    function testSuspendedPassCannotReserve() public {
        _issueAndActivate(100 ether);

        vm.prank(operator);
        manager.suspendPass(passId);

        vm.prank(merchant);
        vm.expectRevert();
        manager.reserveValue(passId, 10 ether);
    }

    function testUnauthorizedIssueRejected() public {
        vm.expectRevert();
        manager.issuePass(_config(), 100 ether, block.timestamp + 30 days);
    }
}
