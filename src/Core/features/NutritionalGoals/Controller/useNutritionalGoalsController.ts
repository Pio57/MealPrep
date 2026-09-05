import { useAtom } from 'jotai';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { selectedNutritionalGoalsAtom } from '../State/nutritionalGoalsAtoms';
import { NONE_OPTION_ID } from '../../../Catalog/dietaryNeeds';
import { ROUTES, type RootStackParamList } from '../../../Navigation/routes';

export function useNutritionalGoalsController() {
  const [, setSelectedIds] = useAtom(selectedNutritionalGoalsAtom);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleToggle = (id: string) => {
    setSelectedIds(current => {
      if (id === NONE_OPTION_ID) {
        return current.includes(NONE_OPTION_ID) ? [] : [NONE_OPTION_ID];
      }
      const withoutNone = current.filter(existing => existing !== NONE_OPTION_ID);
      return withoutNone.includes(id)
        ? withoutNone.filter(existing => existing !== id)
        : [...withoutNone, id];
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    navigation.navigate(ROUTES.MealPlan);
  };

  return { handleToggle, handleBack, handleContinue };
}
