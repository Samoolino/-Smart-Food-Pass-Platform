# VICTUALS — Smart Nutritional Food Plan Pass

VICTUALS is the upgraded global product direction for the former Smart Food Stamp / Smart Food Pass scaffold. It is a subscription-funded nutritional access infrastructure where approved funders, families, institutions, CSR programs, emergency response bodies, and welfare operators can create time-based food value plans for verified users.

## Product thesis

VICTUALS connects five operating layers:

1. **Subscription-funded plans** — plan purchasers define funding value, validity, schedule, target user category, and nutrition intention.
2. **Victuals Pass wallet** — eligible users receive scheduled entitlement credits that can be redeemed during a controlled validity window.
3. **Nutritional Intelligence Engine** — approved food products are suggested and validated using product nutrition, proximate composition, merchant availability, price, plan rules, and user feedback.
4. **Accredited merchant network** — supermarkets, food product vendors, food dispensaries, and approved merchants accept pass transactions after agreement, KYB, price validation, and inventory approval.
5. **Contract truth boundary** — smart contracts anchor plan issuance, entitlement state, product registry versions, merchant registry state, redemption proofs, settlement proofs, and treasury policy limits.

## Controlled migration state

This repository is being migrated in a controlled order:

1. Terminology migration
2. Architecture documentation
3. Shared domain types
4. Contract module expansion
5. Product registry and nutrition integrations
6. Wallet, QR redemption, and merchant settlement services
7. App-level implementation

App implementation must follow the stable domain model, shared types, and contract specification. The upgrade should not begin from UI changes.

## Workspaces

- apps
- services
- packages
- infra
- docs

## Target app surfaces

- `apps/web-marketing` — global VICTUALS brand and product website
- `apps/user-app` — pass wallet, nutrition inquiry, QR generation, redemption history
- `apps/merchant-app` — merchant inventory approval, QR scan, transaction validation, settlement request
- `apps/admin-console` — product registry, merchant registry, compliance, plan governance
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
