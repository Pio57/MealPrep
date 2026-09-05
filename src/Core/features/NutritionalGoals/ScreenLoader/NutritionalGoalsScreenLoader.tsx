import { useAtomValue } from 'jotai';
import { selectedNutritionalGoalsAtom } from '../State/nutritionalGoalsAtoms';
import { NutritionalGoalsViewModel } from '../ViewModel/NutritionalGoalsViewModel';
import { useNutritionalGoalsController } from '../Controller/useNutritionalGoalsController';
import { NutritionalGoalsScreen } from '../View/Screens/NutritionalGoalsScreen';

export function NutritionalGoalsScreenLoader() {
  const selectedIds = useAtomValue(selectedNutritionalGoalsAtom);
  const viewModel = NutritionalGoalsViewModel.create(selectedIds);
  const { handleToggle, handleBack, handleContinue } = useNutritionalGoalsController();

  return (
    <NutritionalGoalsScreen
      {...viewModel}
      onToggle={handleToggle}
      onBack={handleBack}
      onContinue={handleContinue}
    />
  );
}
