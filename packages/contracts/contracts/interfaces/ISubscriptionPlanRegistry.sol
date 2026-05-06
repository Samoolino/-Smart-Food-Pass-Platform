// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

interface ISubscriptionPlanRegistry {
    event SubscriptionPlanCreated(bytes32 indexed planId, address indexed purchaser, bytes32 planMetadataHash);
    event SubscriptionPlanActivated(bytes32 indexed planId);
    event SubscriptionPlanSuspended(bytes32 indexed planId);
    event SubscriptionPlanClosed(bytes32 indexed planId);
    event SubscriptionPlanUpdated(bytes32 indexed planId, bytes32 planMetadataHash);

    function createPlan(DataTypes.SubscriptionPlan calldata plan) external;
    function updatePlan(bytes32 planId, bytes32 planMetadataHash) external;
    function activatePlan(bytes32 planId) external;
    function suspendPlan(bytes32 planId) external;
    function closePlan(bytes32 planId) external;
    function incrementIssuedPasses(bytes32 planId) external;
    function getPlan(bytes32 planId) external view returns (DataTypes.SubscriptionPlan memory);
    function isPlanActive(bytes32 planId) external view returns (bool);
}
