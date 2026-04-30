import type { MoneyAmount } from './common';
import type { WoAmount } from './transaction';

export type TreasuryPolicyState =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'REVIEW_REQUIRED'
  | 'CLOSED';

export type WoReleaseState =
  | 'PROPOSED'
  | 'APPROVED'
  | 'RELEASED'
  | 'PAUSED'
  | 'REJECTED';

export interface TreasuryReservePolicy {
  policyId: string;
  policyVersionHash: string;
  lowerReserveLimit: MoneyAmount;
  maximumWoSupply: WoAmount;
  currentlyReleasedWo: WoAmount;
  availableWoCapacity: WoAmount;
  state: TreasuryPolicyState;
  createdAt: string;
  updatedAt: string;
}

export interface WoReleaseWindow {
  releaseId: string;
  policyId: string;
  releaseAmount: WoAmount;
  backingReferenceHash: string;
  availableForPlanIssuance: boolean;
  state: WoReleaseState;
  createdAt: string;
  releasedAt?: string;
}

export interface TreasuryOperationRecord {
  operationId: string;
  policyId: string;
  operationReferenceHash: string;
  resultingWoCapacity?: WoAmount;
  reviewRequired: boolean;
  createdAt: string;
}
