import type { AnimateScreenOptions } from '@/components/animate-screen';

export const forwardSlideAnimateOptions: AnimateScreenOptions = {
  direction: 'forward',
  type: 'slide'
};

export const backSlideAnimateOptions: AnimateScreenOptions = {
  direction: 'back',
  type: 'slide'
};

export const forwardFadeAnimateOptions: AnimateScreenOptions = {
  direction: 'forward',
  type: 'fade'
};

export const recoveryCancelModalCopy = {
  title: 'Are you sure?',
  description:
    "Your vault hasn't been recovered yet. Once cancelled, you'll need to restart the process to recover your vault."
};

export const recoveryReplaceModalCopy = {
  title: 'Replace existing vault?',
  description:
    'A vault already exists on this device. Recovering permanently replaces it with the vault for this phrase. If you only forgot your password, continue with the same phrase and nothing is lost.'
};

export const recoveryLoaderMessage = 'Recovering your vault...';
