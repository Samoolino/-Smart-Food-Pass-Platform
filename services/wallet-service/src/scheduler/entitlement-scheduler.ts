import type { SubscriptionPlan, VictualsPass } from '@smart-food-stamp/shared-types';

export interface EntitlementScheduleResult {
  shouldCredit: boolean;
  nextCreditAt?: string;
  expiresAt?: string;
  reasonCodes: string[];
}

export interface EntitlementScheduler {
  evaluateNextCredit(plan: SubscriptionPlan, pass: VictualsPass, now: string): EntitlementScheduleResult;
}
