import type { MoneyAmount } from './common';

export type InAppTokenSymbol = 'WO';

export type WalletOwnerType = 'USER' | 'MERCHANT' | 'SUBSCRIBER' | 'TREASURY';

export type WalletState = 'CREATED' | 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED' | 'CLOSED';

export type WalletTransactionType =
  | 'PACKAGE_ACQUISITION'
  | 'PASS_CREDIT'
  | 'REDEMPTION_RESERVE'
  | 'REDEMPTION_CAPTURE'
  | 'REDEMPTION_RELEASE'
  | 'MERCHANT_CREDIT'
  | 'MERCHANT_CONVERSION_REQUEST'
  | 'MERCHANT_CONVERSION_SETTLED'
  | 'TREASURY_ALLOCATION'
  | 'REVERSAL';

export interface WoAmount {
  amount: number;
  symbol: InAppTokenSymbol;
  stableReference?: MoneyAmount;
}

export interface VictualsWallet {
  walletId: string;
  ownerRef: string;
  ownerType: WalletOwnerType;
  state: WalletState;
  available: WoAmount;
  reserved: WoAmount;
  lifetimeCredited: WoAmount;
  lifetimeDebited: WoAmount;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  transactionId: string;
  walletId: string;
  transactionType: WalletTransactionType;
  amount: WoAmount;
  referenceHash?: string;
  relatedPassId?: string;
  relatedPlanId?: string;
  relatedRedemptionId?: string;
  relatedSettlementBatchId?: string;
  createdAt: string;
}
