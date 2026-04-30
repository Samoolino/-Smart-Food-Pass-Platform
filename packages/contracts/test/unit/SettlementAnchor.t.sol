// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SettlementAnchor} from "../../contracts/treasury/SettlementAnchor.sol";
import {Roles} from "../../contracts/access/Roles.sol";
import {DataTypes} from "../../contracts/libraries/DataTypes.sol";

contract SettlementAnchorTest is Test {
    SettlementAnchor internal anchor;

    address internal admin = address(0xA11CE);
    address internal signer = address(0xBEEF);
    address internal treasury = address(0xCAFE);

    bytes32 internal batchId = keccak256("settlement-batch-1");
    bytes32 internal merchantId = keccak256("merchant-1");
    bytes32 internal ledgerRootHash = keccak256("ledger-root-1");

    function setUp() public {
        vm.prank(admin);
        anchor = new SettlementAnchor(admin);

        vm.prank(admin);
        anchor.grantRole(Roles.SETTLEMENT_SIGNER_ROLE, signer);

        vm.prank(admin);
        anchor.grantRole(Roles.TREASURY_ROLE, treasury);
    }

    function _batch() internal view returns (DataTypes.SettlementBatchAnchor memory) {
        return DataTypes.SettlementBatchAnchor({
            batchId: batchId,
            merchantId: merchantId,
            ledgerRootHash: ledgerRootHash,
            totalAmount: 100 ether,
            status: DataTypes.SettlementStatus.NONE,
            createdAt: 0,
            updatedAt: 0
        });
    }

    function testCreateBatchWorks() public {
        vm.prank(signer);
        anchor.createBatch(_batch());

        DataTypes.SettlementBatchAnchor memory stored = anchor.getBatch(batchId);
        assertEq(stored.batchId, batchId);
        assertEq(stored.merchantId, merchantId);
        assertEq(stored.ledgerRootHash, ledgerRootHash);
        assertEq(stored.totalAmount, 100 ether);
        assertEq(uint256(stored.status), uint256(DataTypes.SettlementStatus.CREATED));
    }

    function testReadyAndSettledFlowWorks() public {
        vm.prank(signer);
        anchor.createBatch(_batch());

        vm.prank(signer);
        anchor.markBatchReady(batchId);

        DataTypes.SettlementBatchAnchor memory readyBatch = anchor.getBatch(batchId);
        assertEq(uint256(readyBatch.status), uint256(DataTypes.SettlementStatus.READY));

        vm.prank(treasury);
        anchor.markBatchSettled(batchId);

        assertTrue(anchor.isBatchSettled(batchId));

        DataTypes.SettlementBatchAnchor memory settledBatch = anchor.getBatch(batchId);
        assertEq(uint256(settledBatch.status), uint256(DataTypes.SettlementStatus.SETTLED));
    }

    function testFailedBatchWorks() public {
        vm.prank(signer);
        anchor.createBatch(_batch());

        vm.prank(signer);
        anchor.markBatchFailed(batchId);

        DataTypes.SettlementBatchAnchor memory stored = anchor.getBatch(batchId);
        assertEq(uint256(stored.status), uint256(DataTypes.SettlementStatus.FAILED));
    }

    function testCannotSettleBeforeReady() public {
        vm.prank(signer);
        anchor.createBatch(_batch());

        vm.prank(treasury);
        vm.expectRevert();
        anchor.markBatchSettled(batchId);
    }

    function testUnauthorizedCreateRejected() public {
        vm.expectRevert();
        anchor.createBatch(_batch());
    }
}
