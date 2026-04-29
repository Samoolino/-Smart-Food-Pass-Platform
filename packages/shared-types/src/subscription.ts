import type { MoneyAmount } from './common';

export type PlanCategory =
  | 'GENERAL_NUTRITIONAL_ACCESS'
  | 'FAMILY_NUTRITION'
  | 'MATERNAL_NUTRITION'
  | 'INFANT_SUPPORT'
  | 'EMERGENCY_RELIEF'
  | 'CSR_WELFARE'
  | 'SCHOOL_FEEDING'
  | 'MEDICAL_DIET_SUPPORT';

export interface SubscriptionPlan {
  planId: string;
  name: string;
  category: PlanCategory;
  purchaserId: string;
  fundingValue: MoneyAmount;
  creditAmount: MoneyAmount;
  creditIntervalDays: number;
  validityDays: number;
  carryoverDays: number;
  maxIssuablePasses?: number;
  startsAt: string;
  endsAt?: string;
  active: boolean;
}
