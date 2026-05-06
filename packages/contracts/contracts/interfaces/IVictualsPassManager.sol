// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DataTypes} from "../libraries/DataTypes.sol";

interface IVictualsPassManager {
    event VictualsPassIssued(bytes32 indexed passId, bytes32 indexed planId, address indexed holder);
    event VictualsPassActivated(bytes32 indexed passId);
    event VictualsPassSuspended(bytes32 indexed passId);
    event VictualsPassExpired(bytes32 indexed passId);
    event VictualsPassStateUpdated(bytes32 indexed passId, DataTypes.PassStatus status);

    function issuePass(DataTypes.PassConfig calldata config, uint256 fundedAmount, uint256 expiresAt) external;
    function activatePass(bytes32 passId) external;
    function suspendPass(bytes32 passId) external;
    function expirePass(bytes32 passId) external;
    function reserveValue(bytes32 passId, uint256 amount) external;
    function captureReservedValue(bytes32 passId, uint256 amount) external;
    function releaseReservedValue(bytes32 passId, uint256 amount) external;
    function getPass(bytes32 passId) external view returns (DataTypes.PassState memory);
    function availableValue(bytes32 passId) external view returns (uint256);
    function isPassActive(bytes32 passId) external view returns (bool);
}
