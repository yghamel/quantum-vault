export const cspConnectEnvKeys = [
  'VITE_BITCOIN_API_URL',
  'VITE_ETHEREUM_RPC_URL',
  'VITE_ETHEREUM_BUNDLER_RPC_URL',
  'VITE_ASSET_PRICES_URL'
] as const;

export const cspImageOrigins = ['https://assets.coingecko.com'] as const;

const toHttpsOrigin = (key: string, value: string): string => {
  const url = new URL(value);
  if (url.protocol !== 'https:') {
    throw new Error(`${key} must use https:// to be allowed by the CSP`);
  }
  return url.origin;
};

/**
 * Builds the CSP meta-tag value for the bundled app. `connect-src` is
 * limited to the configured provider origins, so a compromised dependency
 * cannot send data anywhere else (including viem CCIP-read gateways).
 */
export const buildContentSecurityPolicy = (
  env: Readonly<Record<string, string | undefined>>
): string => {
  const connectOrigins = [
    ...new Set(
      cspConnectEnvKeys.flatMap(key => {
        const value = env[key]?.trim();
        return value ? [toHttpsOrigin(key, value)] : [];
      })
    )
  ];

  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: ${cspImageOrigins.join(' ')}`,
    "font-src 'self'",
    `connect-src 'self' ${connectOrigins.join(' ')}`.trimEnd(),
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-src 'none'",
    "worker-src 'none'"
  ].join('; ');
};
