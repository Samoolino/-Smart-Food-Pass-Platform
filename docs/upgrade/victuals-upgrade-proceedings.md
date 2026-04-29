# VICTUALS Upgrade Proceedings

This document defines the chronological upgrade path for moving the repository from the current scaffold into the VICTUALS product architecture.

## Verified starting point

- Repository has admin and push permissions available for this migration.
- Main branch currently describes the project as a Smart Food Stamp DApp MVP.
- Architecture and contract specs are placeholder-level and require controlled expansion.
- Contract package is the strongest existing foundation and should be expanded before app implementation.
- SDK and app layers should not be treated as stable until shared types and contract interfaces are upgraded.

## Upgrade branch

Active migration branch:

`feat/victuals-platform-transition`

## Phase 1: Controlled language and architecture

Status: started.

Deliverables:

- Root README rebrand and build-order update
- VICTUALS glossary
- Domain architecture
- Food product registry source strategy
- Shared domain model
- Contract system specification

## Phase 2: Shared model expansion

Next deliverables:

- Split shared domain model into dedicated files: subscription, pass, product, nutrition, merchant, redemption, ledger, compliance.
- Add validation schemas using the selected runtime validation library.
- Add test fixtures for common plan types and pass lifecycle states.

## Phase 3: Contract interface expansion

Next deliverables:

- Add Solidity interfaces for VICTUALS modules.
- Preserve legacy Smart Food Pass contracts.
- Add events and custom errors.
- Add module-level tests before concrete implementation.

## Phase 4: Product registry and nutrition services

Next deliverables:

- Create product registry service scaffold.
- Add source adapter interface.
- Add adapters for regional baseline, merchant inventory, and open barcode enrichment.
- Add source confidence scoring.
- Add product eligibility state machine.

## Phase 5: Wallet, QR, and merchant redemption

Next deliverables:

- Add pass wallet service.
- Add scheduled entitlement credit logic.
- Add signed redemption intent service.
- Add merchant validation and redemption acceptance flow.
- Add ledger entries for pass debit and merchant credit.

## Phase 6: Apps

App work begins only after stable shared types, service contracts, and contract specs exist.

Target apps:

- Marketing site
- User app
- Merchant app
- Admin console
- Funder portal

## Execution rule

Every upgrade PR should keep changes reviewable. Avoid mixing documentation, contracts, services, and app UI in a single uncontrolled rewrite.
