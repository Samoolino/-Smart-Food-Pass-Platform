// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Roles {
    bytes32 internal constant PROGRAM_ADMIN_ROLE = keccak256("PROGRAM_ADMIN_ROLE");
    bytes32 internal constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 internal constant REGISTRY_ROLE = keccak256("REGISTRY_ROLE");
    bytes32 internal constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");
    bytes32 internal constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 internal constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 internal constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 internal constant SETTLEMENT_SIGNER_ROLE = keccak256("SETTLEMENT_SIGNER_ROLE");
}
