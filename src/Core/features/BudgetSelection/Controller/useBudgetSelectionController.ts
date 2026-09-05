import { useAtom } from 'jotai';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { weeklyBudgetAtom } from '../State/budgetAtoms';
import { ROUTES, type RootStackParamList } from '../../../Navigation/routes';

export function useBudgetSelectionController() {
  const [, setBudget] = useAtom(weeklyBudgetAtom);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBudgetChange = (value: number) => {
    setBudget(value);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    navigation.navigate(ROUTES.DietaryNeeds);
  };

  return { handleBudgetChange, handleBack, handleContinue };
}
