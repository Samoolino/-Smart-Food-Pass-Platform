# VICTUALS Upgrade Proceedings

This document defines the chronological upgrade path for moving the repository from the current scaffold into the VICTUALS product architecture.

## Verified starting point

- Repository has admin and push permissions available for this migration.
- Main branch currently contains the monorepo scaffold, active contract package, legacy backend, and legacy frontend.
- Architecture and contract specs were placeholder-level and require controlled expansion.
- Contract package is the strongest existing foundation and should be expanded before app implementation.
- SDK and app layers should not be treated as stable until shared types and contract interfaces are upgraded.

## Upgrade branch

Active refreshed migration branch:

`feat/victuals-main-refresh`

## Phase 1: Controlled language and architecture

Status: active.

Deliverables completed:

- Root README rebrand and build-order update
- VICTUALS glossary
- Domain architecture
- App state and transition plan
- Food product registry source strategy
- Contract system specification
- Repository component state audit

## Phase 2: Shared model expansion

Status: started.

Deliverables completed:

- Split shared domain model into dedicated files for common primitives, subscription, pass, product, nutrition, merchant, redemption, ledger, and legacy DTOs.
- Updated shared type package exports.
- Added combined pass scope support in redemption types.

Next deliverables:

- Add validation schemas using the selected runtime validation library.
- Add test fixtures for common plan types and pass lifecycle states.

## Phase 3: Contract interface and implementation expansion

Status: integration-test stage.

Deliverables completed:

- Added VICTUALS shared contract data types for subscription plans, entitlement schedules, nutrition policy versions, redemption intents, and settlement batch anchors.
- Added `ISubscriptionPlanRegistry`.
- Added `IVictualsPassManager`.
- Added `IEntitlementScheduler`.
- Added `INutritionPolicyAnchor`.
- Added `IRedemptionVerifier`.
- Added `ISettlementAnchor`.
- Implemented `SubscriptionPlanRegistry`.
- Implemented `VictualsPassManager`.
- Implemented `EntitlementScheduler`.
- Implemented `NutritionPolicyAnchor`.
- Implemented `RedemptionVerifier`.
- Implemented `SettlementAnchor`.
- Added unit tests for `SubscriptionPlanRegistry`.
- Added unit tests for `VictualsPassManager`.
- Added unit tests for `EntitlementScheduler`.
- Added unit tests for `NutritionPolicyAnchor`.
- Added unit tests for `RedemptionVerifier`.
- Added unit tests for `SettlementAnchor`.
- Added integration test `VictualsLifecycleIntegrationTest` connecting plan/package, pass issuance, entitlement schedule, nutrition policy anchor, combined redemption intent, pass value capture, and settlement batch anchoring.
- Removed duplicate treasury-path `SettlementAnchor`; canonical contract path is now `packages/contracts/contracts/settlement/SettlementAnchor.sol`.

Implementation logic clarified:

- `SubscriptionPlanRegistry` owns plan template state, activation, suspension, closure, metadata hash updates, and issuance counting.
- Plan/package value should be determined from target product requirements and the nutritional matrix off-chain, then anchored by `planMetadataHash`, `fundingValue`, `creditAmount`, and schedule fields.
- `VictualsPassManager` owns pass issuance, activation, suspension, expiry, reserved value, captured value, released value, and available value calculation.
- `EntitlementScheduler` owns pass credit timing, next-credit checkpoints, credit anchoring, schedule disabling, and credit-due checks.
- `NutritionPolicyAnchor` owns nutrition policy version hashes, effective windows, active state, and validation.
- `RedemptionVerifier` owns redemption intent registration, nonce consumption, basket hash anchoring, combined pass scope anchoring, nutrition scope anchoring, capture, voiding, and validation.
- `SettlementAnchor` owns merchant settlement batch hash anchoring, ready state, settled state, failed state, and lookup.
- A single authenticated user may hold multiple active passes. The combined redemption scope is represented by `passSetHash` and `nutritionScopeHash` so off-chain services can evaluate multiple plans and nutrition goals while contracts anchor the approved scope efficiently.
- These contracts only store state and enforce lifecycle boundaries. Product scoring, identity review, merchant price validation, and provider integrations remain off-chain.

Next deliverables:

- Run Foundry/Hardhat tests in CI or local environment.
- Add deployment script updates for the new VICTUALS modules.
- Add service-level redemption orchestration after contract integration tests are stable.

## Phase 4: Product registry and nutrition services

Status: started.

Deliverables completed:

- Created product registry service scaffold.
- Added source adapter interface.
- Created Nutritional Intelligence Service scaffold.
- Added eligibility rule interface.

Next deliverables:

- Add adapters for regional baseline, merchant inventory, and open barcode enrichment.
- Add source confidence scoring.
- Add product eligibility state machine.

## Phase 5: Wallet, QR, and merchant redemption

Status: started.

Deliverables completed:

- Created wallet service scaffold.
- Added entitlement scheduler interface.
- Created settlement service scaffold.
- Added settlement batch model.
- Created merchant accreditation service scaffold.
- Added merchant accreditation workflow interface.

Next deliverables:

- Add signed redemption intent service.
- Add merchant validation and redemption acceptance flow.
- Add ledger entries for pass debit and merchant credit.

## Phase 6: Apps

Status: deferred.

App work begins only after stable shared types, service contracts, and contract specs exist.

Target apps:

- Marketing site
- User app
- Merchant app
- Admin console
- Funder portal

## Execution rule

Every upgrade PR should keep changes reviewable. Avoid mixing documentation, contracts, services, and app UI in a single uncontrolled rewrite.
