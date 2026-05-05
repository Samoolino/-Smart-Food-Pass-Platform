# VICTUALS UI Palette

This palette defines the first visual direction for the VICTUALS frontend. It is designed for e-commerce clarity, transaction speed, nutritional trust, and financial-value readability.

## Design principles

- Fast transaction readability.
- Clear market and merchant selection.
- Strong $WO value visibility.
- Trustworthy health/nutrition tone without medical overclaiming.
- Simple card-based commerce layouts.
- High contrast for action buttons, QR states, and settlement states.

## Core palette

| Token | Hex | Use |
| --- | --- | --- |
| `victuals-forest` | `#12372A` | Primary brand, headers, trust sections. |
| `victuals-leaf` | `#2E7D32` | Nutrition, approved states, merchant active states. |
| `victuals-lime` | `#A3E635` | Highlights, active indicators, success accents. |
| `victuals-gold` | `#F5B700` | $WO value, package value, premium highlights. |
| `victuals-amber` | `#F59E0B` | Pending states, review states, caution. |
| `victuals-red` | `#DC2626` | Failed, rejected, suspended, invalid QR. |
| `victuals-blue` | `#2563EB` | Links, service info, contract proof cards. |
| `victuals-cyan` | `#06B6D4` | API integrations, store connectivity, data flow. |
| `victuals-ink` | `#111827` | Main text. |
| `victuals-slate` | `#475569` | Secondary text. |
| `victuals-cloud` | `#F8FAFC` | Page background. |
| `victuals-card` | `#FFFFFF` | Cards and panels. |
| `victuals-border` | `#E5E7EB` | Borders and dividers. |

## Transaction state colors

| State group | Token | Use |
| --- | --- | --- |
| Ready / approved | `victuals-leaf` | Accredited, active pass, merchant approved. |
| Value / package | `victuals-gold` | $WO balances, package totals, pass worth. |
| Pending / review | `victuals-amber` | KYC pending, settlement review, price approval. |
| Failed / blocked | `victuals-red` | Suspended, failed conversion, expired QR. |
| Proof / chain | `victuals-blue` | Contract address, registry hash, proof cards. |
| Integration | `victuals-cyan` | API connection, inventory feed, store sync. |

## Typography direction

- Headline: modern geometric sans, bold.
- Body: readable sans-serif.
- Numeric values: tabular-number style for $WO, currency, and settlement values.

Recommended font stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## UI components

Initial component set:

- Market selector card
- Merchant store card
- Product basket card
- $WO balance card
- Pass status card
- Nutrition scope card
- Contract proof card
- QR redemption panel
- Settlement state timeline
- Admin treasury capacity panel

## Button hierarchy

| Button type | Color rule |
| --- | --- |
| Primary transaction | `victuals-forest` background, white text. |
| Confirm / approve | `victuals-leaf` background, white text. |
| $WO/package action | `victuals-gold` background, dark text. |
| Secondary | white background, `victuals-border`, `victuals-ink`. |
| Danger | `victuals-red` background, white text. |

## Layout behavior

- Landing page should use wide hero sections and grid cards.
- App dashboards should use compact cards with clear status labels.
- QR actions should always appear in a focused panel.
- Merchant and product selection should be card-based and filterable.
- Admin treasury panels should prioritize numeric clarity.
