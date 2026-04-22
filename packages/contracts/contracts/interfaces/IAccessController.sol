// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAccessController {
    function grantProgramAdmin(address account) external;
    function grantTreasuryRole(address account) external;
    function grantRegistryRole(address account) external;
    function grantComplianceRole(address account) external;
    function grantMerchantRole(address account) external;
    function grantPauserRole(address account) external;
    function grantUpgraderRole(address account) external;
    function revokeRole(bytes32 role, address account) external;
    function pause() external;
    function unpause() external;
}
