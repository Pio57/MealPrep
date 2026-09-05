import type { Product } from './types';

/**
 * The catalog carries labels (positive claims, e.g. "Vegetarian"), allergens
 * (Italian names scraped from OpenFoodFacts, e.g. "Latte", "Glutine") and a
 * department per product. A dietary need is expressed as whichever of these
 * three signals actually captures it — e.g. "Pescatarian" has no catalog
 * label, so it's modeled as "exclude the meat departments, fish stays in".
 */
export interface DietaryNeedOption {
  id: string;
  label: string;
  emoji?: string;
  requiresLabel?: string;
  excludesAllergen?: string;
  excludesDepartments?: string[];
}

export const NONE_OPTION_ID = 'none';

export const DIETARY_NEED_OPTIONS: DietaryNeedOption[] = [
  { id: NONE_OPTION_ID, label: 'Nessuna' },
  { id: 'veggie', label: 'Vegetariano', emoji: '🥕', requiresLabel: 'Vegetarian' },
  { id: 'vegan', label: 'Vegano', emoji: '🌱', requiresLabel: 'Vegan' },
  {
    id: 'pescatarian',
    label: 'Pescetariano',
    emoji: '🐟',
    excludesDepartments: ['Meat', 'Deli Meats & Delicatessen'],
  },
  { id: 'gluten-free', label: 'Senza glutine', emoji: '🌾', excludesAllergen: 'Glutine' },
  { id: 'dairy-free', label: 'Senza lattosio', emoji: '🥛', excludesAllergen: 'Latte' },
];

export function matchesDietaryNeeds(product: Product, selectedIds: readonly string[]): boolean {
  return selectedIds.every(id => {
    const option = DIETARY_NEED_OPTIONS.find(candidate => candidate.id === id);
    if (!option) {
      return true;
    }
    if (option.requiresLabel && !product.labels.some(label => label.name === option.requiresLabel)) {
      return false;
    }
    if (option.excludesAllergen && product.allergens.includes(option.excludesAllergen)) {
      return false;
    }
    if (option.excludesDepartments?.includes(product.department.name)) {
      return false;
    }
    return true;
  });
}
