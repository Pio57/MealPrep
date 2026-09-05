import type { MealPlan, MealPlanDay } from '../../../Llm/mealPlanTypes';
import type { MealFeedback } from '../State/mealFeedbackAtoms';

export type MealPlanLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; plan: MealPlan };

export interface MealPlanViewModelDTO {
  loadState: MealPlanLoadState;
  selectedDayIndex: number;
  feedbackByMealKey: Record<string, MealFeedback>;
}

interface QueryLikeState {
  status: 'pending' | 'error' | 'success';
  data: MealPlan | undefined;
  error: unknown;
}

const WEEKDAYS_MONDAY_FIRST: MealPlanDay['day'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/** `Date#getDay()` is Sunday-first (0-6); the plan's `days` array is Monday-first. */
function todaysWeekdayName(): MealPlanDay['day'] {
  return WEEKDAYS_MONDAY_FIRST[(new Date().getDay() + 6) % 7];
}

/** Falls back to today's weekday (or day 0) only until the user makes an explicit choice. */
function resolveSelectedDayIndex(plan: MealPlan | undefined, requestedIndex: number | null): number {
  if (requestedIndex !== null) {
    return requestedIndex;
  }
  if (!plan || plan.days.length === 0) {
    return 0;
  }
  const todayIndex = plan.days.findIndex(day => day.day === todaysWeekdayName());
  return todayIndex >= 0 ? todayIndex : 0;
}

export class MealPlanViewModel {
  public static create(
    query: QueryLikeState,
    requestedDayIndex: number | null,
    feedbackByMealKey: Record<string, MealFeedback>,
  ): MealPlanViewModelDTO {
    const loadState = MealPlanViewModel.toLoadState(query);
    const plan = loadState.status === 'success' ? loadState.plan : undefined;
    return {
      loadState,
      selectedDayIndex: resolveSelectedDayIndex(plan, requestedDayIndex),
      feedbackByMealKey,
    };
  }

  private static toLoadState(query: QueryLikeState): MealPlanLoadState {
    if (query.status === 'success' && query.data) {
      return { status: 'success', plan: query.data };
    }
    if (query.status === 'error') {
      const message = query.error instanceof Error ? query.error.message : 'Qualcosa è andato storto.';
      return { status: 'error', message };
    }
    return { status: 'loading' };
  }
}
