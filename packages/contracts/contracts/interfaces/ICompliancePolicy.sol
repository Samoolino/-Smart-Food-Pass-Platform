// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

interface ICompliancePolicy {
    function setProgramPolicy(bytes32 programId, DataTypes.ProgramPolicy calldata policy) external;
    function disableProgramPolicy(bytes32 programId) external;
    function isCategoryAllowed(bytes32 programId, uint256 categoryCode) external view returns (bool);
    function getProgramPolicy(bytes32 programId) external view returns (DataTypes.ProgramPolicy memory);
}
