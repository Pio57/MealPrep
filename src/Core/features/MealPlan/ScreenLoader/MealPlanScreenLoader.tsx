import { useAtomValue } from 'jotai';
import { mealPlanQueryAtom, selectedDayIndexAtom } from '../State/mealPlanAtoms';
import { mealFeedbackMapAtom } from '../State/mealFeedbackAtoms';
import { MealPlanViewModel } from '../ViewModel/MealPlanViewModel';
import { useMealPlanController } from '../Controller/useMealPlanController';
import { MealPlanScreen } from '../View/Screens/MealPlanScreen';

export function MealPlanScreenLoader() {
  const query = useAtomValue(mealPlanQueryAtom);
  const requestedDayIndex = useAtomValue(selectedDayIndexAtom);
  const feedbackByMealKey = useAtomValue(mealFeedbackMapAtom);
  const viewModel = MealPlanViewModel.create(query, requestedDayIndex, feedbackByMealKey);
  const { handleSelectDay, handleRetry, handleOpenShoppingList, handleSetMealFeedback } = useMealPlanController();

  return (
    <MealPlanScreen
      {...viewModel}
      onSelectDay={handleSelectDay}
      onRetry={handleRetry}
      onOpenShoppingList={handleOpenShoppingList}
      onSetMealFeedback={handleSetMealFeedback}
    />
  );
}
