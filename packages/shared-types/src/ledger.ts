import type { MoneyAmount } from './common';

export type LedgerEntryType =
  | 'PASS_CREDIT'
  | 'PASS_DEBIT'
  | 'MERCHANT_CREDIT'
  | 'REVERSAL'
  | 'SETTLEMENT';

export interface LedgerEntry {
  ledgerEntryId: string;
  passId?: string;
  merchantId?: string;
  redemptionId?: string;
  entryType: LedgerEntryType;
  amount: MoneyAmount;
  createdAt: string;
  referenceHash?: string;
}
