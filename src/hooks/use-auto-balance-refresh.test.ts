import type { ScreenKey } from '@/screens';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  autoBalanceRefreshIntervalMs,
  createAutoBalanceRefreshController,
  shouldAutoRefreshBalancesOnScreen
} from './use-auto-balance-refresh';

const createVisibilityTarget = (initial: DocumentVisibilityState) => {
  const eventTarget = new EventTarget();
  const target = {
    visibilityState: initial,
    addEventListener: (type: 'visibilitychange', listener: () => void) =>
      eventTarget.addEventListener(type, listener),
    removeEventListener: (type: 'visibilitychange', listener: () => void) =>
      eventTarget.removeEventListener(type, listener),
    setVisibility: (state: DocumentVisibilityState) => {
      target.visibilityState = state;
      eventTarget.dispatchEvent(new Event('visibilitychange'));
    }
  };
  return target;
};

const setup = ({
  activeScreen = 'home',
  isVaultUnlocked = () => true,
  refreshBalances = vi.fn(() => Promise.resolve()),
  visibility = 'visible'
}: {
  activeScreen?: ScreenKey;
  isVaultUnlocked?: () => boolean;
  refreshBalances?: () => Promise<void>;
  visibility?: DocumentVisibilityState;
} = {}) => {
  const visibilityTarget = createVisibilityTarget(visibility);
  const controller = createAutoBalanceRefreshController({
    activeScreen,
    isVaultUnlocked,
    refreshBalances,
    visibilityTarget
  });
  return { controller, refreshBalances, visibilityTarget };
};

afterEach(() => {
  vi.useRealTimers();
});

describe('shouldAutoRefreshBalancesOnScreen', () => {
  it.each<[ScreenKey, boolean]>([
    ['home', true],
    ['vault-detail', true],
    ['account', true],
    ['receive', true],
    ['vault-withdraw', false],
    ['lock', false],
    ['initial', false]
  ])('%s -> %s', (screen, expected) => {
    expect(shouldAutoRefreshBalancesOnScreen(screen)).toBe(expected);
  });
});

describe('createAutoBalanceRefreshController', () => {
  it('refreshes on every interval while visible and unlocked', () => {
    vi.useFakeTimers();
    const { refreshBalances } = setup();

    vi.advanceTimersByTime(autoBalanceRefreshIntervalMs - 1);
    expect(refreshBalances).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(refreshBalances).toHaveBeenCalledTimes(1);
  });

  it('does nothing on screens without balances', () => {
    vi.useFakeTimers();
    const { refreshBalances } = setup({ activeScreen: 'vault-withdraw' });

    vi.advanceTimersByTime(autoBalanceRefreshIntervalMs * 3);
    expect(refreshBalances).not.toHaveBeenCalled();
  });

  it('skips while the vault is locked or the page is hidden', () => {
    vi.useFakeTimers();
    const locked = setup({ isVaultUnlocked: () => false });
    const hidden = setup({ visibility: 'hidden' });

    vi.advanceTimersByTime(autoBalanceRefreshIntervalMs * 2);
    expect(locked.refreshBalances).not.toHaveBeenCalled();
    expect(hidden.refreshBalances).not.toHaveBeenCalled();
  });

  it('refreshes immediately when the page becomes visible again', () => {
    const { refreshBalances, visibilityTarget } = setup({
      visibility: 'hidden'
    });

    visibilityTarget.setVisibility('visible');
    expect(refreshBalances).toHaveBeenCalledTimes(1);
  });

  it('does not overlap refreshes and swallows failures', async () => {
    vi.useFakeTimers();
    let rejectRefresh: (error: Error) => void = () => undefined;
    const refreshBalances = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          rejectRefresh = reject;
        })
    );
    setup({ refreshBalances });

    vi.advanceTimersByTime(autoBalanceRefreshIntervalMs * 2);
    expect(refreshBalances).toHaveBeenCalledTimes(1);

    rejectRefresh(new Error('network down'));
    await vi.advanceTimersByTimeAsync(autoBalanceRefreshIntervalMs);
    expect(refreshBalances).toHaveBeenCalledTimes(2);
  });

  it('stops refreshing after dispose', () => {
    vi.useFakeTimers();
    const { controller, refreshBalances, visibilityTarget } = setup();

    controller.dispose();
    vi.advanceTimersByTime(autoBalanceRefreshIntervalMs * 2);
    visibilityTarget.setVisibility('visible');
    expect(refreshBalances).not.toHaveBeenCalled();
  });
});
