export type LoginAuthMethod = 'EMAIL_PASSWORD' | 'WALLET' | 'SSO';

export type IdentityAccreditationProvider = 'BVN' | 'NIN' | 'PASSPORT' | 'MERCHANT_KYB' | 'OTHER';

export type IdentityAccreditationState =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVOKED';

export type TransactionAccessState =
  | 'ACCOUNT_CREATED'
  | 'EMAIL_VERIFIED'
  | 'IDENTITY_SUBMITTED'
  | 'IDENTITY_VERIFIED'
  | 'TRANSACTION_ENABLED'
  | 'TRANSACTION_RESTRICTED'
  | 'SUSPENDED';

export interface IdentityAccreditationRef {
  holderRef: string;
  provider: IdentityAccreditationProvider;
  state: IdentityAccreditationState;
  verificationRef: string;
  providerReferenceHash?: string;
  consentProofHash?: string;
  verifiedAt?: string;
  expiresAt?: string;
  reasonCodes: string[];
}

export interface AccountAccessState {
  holderRef: string;
  loginMethods: LoginAuthMethod[];
  transactionAccessState: TransactionAccessState;
  canViewAccount: boolean;
  canAccessWallet: boolean;
  canGenerateRedemption: boolean;
  canRequestMerchantConversion?: boolean;
  accreditation: IdentityAccreditationRef[];
}
