// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SubscriptionPlanRegistry} from "../contracts/registry/SubscriptionPlanRegistry.sol";
import {VictualsPassManager} from "../contracts/core/VictualsPassManager.sol";
import {EntitlementScheduler} from "../contracts/core/EntitlementScheduler.sol";
import {NutritionPolicyAnchor} from "../contracts/policy/NutritionPolicyAnchor.sol";
import {RedemptionVerifier} from "../contracts/redemption/RedemptionVerifier.sol";
import {SettlementAnchor} from "../contracts/settlement/SettlementAnchor.sol";

contract DeployTestnetScript is Script {
    function run() external {
        address admin = vm.envAddress("VICTUALS_ADMIN");
        uint256 chainId = block.chainid;

        vm.startBroadcast();

        SubscriptionPlanRegistry planRegistry = new SubscriptionPlanRegistry(admin);
        VictualsPassManager passManager = new VictualsPassManager(admin);
        EntitlementScheduler entitlementScheduler = new EntitlementScheduler(admin);
        NutritionPolicyAnchor nutritionPolicyAnchor = new NutritionPolicyAnchor(admin);
        RedemptionVerifier redemptionVerifier = new RedemptionVerifier(admin);
        SettlementAnchor settlementAnchor = new SettlementAnchor(admin);

        vm.stopBroadcast();

        console2.log("VICTUALS network deployment chainId", chainId);
        console2.log("VICTUALS admin", admin);
        console2.log("SubscriptionPlanRegistry", address(planRegistry));
        console2.log("VictualsPassManager", address(passManager));
        console2.log("EntitlementScheduler", address(entitlementScheduler));
        console2.log("NutritionPolicyAnchor", address(nutritionPolicyAnchor));
        console2.log("RedemptionVerifier", address(redemptionVerifier));
        console2.log("SettlementAnchor", address(settlementAnchor));
    }
}
