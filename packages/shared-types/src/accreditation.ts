export type TransactionAccreditationState =
  | 'BASIC_ACCOUNT'
  | 'KYC_PENDING'
  | 'KYC_VERIFIED'
  | 'TRANSACTION_ENABLED'
  | 'SUSPENDED'
  | 'REVOKED';

export type IdentityVerificationMethod =
  | 'NIN_REFERENCE'
  | 'BVN_REFERENCE'
  | 'PASSPORT_REFERENCE'
  | 'OTHER_PROVIDER_REFERENCE';

export interface TransactionAccreditation {
  holderRef: string;
  state: TransactionAccreditationState;
  method?: IdentityVerificationMethod;
  providerRef?: string;
  consentRef?: string;
  verifiedAt?: string;
  expiresAt?: string;
  reasonCodes: string[];
}

export interface TransactionAccessDecision {
  holderRef: string;
  transactionEnabled: boolean;
  state: TransactionAccreditationState;
  reasonCodes: string[];
}
