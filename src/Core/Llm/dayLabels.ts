import type { MealPlanDay } from './mealPlanTypes';

/** The LLM schema fixes day names in English; this maps them to Italian for display only. */
export const DAY_LABELS_IT: Record<MealPlanDay['day'], string> = {
  Monday: 'Lunedì',
  Tuesday: 'Martedì',
  Wednesday: 'Mercoledì',
  Thursday: 'Giovedì',
  Friday: 'Venerdì',
  Saturday: 'Sabato',
  Sunday: 'Domenica',
};
