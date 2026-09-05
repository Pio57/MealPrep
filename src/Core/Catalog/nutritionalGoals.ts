import type { Product } from './types';
import { NONE_OPTION_ID } from './dietaryNeeds';

/**
 * Thresholds are per-100g heuristics (no official nutrient profile spec was
 * given in the brief) chosen to keep each goal's matching set large enough
 * to build a varied 7-day plan from ~3.3k products.
 */
export interface NutritionalGoalOption {
  id: string;
  label: string;
  emoji?: string;
  matches?: (product: Product) => boolean;
}

export const NUTRITIONAL_GOAL_OPTIONS: NutritionalGoalOption[] = [
  { id: NONE_OPTION_ID, label: 'Nessuno' },
  { id: 'high-protein', label: 'Ricco di proteine', emoji: '🥩', matches: p => p.nutrition.proteins100g >= 10 },
  { id: 'low-sugar', label: 'Povero di zuccheri', emoji: '🍯', matches: p => p.nutrition.sugars100g <= 5 },
  { id: 'low-fat', label: 'Povero di grassi', emoji: '🫑', matches: p => p.nutrition.fat100g <= 3 },
  { id: 'low-carbs', label: 'Povero di carboidrati', emoji: '🍝', matches: p => p.nutrition.carbohydrates100g <= 10 },
  { id: 'low-salt', label: 'Povero di sale', emoji: '🧂', matches: p => p.nutrition.salt100g <= 0.3 },
];

export function matchesNutritionalGoals(product: Product, selectedIds: readonly string[]): boolean {
  return selectedIds.every(id => {
    const option = NUTRITIONAL_GOAL_OPTIONS.find(candidate => candidate.id === id);
    return option?.matches ? option.matches(product) : true;
  });
}
