import { useAtom, useAtomValue } from 'jotai';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mealPlanQueryAtom, selectedDayIndexAtom } from '../State/mealPlanAtoms';
import { mealFeedbackMapAtom, type MealFeedback } from '../State/mealFeedbackAtoms';
import { ROUTES, type RootStackParamList } from '../../../Navigation/routes';

export function useMealPlanController() {
  const [, setSelectedDayIndex] = useAtom(selectedDayIndexAtom);
  const [, setFeedbackMap] = useAtom(mealFeedbackMapAtom);
  const query = useAtomValue(mealPlanQueryAtom);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSelectDay = (index: number) => {
    setSelectedDayIndex(index);
  };

  const handleRetry = () => {
    query.refetch().catch(() => {});
  };

  const handleOpenShoppingList = () => {
    navigation.navigate(ROUTES.ShoppingList);
  };

  /** Tapping the already-active choice clears it, so like/dislike behave as toggles. */
  const handleSetMealFeedback = (mealKey: string, feedback: MealFeedback) => {
    setFeedbackMap(prev => ({ ...prev, [mealKey]: prev[mealKey] === feedback ? null : feedback }));
  };

  return { handleSelectDay, handleRetry, handleOpenShoppingList, handleSetMealFeedback };
}
