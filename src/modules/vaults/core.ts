/**
 * Core vault status taxonomy used across Home + Vault Detail surfaces.
 *
 * `vaultStatuses` is the single source of truth for the visual grouping shown
 * on the Home screen (Figma 31:7140 sections: VULNERABLE / SAFE / WITHDRAWN,
 * plus STATUS UNKNOWN when the exposure status could not be read).
 * The derived `VaultStatus` union powers `Record`-based style lookups and
 * exhaustive pattern matching throughout the module.
 */

export const vaultStatuses = [
  'vulnerable',
  'unknown',
  'safe',
  'withdrawn'
] as const;

export type VaultStatus = (typeof vaultStatuses)[number];

export const vaultStatusLabels: Record<VaultStatus, string> = {
  vulnerable: 'VULNERABLE',
  unknown: 'STATUS UNKNOWN',
  safe: 'SAFE',
  withdrawn: 'BURNED'
};

/**
 * Ordering convention for the Home screen unified scroll view.
 * `vulnerable` first, then `unknown`, `safe` and `withdrawn`.
 */
export const homeSectionOrder: ReadonlyArray<VaultStatus> = vaultStatuses;
