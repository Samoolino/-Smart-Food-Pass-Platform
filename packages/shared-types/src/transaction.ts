import type { MoneyAmount } from './common';

export type InAppCurrencyCode = 'WO';

export type ExternalAssetType = 'FIAT' | 'STABLECOIN' | 'CRYPTO_ASSET' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';

export type TransactionState =
  | 'CREATED'
  | 'PENDING_ACCREDITATION'
  | 'PENDING_FUNDING'
  | 'FUNDED'
  | 'WO_MINT_PENDING'
  | 'WO_CREDITED'
  | 'RESERVED'
  | 'CAPTURED'
  | 'SETTLEMENT_PENDING'
  | 'CONVERSION_PENDING'
  | 'CONVERTED'
  | 'SETTLED'
  | 'FAILED'
  | 'REVERSED'
  | 'EXPIRED';

export interface WoAmount {
  amount: number;
  currency: InAppCurrencyCode;
}

export interface PackageAcquisitionTransaction {
  transactionId: string;
  purchaserId: string;
  planId: string;
  packageValue: MoneyAmount;
  inflowAssetType: ExternalAssetType;
  inflowReference?: string;
  woValue: WoAmount;
  state: TransactionState;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  transactionId: string;
  holderRef?: string;
  merchantId?: string;
  passId?: string;
  redemptionId?: string;
  woAmount: WoAmount;
  state: TransactionState;
  referenceHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantConversionRequest {
  conversionId: string;
  merchantId: string;
  woAmount: WoAmount;
  targetAssetType: ExternalAssetType;
  targetCurrency?: string;
  targetValueEstimate?: MoneyAmount;
  settlementAccountRef?: string;
  state: TransactionState;
  createdAt: string;
  updatedAt: string;
}
