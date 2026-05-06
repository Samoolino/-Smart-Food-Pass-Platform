# VICTUALS — Smart Nutritional Food Plan Pass

VICTUALS is the upgraded global product direction for the former Smart Food Stamp / Smart Food Pass scaffold. It is a subscription-funded nutritional access infrastructure for time-based food value plans, approved product registries, merchant redemption, and nutritional intelligence.

## Product thesis

VICTUALS connects five operating layers:

1. **Subscription-funded plans** — plan purchasers define value, validity, schedule, user category, and nutrition intention.
2. **Victuals Pass wallet** — users receive scheduled entitlement credits within controlled validity windows.
3. **Nutritional Intelligence Engine** — approved food products are suggested using product nutrition, composition, availability, price, plan rules, and feedback.
4. **Accredited merchant network** — approved food merchants accept pass transactions after onboarding and product price validation.
5. **Contract truth boundary** — smart contracts anchor plan, pass, registry, redemption, settlement, and policy proof states.

## Controlled migration state

This repository is being migrated in this order:

1. Terminology migration
2. Architecture documentation
3. Shared domain types
4. Contract module expansion
5. Product registry and nutrition integrations
6. Wallet, QR redemption, and merchant settlement services
7. App-level implementation

App implementation must follow the stable domain model, shared types, and contract specification.

## Workspaces

- apps
- services
- packages
- infra
- docs

## Target app surfaces

- `apps/web-marketing` — VICTUALS public product website
- `apps/user-app` — pass wallet, nutrition inquiry, QR generation, redemption history
- `apps/merchant-app` — inventory approval, QR scan, transaction validation, settlement request
- `apps/admin-console` — plans, products, merchants, compliance, registry versions, and settlements
- `apps/funder-portal` — family, CSR, welfare, institution, relief, and target nutrition plan subscriptions

## Core build order

1. Documentation and terminology control
2. Shared packages and domain schemas
3. Contract interfaces and Solidity modules
4. Registry, nutrition, wallet, redemption, and settlement services
5. SDK and ABIs
6. Admin console
7. Merchant app
8. Funder portal
9. User app
10. Marketing site

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm contracts:test`
