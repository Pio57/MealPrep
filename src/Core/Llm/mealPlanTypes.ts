export interface MealPlanRecipeStep {
  step: number;
  instruction: string;
}

export interface MealPlanIngredient {
  productId: string;
  name: string;
  quantity: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealPlanMeal {
  mealType: MealType;
  name: string;
  prepTimeMinutes: number;
  servings: number;
  price: number;
  ingredients: MealPlanIngredient[];
  steps: MealPlanRecipeStep[];
}

export interface MealPlanDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  meals: MealPlanMeal[];
}

export interface MealPlan {
  days: MealPlanDay[];
  totalPrice: number;
  currency: string;
}
