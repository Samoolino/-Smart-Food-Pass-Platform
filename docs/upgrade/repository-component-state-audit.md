# Repository Component State Audit for VICTUALS Upgrade

This audit maps the current repository components to the VICTUALS upgrade architecture.

## Classification key

- **Keep**: useful as-is or as a baseline.
- **Expand**: useful but incomplete.
- **Rename / Migrate**: concept is useful but terminology or domain model must change.
- **Preserve as legacy**: keep for reference only.
- **Replace**: should be superseded by a new VICTUALS component.
- **Defer**: keep placeholder until later implementation phase.

## Repository-level finding

The repository contains a monorepo scaffold, an active Solidity contract package, unit tests, placeholder apps/services/infra, and a separate legacy Smart Food Pass backend/frontend/contracts area. VICTUALS should preserve legacy material for reference while moving new implementation into controlled VICTUALS modules.

## Root files

| Path | Current state | VICTUALS action |
| --- | --- | --- |
| `.env.example` | Useful environment template. | Expand with registry, nutrition, QR, settlement, and merchant configuration keys. |
| `.gitignore` | Useful baseline. | Keep. |
| `README.md` | Rebranded on refreshed branch. | Keep and continue updating. |
| `package.json` | Root package still named `smart-food-stamp`. | Rename after workspace compatibility review. |
| `pnpm-workspace.yaml` | Workspace definition. | Keep. |
| `turbo.json` | Turbo pipeline config. | Keep and extend when real apps/services activate. |

## Apps

| Path | Current state | VICTUALS action |
| --- | --- | --- |
| `apps/admin-console` | Placeholder. | Expand into plan, product, merchant, compliance, registry, and settlement console. |
| `apps/merchant-portal` | Placeholder. | Supersede with merchant app for inventory, price approval, QR scan, and settlement. |
| `apps/beneficiary-dapp` | Placeholder plus legacy Next.js auth scaffold. | Preserve legacy; create new `apps/user-app` later. |

## Documentation

| Path | Current state | VICTUALS action |
| --- | --- | --- |
| `docs/architecture/*` | Existing files mostly starter-level. | Expand around VICTUALS domain architecture. |
| `docs/contracts/module-by-module-solidity-spec.md` | Legacy minimal module order. | Supersede with VICTUALS contract spec. |
| `docs/legacy-smart-food-pass/*` | Legacy docs. | Preserve as reference. |
| `docs/compliance/README.md` | Placeholder. | Expand into KYC/KYB, merchant accreditation, product approval, and privacy policy. |
| `docs/security/README.md` | Placeholder. | Expand into QR signing, ledger controls, registry anchoring, and admin controls. |

## Packages

| Path | Current state | VICTUALS action |
| --- | --- | --- |
| `packages/shared-types` | Minimal legacy shared types. | Expand and split into VICTUALS domain files. |
| `packages/sdk` | Placeholder. | Defer until APIs/contracts stabilize. |
| `packages/contract-abis` | Placeholder. | Generate after VICTUALS contracts stabilize. |
| `packages/ui-kit` | Placeholder. | Defer until design system is defined. |

## Contracts

| Path | Current state | VICTUALS action |
| --- | --- | --- |
| `contracts/access/AccessController.sol` | Functional role controller. | Keep and align roles to VICTUALS. |
| `contracts/core/IdentityEntitlementRegistry.sol` | Wallet-to-beneficiary reference registry. | Rename concept toward pass-holder identity reference. |
| `contracts/registry/MerchantRegistry.sol` | Functional merchant registry. | Expand accreditation lifecycle and agreement reference fields. |
| `contracts/registry/ProductRegistryAnchor.sol` | Functional product anchor. | Keep and align to Product Registry version anchoring. |
| `contracts/policy/CompliancePolicy.sol` | Functional policy module. | Expand for VICTUALS plan categories and policy versions. |
| `contracts/redemption` | Placeholder. | Implement redemption verifier and nonce rules. |
| `contracts/treasury` | Placeholder. | Defer until policy and compliance review. |
| `contracts/test/*` | Unit tests exist for current modules. | Expand with integration, fuzz, and invariant tests. |
| `packages/contracts/legacy-smart-food-pass` | Legacy standalone contract. | Preserve as reference. |

## Services

| Path | Current state | VICTUALS action |
| --- | --- | --- |
| `services/legacy-backend` | Legacy NestJS backend with useful concepts. | Preserve; migrate concepts into new services. |
| `services/auth-service` | Placeholder. | Expand into identity reference and session service. |
| `services/registry-service` | Placeholder. | Expand into product and merchant registry orchestration. |
| `services/redemption-service` | Placeholder. | Implement redemption intent, basket hash, nonce, and merchant confirmation. |
| `services/payment-orchestrator` | Placeholder. | Expand or rename for subscription billing and settlement orchestration. |
| `services/compliance-service` | Placeholder. | Expand plan policy, merchant accreditation, and product approval service. |

## Immediate proceedings

1. Continue from refreshed branch `feat/victuals-main-refresh`.
2. Split shared types into domain-specific files.
3. Add VICTUALS service scaffolds.
4. Add Solidity interfaces for new modules before implementation.
5. Preserve all legacy directories until feature parity has been reached.
