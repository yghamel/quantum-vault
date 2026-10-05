import { describe, expect, it } from 'vitest';

import {
  resolveHydrationScreen,
  resolveScreenAfterSessionEnd
} from './screen-provider-core';

describe('resolveScreenAfterSessionEnd', () => {
  it('routes to lock when a password exists', () => {
    expect(
      resolveScreenAfterSessionEnd({
        hasPassword: true,
        isOnboardingSeen: true
      })
    ).toBe('lock');
  });

  it('routes to initial when there is no password and onboarding is seen', () => {
    expect(
      resolveScreenAfterSessionEnd({
        hasPassword: false,
        isOnboardingSeen: true
      })
    ).toBe('initial');
  });

  it('routes to onboarding when there is no password and onboarding is unseen', () => {
    expect(
      resolveScreenAfterSessionEnd({
        hasPassword: false,
        isOnboardingSeen: false
      })
    ).toBe('onboarding');
  });
});

describe('resolveHydrationScreen', () => {
  it('routes no-password users to onboarding when onboarding is unseen', () => {
    const result = resolveHydrationScreen({
      hydrationState: { kind: 'no-password' },
      isOnboardingSeen: false
    });

    expect(result).toBe('onboarding');
  });

  it('routes no-password users to initial when onboarding is already seen', () => {
    const result = resolveHydrationScreen({
      hydrationState: { kind: 'no-password' },
      isOnboardingSeen: true
    });

    expect(result).toBe('initial');
  });

  it('routes locked hydration state to initial so launch offers log in or sign up', () => {
    const result = resolveHydrationScreen({
      hydrationState: { kind: 'locked' },
      isOnboardingSeen: true
    });

    expect(result).toBe('initial');
  });

  it('routes unlocked ready and degraded states to home', () => {
    const readyResult = resolveHydrationScreen({
      hydrationState: { kind: 'unlocked', initWalletResult: 'ready' },
      isOnboardingSeen: true
    });
    const degradedResult = resolveHydrationScreen({
      hydrationState: { kind: 'unlocked', initWalletResult: 'degraded' },
      isOnboardingSeen: true
    });

    expect(readyResult).toBe('home');
    expect(degradedResult).toBe('home');
  });

  it('routes unlocked ignored state to lock', () => {
    const result = resolveHydrationScreen({
      hydrationState: { kind: 'unlocked', initWalletResult: 'ignored' },
      isOnboardingSeen: true
    });

    expect(result).toBe('lock');
  });
});
