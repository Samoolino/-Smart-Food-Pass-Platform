# $WO Ledger Service

The $WO Ledger Service owns internal $WO value accounting for VICTUALS.

## Responsibilities

- Record package funding value in $WO.
- Record scheduled pass credits in $WO.
- Record QR value reservations in $WO.
- Record merchant captured value in $WO.
- Record merchant settlement requests and conversion states.
- Provide currency-aware display quotes for app UX.
- Expose ledger events to admin, user, merchant, and funder surfaces.

## Boundaries

$WO starts as an internal ledger unit. Public tokenization, treasury policy, external settlement rails, and treasury operations must remain governed and audited separately.
