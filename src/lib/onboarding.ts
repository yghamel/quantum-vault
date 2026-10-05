const onboardingSeenStorageKey = 'quantum-vault-onboarding-seen';
const seenOnboardingValue = '1';

export const hasSeenOnboarding = (
  storage: Pick<Storage, 'getItem'> = localStorage
): boolean => storage.getItem(onboardingSeenStorageKey) === seenOnboardingValue;

export const markOnboardingSeen = (): void => {
  localStorage.setItem(onboardingSeenStorageKey, seenOnboardingValue);
};
