import { LanderScreen } from '../View/Screens/LanderScreen';
import { LanderViewModel } from '../ViewModel/LanderViewModel';
import { useLanderController } from '../Controller/useLanderController';

export function LanderScreenLoader() {
  const viewModel = LanderViewModel.create();
  const { handleGetStarted } = useLanderController();

  return <LanderScreen {...viewModel} onGetStarted={handleGetStarted} />;
}
