export const ROUTES = {
  Lander: 'Lander',
  BudgetSelection: 'BudgetSelection',
  DietaryNeeds: 'DietaryNeeds',
  NutritionalGoals: 'NutritionalGoals',
  MealPlan: 'MealPlan',
  ShoppingList: 'ShoppingList',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

export type RootStackParamList = {
  [ROUTES.Lander]: undefined;
  [ROUTES.BudgetSelection]: undefined;
  [ROUTES.DietaryNeeds]: undefined;
  [ROUTES.NutritionalGoals]: undefined;
  [ROUTES.MealPlan]: undefined;
  [ROUTES.ShoppingList]: undefined;
};
