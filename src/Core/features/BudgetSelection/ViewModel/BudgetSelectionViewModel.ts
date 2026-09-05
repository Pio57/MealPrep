import { BUDGET_MAX, BUDGET_MIN, BUDGET_STEP } from '../State/budgetAtoms';

export interface BudgetSelectionViewModelDTO {
  budget: number;
  formattedBudget: string;
  min: number;
  max: number;
  step: number;
}

export class BudgetSelectionViewModel {
  public static create(budget: number): BudgetSelectionViewModelDTO {
    return {
      budget,
      formattedBudget: `€${Math.round(budget)}`,
      min: BUDGET_MIN,
      max: BUDGET_MAX,
      step: BUDGET_STEP,
    };
  }
}
