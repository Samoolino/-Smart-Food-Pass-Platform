export type LoginAuthMethod = 'EMAIL_PASSWORD' | 'WALLET' | 'SSO';

export type IdentityAccreditationProvider = 'BVN' | 'NIN' | 'PASSPORT' | 'MERCHANT_KYB' | 'OTHER';

export type IdentityAccreditationState =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVOKED';

export interface IdentityAccreditationRef {
  holderRef: string;
  provider: IdentityAccreditationProvider;
  state: IdentityAccreditationState;
  verificationRef: string;
  verifiedAt?: string;
  expiresAt?: string;
  reasonCodes: string[];
}

export interface AccountAccessState {
  holderRef: string;
  loginMethods: LoginAuthMethod[];
  canViewAccount: boolean;
  canAccessWallet: boolean;
  canGenerateRedemption: boolean;
  accreditation: IdentityAccreditationRef[];
}
