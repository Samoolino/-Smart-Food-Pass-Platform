// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {EntitlementScheduler} from "../../contracts/core/EntitlementScheduler.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract EntitlementSchedulerTest is Test {
    EntitlementScheduler internal scheduler;

    address internal admin = address(0xA11CE);
    address internal operator = address(0xBEEF);

    bytes32 internal passId = keccak256("victuals-pass-1");
    bytes32 internal planId = keccak256("victuals-plan-1");

    function setUp() public {
        vm.prank(admin);
        scheduler = new EntitlementScheduler(admin);

        vm.prank(admin);
        scheduler.grantRole(Roles.REGISTRY_ROLE, operator);
    }

    function _schedule(uint256 nextCreditAt) internal view returns (DataTypes.EntitlementSchedule memory) {
        return DataTypes.EntitlementSchedule({
            passId: passId,
            planId: planId,
            creditAmount: 50 ether,
            creditIntervalDays: 14,
            nextCreditAt: nextCreditAt,
            expiresAt: block.timestamp + 365 days,
            carryoverDays: 70,
            active: true
        });
    }

    function testCreateScheduleAndCreditDueWorks() public {
        uint256 nextCreditAt = block.timestamp + 1 days;

        vm.prank(operator);
        scheduler.createSchedule(_schedule(nextCreditAt));

        assertFalse(scheduler.isCreditDue(passId, nextCreditAt - 1));
        assertTrue(scheduler.isCreditDue(passId, nextCreditAt));

        DataTypes.EntitlementSchedule memory stored = scheduler.getSchedule(passId);
        assertEq(stored.passId, passId);
        assertEq(stored.planId, planId);
        assertEq(stored.creditAmount, 50 ether);
        assertTrue(stored.active);
    }

    function testAnchorCreditAdvancesNextCreditAt() public {
        uint256 nextCreditAt = block.timestamp + 1 days;

        vm.prank(operator);
        scheduler.createSchedule(_schedule(nextCreditAt));

        vm.prank(operator);
        scheduler.anchorCredit(passId, 50 ether, nextCreditAt);

        DataTypes.EntitlementSchedule memory stored = scheduler.getSchedule(passId);
        assertEq(stored.nextCreditAt, nextCreditAt + 14 days);
    }

    function testDisableScheduleBlocksCreditDue() public {
        uint256 nextCreditAt = block.timestamp + 1 days;

        vm.prank(operator);
        scheduler.createSchedule(_schedule(nextCreditAt));

        vm.prank(operator);
        scheduler.disableSchedule(passId);

        assertFalse(scheduler.isCreditDue(passId, nextCreditAt));
    }

    function testCannotAnchorCreditBeforeDueTime() public {
        uint256 nextCreditAt = block.timestamp + 1 days;

        vm.prank(operator);
        scheduler.createSchedule(_schedule(nextCreditAt));

        vm.prank(operator);
        vm.expectRevert();
        scheduler.anchorCredit(passId, 50 ether, nextCreditAt - 1);
    }

    function testUnauthorizedCreateRejected() public {
        vm.expectRevert();
        scheduler.createSchedule(_schedule(block.timestamp + 1 days));
    }
}
