import { useAtom } from 'jotai';
import { useNavigation } from '@react-navigation/native';
import { checkedShoppingItemsAtom } from '../State/shoppingListAtoms';

export function useShoppingListController() {
  const [, setCheckedItems] = useAtom(checkedShoppingItemsAtom);
  const navigation = useNavigation();

  const handleToggleItem = (key: string) => {
    setCheckedItems((prev: ReadonlySet<string>) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return { handleToggleItem, handleClose };
}
