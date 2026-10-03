import { existsSync, readFileSync } from 'fs';
import { describe, expect, it, vi } from 'vitest';

import { withdrawFlowCopy } from '../copy';
import { BITCOIN_TESTNET_CAIP, ETHEREUM_SEPOLIA_CAIP } from '../network-ids';
import { defaultAccountChainIds } from '@/providers/default-accounts';

const removedServiceFeePaths = [
  'src/lib/holding-duration-fee.ts',
  'src/lib/holding-fee-policy.ts',
  'src/lib/fee-policy-acceptance.ts',
  'src/lib/withdrawal-fee-quote.ts',
  'src/components/shared/fee-disclosure-panel.tsx',
  'src/components/settings/settings-fee-schedule-screen.tsx'
] as const;

describe('network safety + libqc pin', () => {
  it('keeps @project-eleven/libqc pinned to 1.0.0', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      dependencies: Record<string, string>;
    };
    expect(pkg.dependencies['@project-eleven/libqc']).toBe('1.0.0');
  });

  it('defaults only to Bitcoin Testnet and Ethereum Sepolia', () => {
    expect([...defaultAccountChainIds]).toEqual([
      BITCOIN_TESTNET_CAIP,
      ETHEREUM_SEPOLIA_CAIP
    ]);
  });

  it('does not include Mainnet chain ids in defaults', () => {
    expect(defaultAccountChainIds).not.toContain(
      'bip122:000000000019d6689c085ae165831e93'
    );
    expect(defaultAccountChainIds).not.toContain('eip155:1');
  });

  it('labels Sepolia CAIP as eip155:11155111', () => {
    expect(ETHEREUM_SEPOLIA_CAIP).toBe('eip155:11155111');
  });

  it('does not ship a developer service fee', () => {
    for (const path of removedServiceFeePaths) {
      expect(existsSync(path)).toBe(false);
    }
    expect(readFileSync('.env.example', 'utf8')).not.toMatch(/TREASURY/);
    expect(withdrawFlowCopy.reviewBitcoinMinerFeeLabel).toBe(
      'Bitcoin miner fee'
    );
    expect(withdrawFlowCopy.reviewEthereumGasFeeLabel).toBe('Ethereum gas fee');
  });

  it('does not silently fall back CapacitorLibQCStorage to localStorage on web/tests', async () => {
    const { CapacitorLibQCStorage } =
      await import('../capacitor-libqc-storage');
    const localStorageMock = {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    vi.stubGlobal('localStorage', localStorageMock);
    const storage = new CapacitorLibQCStorage();
    await storage.put('probe', { ok: true });
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
