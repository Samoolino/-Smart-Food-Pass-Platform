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

Next deliverables:

- Add validation schemas using the selected runtime validation library.
- Add test fixtures for common plan types and pass lifecycle states.

## Phase 3: Contract interface and implementation expansion

Status: started.

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
- Added unit tests for `SubscriptionPlanRegistry`.
- Added unit tests for `VictualsPassManager`.
- Added unit tests for `EntitlementScheduler`.
- Added unit tests for `NutritionPolicyAnchor`.

Implementation logic clarified:

- `SubscriptionPlanRegistry` owns plan template state, activation, suspension, closure, metadata hash updates, and issuance counting.
- `VictualsPassManager` owns pass issuance, activation, suspension, expiry, reserved value, captured value, released value, and available value calculation.
- `EntitlementScheduler` owns pass credit timing, next-credit checkpoints, credit anchoring, schedule disabling, and credit-due checks.
- `NutritionPolicyAnchor` owns nutrition policy version hashes, effective windows, active state, and validation.
- These contracts only store state and enforce lifecycle boundaries. Product scoring, identity review, merchant price validation, and provider integrations remain off-chain.

Next deliverables:

- Implement `RedemptionVerifier`.
- Implement `SettlementAnchor`.
- Add module-level tests before production deployment.
- Add integration tests across plan, pass, schedule, nutrition policy, redemption, and settlement flows.

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
