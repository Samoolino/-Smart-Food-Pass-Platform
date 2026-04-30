# Frontend and Engine Transition Plan

The VICTUALS frontend should not remain a simple Smart Food Pass login and dashboard. The app layer must become a location-aware, currency-aware, nutrition-aware product access experience.

## Required frontend transition

| Area | Required VICTUALS state |
| --- | --- |
| Brand | Replace Smart Food Pass language with VICTUALS: Smart Nutritional Food Plan Pass. |
| User identity | Show authenticated user profile and active pass set. |
| Multi-pass access | Show all active passes and allow combined nutritional scope evaluation. |
| Plan/package display | Show plan value, credit schedule, remaining value, validity, and nutrition target. |
| Product access | Show approved product categories, suggested basket, and merchant availability. |
| Currency UX | Display local currency first, with optional reference currency. |
| Location UX | Filter merchants, product availability, and settlement context by market and region. |
| QR redemption | Generate signed redemption intent only after basket and pass scope are approved. |
| Merchant UX | Scan QR, validate basket, confirm redemption, and view settlement state. |
| Admin UX | Manage plans, products, policies, merchants, registry versions, and settlement batches. |

## Engine connections required before app implementation

The frontend should consume stable service APIs for:

1. Plan/package service
2. Pass wallet service
3. Product registry service
4. Nutritional intelligence service
5. Merchant accreditation and inventory service
6. Redemption intent service
7. Settlement service
8. Contract address registry

## Value and currency model

- Store canonical values in backend ledger format.
- Display values using the user's market currency.
- Support at least market currency, reference USD, and settlement currency where required.
- Do not hardcode a single currency into UI components.

## Location model

- Market defaults should be configured by country and region.
- Merchant availability should be filtered by supported market.
- Product suggestions should consider local inventory and local prices.
- West Africa pilot UX should support country-level and city/region-level expansion.

## App build order

1. Admin console route map
2. Merchant app route map
3. User app route map
4. Funder portal route map
5. Marketing website route map
6. Shared UI kit and design tokens
7. Mock API contracts
8. Live service integration

## App implementation rule

Do not connect the frontend directly to raw contract calls for core product decisions. The app should call services that combine off-chain product intelligence with on-chain proof state.
