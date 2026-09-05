import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { weeklyBudgetAtom } from '../../BudgetSelection/State/budgetAtoms';
import { selectedDietaryNeedsAtom } from '../../DietaryNeeds/State/dietaryNeedsAtoms';
import { selectedNutritionalGoalsAtom } from '../../NutritionalGoals/State/nutritionalGoalsAtoms';
import { generateMealPlan } from '../../../Llm/mealPlanWorkflow';

/** `null` means "no explicit user selection yet" — the ViewModel defaults it to today's weekday. */
export const selectedDayIndexAtom = atom<number | null>(null);

/**
 * `atomWithQuery` starts fetching the moment a ScreenLoader subscribes to it
 * (per the MVVM doc's "no explicit load call" rule) and re-fetches whenever
 * budget/dietary/nutritional inputs change, since they're part of the key.
 */
export const mealPlanQueryAtom = atomWithQuery(get => {
  const weeklyBudget = get(weeklyBudgetAtom);
  const dietaryNeeds = get(selectedDietaryNeedsAtom);
  const nutritionalGoals = get(selectedNutritionalGoalsAtom);

  return {
    queryKey: ['mealPlan', weeklyBudget, dietaryNeeds, nutritionalGoals],
    queryFn: () => generateMealPlan({ weeklyBudget, dietaryNeeds, nutritionalGoals }),
    staleTime: Infinity,
    retry: 1,
  };
});
