// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

interface IEntitlementScheduler {
    event EntitlementScheduleCreated(bytes32 indexed passId, bytes32 indexed planId);
    event EntitlementScheduleUpdated(bytes32 indexed passId, uint256 nextCreditAt, uint256 expiresAt);
    event EntitlementCreditAnchored(bytes32 indexed passId, uint256 amount, uint256 creditedAt);
    event EntitlementScheduleDisabled(bytes32 indexed passId);

    function createSchedule(DataTypes.EntitlementSchedule calldata schedule) external;
    function updateSchedule(bytes32 passId, uint256 nextCreditAt, uint256 expiresAt) external;
    function anchorCredit(bytes32 passId, uint256 amount, uint256 creditedAt) external;
    function disableSchedule(bytes32 passId) external;
    function getSchedule(bytes32 passId) external view returns (DataTypes.EntitlementSchedule memory);
    function isCreditDue(bytes32 passId, uint256 timestamp) external view returns (bool);
}
