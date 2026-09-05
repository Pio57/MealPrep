import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanderScreenLoader } from '../features/Lander/ScreenLoader/LanderScreenLoader';
import { BudgetSelectionScreenLoader } from '../features/BudgetSelection/ScreenLoader/BudgetSelectionScreenLoader';
import { DietaryNeedsScreenLoader } from '../features/DietaryNeeds/ScreenLoader/DietaryNeedsScreenLoader';
import { NutritionalGoalsScreenLoader } from '../features/NutritionalGoals/ScreenLoader/NutritionalGoalsScreenLoader';
import { MealPlanScreenLoader } from '../features/MealPlan/ScreenLoader/MealPlanScreenLoader';
import { ShoppingListScreenLoader } from '../features/ShoppingList/ScreenLoader/ShoppingListScreenLoader';
import { ROUTES, type RootStackParamList } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={ROUTES.Lander}>
        <Stack.Screen name={ROUTES.Lander} component={LanderScreenLoader} />
        <Stack.Screen name={ROUTES.BudgetSelection} component={BudgetSelectionScreenLoader} />
        <Stack.Screen name={ROUTES.DietaryNeeds} component={DietaryNeedsScreenLoader} />
        <Stack.Screen name={ROUTES.NutritionalGoals} component={NutritionalGoalsScreenLoader} />
        <Stack.Screen name={ROUTES.MealPlan} component={MealPlanScreenLoader} />
        <Stack.Screen
          name={ROUTES.ShoppingList}
          component={ShoppingListScreenLoader}
          options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
