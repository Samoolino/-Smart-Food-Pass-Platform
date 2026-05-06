import type { LedgerEntry } from '@smart-food-stamp/shared-types';

export type SettlementBatchState = 'CREATED' | 'REVIEWED' | 'READY' | 'COMPLETED' | 'FAILED';

export interface SettlementBatch {
  batchId: string;
  merchantId: string;
  ledgerEntries: LedgerEntry[];
  totalAmount: number;
  currency: string;
  state: SettlementBatchState;
  referenceHash?: string;
  createdAt: string;
  updatedAt: string;
}
