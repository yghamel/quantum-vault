import { useScreen } from '@/hooks/use-screen';
import { useClickGate } from '@/hooks/use-click-gate';
import { markOnboardingSeen } from '@/lib/onboarding';
import { ScrollableQuantumVaultAbout } from './shared/quantum-vault-about';
import { Screen } from './screen';
import { Button } from './ui/button';

export const OnboardingScreen = () => {
  const { navigate } = useScreen();

  // Persist the seen flag so this first-launch page is only shown once.
  const gatedFinishOnboarding = useClickGate({
    handler: () => {
      markOnboardingSeen();
      navigate('initial', { direction: 'forward' });
    }
  });

  return (
    <Screen className='sharp overflow-hidden'>
      <ScrollableQuantumVaultAbout className='flex-1 mb-4' />

      <Button
        size='flow'
        className='shrink-0 rounded-none'
        data-testid='onboarding-get-started-button'
        onClick={gatedFinishOnboarding}
      >
        GET STARTED
      </Button>
    </Screen>
  );
};
