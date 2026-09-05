import { useAtomValue } from 'jotai';
import { mealPlanQueryAtom } from '../../MealPlan/State/mealPlanAtoms';
import { checkedShoppingItemsAtom } from '../State/shoppingListAtoms';
import { ShoppingListViewModel } from '../ViewModel/ShoppingListViewModel';
import { useShoppingListController } from '../Controller/useShoppingListController';
import { ShoppingListScreen } from '../View/Screens/ShoppingListScreen';

export function ShoppingListScreenLoader() {
  const query = useAtomValue(mealPlanQueryAtom);
  const checkedItems = useAtomValue(checkedShoppingItemsAtom);
  const viewModel = ShoppingListViewModel.create(query, checkedItems);
  const { handleToggleItem, handleClose } = useShoppingListController();

  return <ShoppingListScreen {...viewModel} onToggleItem={handleToggleItem} onClose={handleClose} />;
}
