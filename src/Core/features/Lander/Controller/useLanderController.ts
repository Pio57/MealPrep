import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ROUTES, type RootStackParamList } from '../../../Navigation/routes';

export function useLanderController() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGetStarted = () => {
    navigation.navigate(ROUTES.BudgetSelection);
  };

  return { handleGetStarted };
}
