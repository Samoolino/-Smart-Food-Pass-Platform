export type MerchantAccreditationState =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'AGREEMENT_PENDING'
  | 'ACCREDITED'
  | 'SUSPENDED'
  | 'REVOKED';

export interface AccreditedMerchant {
  merchantId: string;
  legalName: string;
  tradingName?: string;
  accreditationState: MerchantAccreditationState;
  settlementAccountRef?: string;
  agreementRef?: string;
  approvedProductCount: number;
  createdAt: string;
  updatedAt: string;
}
