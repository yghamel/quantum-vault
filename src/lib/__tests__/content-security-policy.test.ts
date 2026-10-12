import { describe, expect, it } from 'vitest';

import { buildContentSecurityPolicy } from '@/lib/content-security-policy';

const testnetEnv = {
  VITE_BITCOIN_API_URL: 'https://mempool.space/testnet4/api',
  VITE_ETHEREUM_RPC_URL: 'https://sepolia.gateway.tenderly.co',
  VITE_ETHEREUM_BUNDLER_RPC_URL: 'https://public.pimlico.io/v2/11155111/rpc',
  VITE_ASSET_PRICES_URL: 'https://api.coingecko.com/api/v3/simple/price'
};

const getDirective = (policy: string, name: string): string[] => {
  const directive = policy
    .split('; ')
    .find(entry => entry.startsWith(`${name} `));
  return directive?.split(' ').slice(1) ?? [];
};

describe('buildContentSecurityPolicy', () => {
  it('limits connect-src to the configured provider origins', () => {
    const policy = buildContentSecurityPolicy(testnetEnv);

    expect(getDirective(policy, 'connect-src')).toEqual([
      "'self'",
      'https://mempool.space',
      'https://sepolia.gateway.tenderly.co',
      'https://public.pimlico.io',
      'https://api.coingecko.com'
    ]);
  });

  it('drops URL paths, queries and credentials from origins', () => {
    const policy = buildContentSecurityPolicy({
      VITE_ETHEREUM_RPC_URL:
        'https://user:token@rpc.example.com/v3/secret?key=1'
    });

    expect(policy).not.toContain('secret');
    expect(policy).not.toContain('token');
    expect(getDirective(policy, 'connect-src')).toEqual([
      "'self'",
      'https://rpc.example.com'
    ]);
  });

  it('never allows inline or evaluated scripts', () => {
    const policy = buildContentSecurityPolicy(testnetEnv);

    expect(getDirective(policy, 'script-src')).toEqual(["'self'"]);
    expect(policy).not.toContain('unsafe-eval');
    expect(getDirective(policy, 'object-src')).toEqual(["'none'"]);
    expect(getDirective(policy, 'base-uri')).toEqual(["'none'"]);
  });

  it('rejects provider URLs that are not https', () => {
    expect(() =>
      buildContentSecurityPolicy({
        VITE_BITCOIN_API_URL: 'http://mempool.space/testnet4/api'
      })
    ).toThrow('VITE_BITCOIN_API_URL must use https://');
  });

  it('ignores blank provider values', () => {
    const policy = buildContentSecurityPolicy({ VITE_ETHEREUM_RPC_URL: ' ' });

    expect(getDirective(policy, 'connect-src')).toEqual(["'self'"]);
  });
});
