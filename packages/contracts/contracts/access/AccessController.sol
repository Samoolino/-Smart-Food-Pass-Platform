// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IAccessController} from "../interfaces/IAccessController.sol";
import {Roles} from "./Roles.sol";
import {Errors} from "../libraries/Errors.sol";

contract AccessController is AccessControl, Pausable, IAccessController {
    constructor(address superAdmin) {
        if (superAdmin == address(0)) revert Errors.ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, superAdmin);
        _grantRole(Roles.PROGRAM_ADMIN_ROLE, superAdmin);
        _grantRole(Roles.PAUSER_ROLE, superAdmin);
        _grantRole(Roles.UPGRADER_ROLE, superAdmin);
    }

    function grantProgramAdmin(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(Roles.PROGRAM_ADMIN_ROLE, account);
    }

    function grantTreasuryRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(Roles.TREASURY_ROLE, account);
    }

    function grantRegistryRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(Roles.REGISTRY_ROLE, account);
    }

    function grantComplianceRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(Roles.COMPLIANCE_ROLE, account);
    }

    function grantMerchantRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(Roles.MERCHANT_ROLE, account);
    }

    function grantPauserRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(Roles.PAUSER_ROLE, account);
    }

    function grantUpgraderRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(Roles.UPGRADER_ROLE, account);
    }

    function revokeRole(bytes32 role, address account) public override(AccessControl, IAccessController) onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, account);
    }

    function pause() external onlyRole(Roles.PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(Roles.PAUSER_ROLE) {
        _unpause();
    }
}
