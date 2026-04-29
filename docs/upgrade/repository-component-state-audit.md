# Repository Component State Audit for VICTUALS Upgrade

This audit maps the current repository components to the VICTUALS upgrade architecture. It classifies each component as one of:

- **Keep**: useful as-is or as a baseline.
- **Expand**: useful but incomplete.
- **Rename / Migrate**: concept is useful but terminology or domain model must change.
- **Preserve as legacy**: keep for reference only; do not build new product logic on top of it directly.
- **Replace**: should be superseded by a new VICTUALS component.
- **Defer**: keep placeholder until later implementation phase.

## Repository-level finding

The repository is not empty. It contains a monorepo scaffold, an active Solidity contract package, unit tests, placeholder apps/services/infra, and a separate legacy Smart Food Pass backend/frontend/contracts area. The VICTUALS upgrade should preserve legacy material for reference while moving new implementation into controlled VICTUALS modules.

## Root files

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `.env.example` | Environment template with chain, auth, database, storage, payment, observability fields. | Expand with VICTUALS-specific registry, nutrition-source, QR, settlement, and merchant configuration keys. |
| `.github/README.md` | Placeholder documentation. | Expand later into GitHub workflow and contributor rules. |
| `.gitignore` | Useful baseline for Node, build, coverage, contracts output, and environment files. | Keep. |
| `README.md` | Reworked in the migration branch to define VICTUALS thesis and build order. | Keep and continue updating. |
| `package.json` | Root monorepo package still named `smart-food-stamp`. | Rename package metadata and scripts after workspace compatibility review. |
| `pnpm-workspace.yaml` | Workspace definition. | Keep. |
| `turbo.json` | Turbo monorepo pipeline config. | Keep and extend when real apps/services are activated. |

## App components

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `apps/admin-console/README.md` | Placeholder. | Expand into VICTUALS admin console for plans, products, merchants, compliance, registry versions, and settlements. |
| `apps/merchant-portal/README.md` | Placeholder. | Rename or supersede with `apps/merchant-app`; build merchant inventory, price approval, QR scan, and settlement workflows. |
| `apps/beneficiary-dapp/README.md` | Placeholder. | Rename concept to `apps/user-app`; beneficiary language can remain only where describing welfare-specific plans. |
| `apps/beneficiary-dapp/legacy-nextjs/*` | Legacy Next.js login scaffold using Smart Food Pass branding. | Preserve as legacy reference; do not expand as primary VICTUALS app without rebranding and auth redesign. |

## Documentation components

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `docs/api/README.md` | Placeholder. | Expand after service contracts are defined. |
| `docs/architecture/complete-builder-guide.md` | Smart Food Stamp builder guide placeholder. | Replace with VICTUALS builder guide. |
| `docs/architecture/full-technical-architecture.md` | Minimal placeholder. | Replace or cross-link to `victuals-domain-architecture.md`. |
| `docs/architecture/repo-starter-files.md` | Starter-file note. | Keep as historical reference or move under runbooks. |
| `docs/architecture/victuals-domain-architecture.md` | New migration architecture file. | Keep and expand into sequence diagrams and service boundaries. |
| `docs/compliance/README.md` | Placeholder. | Expand into KYC/KYB, product approval, data privacy, merchant accreditation, and audit policy. |
| `docs/contracts/module-by-module-solidity-spec.md` | Minimal legacy module order. | Supersede with VICTUALS contract system spec. |
| `docs/contracts/victuals-contract-system-spec.md` | New migration contract architecture. | Keep and expand into interface-by-interface specs. |
| `docs/integrations/food-product-registry-sources.md` | New migration integration strategy. | Keep and expand with adapter contracts, license notes, and source confidence model. |
| `docs/launch/README.md` | Placeholder. | Defer until pilot plan is defined. |
| `docs/legacy-smart-food-pass/*` | Legacy business, architecture, MVP, setup, and venture narrative docs. | Preserve as legacy reference. Extract useful requirements into VICTUALS product docs only after review. |
| `docs/runbooks/bootstrap-stage-1.md` | Bootstrap runbook. | Keep and update after migration branch is rebased onto latest main. |
| `docs/runbooks/repo-phase-status.md` | Current phase status uses legacy module names. | Migrate to VICTUALS phase status. |
| `docs/security/README.md` | Placeholder. | Expand into QR signing, wallet ledger, registry anchoring, identity reference, and admin controls. |
| `docs/terminology/victuals-glossary.md` | New migration glossary. | Keep as terminology authority. |
| `docs/upgrade/victuals-upgrade-proceedings.md` | New chronological upgrade path. | Keep and update after each PR. |

