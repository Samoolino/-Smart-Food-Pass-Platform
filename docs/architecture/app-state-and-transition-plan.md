# App State and VICTUALS Transition Plan

This document clarifies the current app layer and the correct transition path into VICTUALS.

## Current app state

| App path | Current state | Transition decision |
| --- | --- | --- |
| `apps/admin-console` | Placeholder README only. | Expand later into the VICTUALS control console. |
| `apps/merchant-portal` | Placeholder README only. | Supersede with a VICTUALS merchant app. |
| `apps/beneficiary-dapp` | Placeholder README plus a legacy Next.js app. | Preserve legacy app as reference; create a new VICTUALS user app later. |
| `apps/beneficiary-dapp/legacy-nextjs` | Real Next.js package with Smart Food Pass branding and basic auth page. | Preserve as legacy reference. Do not use as the primary VICTUALS app without a full rebrand and auth redesign. |

## App transition principle

The VICTUALS app layer must not be built before the domain model, service boundaries, contract interfaces, and shared types are stable.

## Target app surfaces

1. `apps/admin-console`
   - Plan governance
   - Product registry administration
   - Merchant accreditation review
   - Compliance review
   - Registry version anchoring
   - Settlement batch oversight

2. `apps/merchant-app`
   - Merchant onboarding
   - Inventory and price approval
   - QR scan and redemption confirmation
   - Settlement request and history

3. `apps/user-app`
   - Pass wallet overview
   - Nutrition inquiry
   - Basket suggestion
   - QR generation
   - Redemption history

4. `apps/funder-portal`
   - Subscription package purchase
   - Family, CSR, welfare, relief, and institution plan setup
   - Beneficiary assignment
   - Funding and reporting views

5. `apps/web-marketing`
   - Global VICTUALS product narrative
   - West Africa pilot positioning
   - Merchant and funder onboarding information

## Upgrade order for apps

1. Keep legacy app untouched.
2. Build service contracts and shared types first.
3. Create route maps for target VICTUALS apps.
4. Scaffold admin console first because it controls product, merchant, and plan truth.
5. Scaffold merchant app second because redemption requires merchant validation.
6. Scaffold user app after wallet, nutrition, and QR services are stable.
7. Scaffold funder portal after subscription plan creation is stable.
8. Launch marketing site when product narrative and pilot scope are ready.
