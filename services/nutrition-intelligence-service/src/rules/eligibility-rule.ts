import type { PlanCategory } from '../../../packages/shared-types/src/subscription';
import type { VictualsProduct } from '../../../packages/shared-types/src/product';

export interface EligibilityRuleInput {
  planCategory: PlanCategory;
  product: VictualsProduct;
  passValueRemaining: number;
}

export interface EligibilityRuleResult {
  approved: boolean;
  reasonCodes: string[];
  score: number;
}

export interface EligibilityRule {
  ruleId: string;
  evaluate(input: EligibilityRuleInput): EligibilityRuleResult;
}
