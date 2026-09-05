import { useAtomValue } from 'jotai';
import { selectedDietaryNeedsAtom } from '../State/dietaryNeedsAtoms';
import { DietaryNeedsViewModel } from '../ViewModel/DietaryNeedsViewModel';
import { useDietaryNeedsController } from '../Controller/useDietaryNeedsController';
import { DietaryNeedsScreen } from '../View/Screens/DietaryNeedsScreen';

export function DietaryNeedsScreenLoader() {
  const selectedIds = useAtomValue(selectedDietaryNeedsAtom);
  const viewModel = DietaryNeedsViewModel.create(selectedIds);
  const { handleToggle, handleBack, handleContinue } = useDietaryNeedsController();

  return (
    <DietaryNeedsScreen
      {...viewModel}
      onToggle={handleToggle}
      onBack={handleBack}
      onContinue={handleContinue}
    />
  );
}
