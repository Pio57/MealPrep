import { useAtomValue } from 'jotai';
import { weeklyBudgetAtom } from '../State/budgetAtoms';
import { BudgetSelectionViewModel } from '../ViewModel/BudgetSelectionViewModel';
import { useBudgetSelectionController } from '../Controller/useBudgetSelectionController';
import { BudgetSelectionScreen } from '../View/Screens/BudgetSelectionScreen';

export function BudgetSelectionScreenLoader() {
  const budget = useAtomValue(weeklyBudgetAtom);
  const viewModel = BudgetSelectionViewModel.create(budget);
  const { handleBudgetChange, handleBack, handleContinue } = useBudgetSelectionController();

  return (
    <BudgetSelectionScreen
      {...viewModel}
      onBudgetChange={handleBudgetChange}
      onBack={handleBack}
      onContinue={handleContinue}
    />
  );
}