## Infrastructure components

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `infra/docker/README.md` | Placeholder. | Defer until service containers are defined. |
| `infra/kubernetes/README.md` | Placeholder. | Defer until pilot deployment environment exists. |
| `infra/observability/README.md` | Placeholder. | Expand for registry ingestion, redemption, settlement, and contract event monitoring. |
| `infra/terraform/README.md` | Placeholder. | Defer until cloud target is selected. |

## Package components

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `packages/config/README.md` | Placeholder. | Expand into typed runtime config shared by services and apps. |
| `packages/contract-abis/README.md` | Placeholder. | Generate after VICTUALS contracts stabilize. |
| `packages/env-config/README.md` | Placeholder. | Merge or coordinate with `packages/config`. |
| `packages/eslint-config/README.md` | Placeholder. | Keep and expand with monorepo lint standards. |
| `packages/sdk/README.md` | Placeholder. | Defer until APIs/contracts stabilize. |
| `packages/shared-types/package.json` | Shared type package scaffold. | Keep; rename package scope once migration policy is set. |
| `packages/shared-types/src/index.ts` | Minimal legacy pass/program DTOs. | Expand and migrate toward VICTUALS types; avoid deleting until services/contracts are updated. |
| `packages/shared-types/src/victuals.ts` | New VICTUALS domain model added by migration branch. | Keep; split into domain-specific files next. |
| `packages/shared-types/tsconfig.json` | TypeScript package config. | Keep. |
| `packages/tsconfig/base.json` | Shared TS config. | Keep. |
| `packages/ui-kit/README.md` | Placeholder. | Defer until VICTUALS design system is defined. |

## Contract package components

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `packages/contracts/README.md` | Useful module order and directory layout. | Update terminology to VICTUALS modules. |
| `packages/contracts/foundry.toml` | Foundry config. | Keep. |
| `packages/contracts/hardhat.config.ts` | Hardhat config. | Keep and review networks. |
| `packages/contracts/package.json` | Contract package scripts and dependencies. | Keep; rename package scope later. |
| `packages/contracts/tsconfig.json` | TS config. | Keep. |
| `packages/contracts/script/DeployLocal.s.sol` | Local deployment script. | Expand after module naming update. |
| `packages/contracts/script/DeployTestnet.s.sol` | Testnet deployment script. | Expand after module naming update. |

## Contract source components

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `contracts/access/AccessController.sol` | Functional role and pause controller using OpenZeppelin AccessControl. | Keep and migrate name to `VictualsAccessController` or keep generic if imported by all modules. |
| `contracts/access/Roles.sol` | Defines program, treasury, registry, merchant, compliance, pauser, upgrader, settlement signer roles. | Keep and add oracle, nutrition-policy, and settlement-operator roles if needed. |
| `contracts/core/IdentityEntitlementRegistry.sol` | Binds wallet to beneficiary id and metadata hash. | Keep concept, rename from beneficiary-only to identity/pass-holder terminology. |
| `contracts/interfaces/IAccessController.sol` | Interface for access controller. | Keep and expand role operations. |
| `contracts/interfaces/ICompliancePolicy.sol` | Program policy interface. | Expand for VICTUALS plan categories and restrictions. |
| `contracts/interfaces/IIdentityEntitlementRegistry.sol` | Identity entitlement interface. | Rename to support pass-holder reference language. |
| `contracts/interfaces/IMerchantRegistry.sol` | Merchant registry interface. | Keep and expand KYB/agreement/version hash fields. |
| `contracts/interfaces/IProductRegistryAnchor.sol` | Product anchor interface. | Keep and expand version/source policy semantics. |
| `contracts/libraries/DataTypes.sol` | Contains pass, redemption, merchant, product, policy structs and enums. | Migrate to VICTUALS lifecycle and plan category vocabulary. |
| `contracts/libraries/Errors.sol` | Shared custom errors. | Keep and expand. |
| `contracts/policy/CompliancePolicy.sol` | Functional policy contract using category masks and caps. | Keep concept; expand for VICTUALS plan categories and policy versioning. |
| `contracts/registry/MerchantRegistry.sol` | Functional merchant registry with settlement wallet and status. | Keep and extend for accreditation lifecycle. |
| `contracts/registry/ProductRegistryAnchor.sol` | Functional product anchor with product hash/version, category, nutrition class, compliance code, active validation. | Keep; align to Product Registry version anchoring. |
| `contracts/redemption/README.md` | Placeholder. | Implement signed redemption intent and QR nonce verifier. |
| `contracts/treasury/README.md` | Placeholder. | Defer; define treasury policy only after compliance review. |
| `contracts/upgrade/README.md` | Placeholder. | Expand for proxy/upgrade policy if upgradeability is adopted. |
| `contracts/mocks/README.md` | Placeholder. | Add mocks for registries, policies, and redemption tests. |

