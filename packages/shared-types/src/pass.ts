import type { MoneyAmount } from './common';

export type PassLifecycleState =
  | 'CREATED'
  | 'FUNDED'
  | 'ACTIVE'
  | 'CREDIT_SCHEDULED'
  | 'CREDITED'
  | 'PARTIALLY_REDEEMED'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'CLOSED';

export interface VictualsPass {
  passId: string;
  planId: string;
  holderRef: string;
  lifecycleState: PassLifecycleState;
  balance: MoneyAmount;
  lastCreditedAt?: string;
  nextCreditAt?: string;
  expiresAt?: string;
  suspendedReason?: string;
}
