// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AccessController} from "../../contracts/access/AccessController.sol";
import {Roles} from "../../contracts/access/Roles.sol";

contract AccessControllerTest is Test {
    AccessController internal accessController;
    address internal admin = address(0xA11CE);
    address internal treasury = address(0xBEEF);
    address internal stranger = address(0xCAFE);

    function setUp() public {
        accessController = new AccessController(admin);
    }

    function testAdminCanGrantTreasuryRole() public {
        vm.prank(admin);
        accessController.grantTreasuryRole(treasury);
        assertTrue(accessController.hasRole(Roles.TREASURY_ROLE, treasury));
    }

    function testUnauthorizedCannotGrantTreasuryRole() public {
        vm.prank(stranger);
        vm.expectRevert();
        accessController.grantTreasuryRole(treasury);
    }

    function testPauserCanPauseAndUnpause() public {
        vm.prank(admin);
        accessController.pause();
        assertTrue(accessController.paused());

        vm.prank(admin);
        accessController.unpause();
        assertFalse(accessController.paused());
    }
}