## Contract test components

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `test/unit/AccessController.t.sol` | Unit test exists. | Keep and update if role names change. |
| `test/unit/CompliancePolicy.t.sol` | Unit test exists. | Expand for VICTUALS category matrix and policy versioning. |
| `test/unit/IdentityEntitlementRegistry.t.sol` | Unit test exists. | Update terminology and privacy reference assumptions. |
| `test/unit/MerchantRegistry.t.sol` | Unit test exists. | Expand for accreditation lifecycle and settlement reference. |
| `test/unit/ProductRegistryAnchor.t.sol` | Unit test exists. | Expand for source confidence and version lifecycle anchors. |
| `test/integration/README.md` | Placeholder. | Add plan-pass-merchant-product-redemption integration tests. |
| `test/fuzz/README.md` | Placeholder. | Add fuzzing for redemption value limits and nonce replay. |
| `test/invariant/README.md` | Placeholder. | Add invariants for balances, redemptions, and policy boundaries. |

## Legacy Smart Food Pass components

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `packages/contracts/legacy-smart-food-pass/*` | Legacy standalone contract package. | Preserve as reference; do not merge into new VICTUALS contracts directly. |
| `services/legacy-backend/*` | Legacy NestJS backend scaffold with users, sponsors, merchants, passes, products, analytics, blockchain modules. | Preserve for reference; migrate domain concepts into new services. |
| `apps/beneficiary-dapp/legacy-nextjs/*` | Legacy frontend auth scaffold. | Preserve for reference; replace with new VICTUALS user app. |

## Service components

| Path | Current state | VICTUALS upgrade action |
| --- | --- | --- |
| `services/analytics-service/README.md` | Placeholder. | Expand after ledger and registry events exist. |
| `services/auth-service/README.md` | Placeholder. | Expand into identity reference, consent, KYC provider, and session service. |
| `services/compliance-service/README.md` | Placeholder. | Expand into plan policy, merchant accreditation, and product approval service. |
| `services/notification-service/README.md` | Placeholder. | Defer until user/merchant workflows exist. |
| `services/payment-orchestrator/README.md` | Placeholder. | Rename or expand into settlement-orchestrator and subscription billing service. |
| `services/redemption-service/README.md` | Placeholder. | Implement QR redemption intent, validation, nonce, basket hash, and merchant confirmation. |
| `services/registry-service/README.md` | Placeholder. | Expand into product registry, merchant registry, source adapters, and price validation. |

## Legacy backend data model migration

The legacy schema already contains useful concepts:

- users
- households
- sponsors
- merchants
- passes
- pass transactions
- product catalog
- nutrition profiles
- merchant settlements
- audit logs
- system rules

VICTUALS should migrate this into:

- users / verified identity references
- households / family plan profiles
- subscription funders instead of sponsors
- accredited merchants
- Victuals passes
- ledger entries and redemptions
- product registry
- nutritional profiles and eligibility matrix
- merchant settlement batches
- audit events
- policy rules

## Immediate next proceedings

1. Rebase or recreate the migration branch from the latest `main` because the current draft PR branch started before the legacy backend/frontend merge.
2. Keep PR #37 as the migration concept PR, or replace it with a refreshed PR from latest `main`.
3. Split `packages/shared-types/src/victuals.ts` into domain files.
4. Add service scaffolds for `product-registry-service`, `nutrition-intelligence-service`, `wallet-service`, `settlement-service`, and `merchant-accreditation-service`.
5. Add Solidity interfaces before implementing new VICTUALS modules.
6. Preserve all legacy directories until feature parity has been reached.
