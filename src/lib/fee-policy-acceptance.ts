import {
  FEE_DISCLOSURE_COPY,
  FEE_POLICY_VERSION
} from '@/lib/holding-fee-policy';

const feeAcceptanceStorageKey = 'quantum-vault-fee-policy-accepted';

export const hasAcceptedFeePolicy = (
  version: string = FEE_POLICY_VERSION
): boolean => {
  try {
    return localStorage.getItem(feeAcceptanceStorageKey) === version;
  } catch {
    return false;
  }
};

export const markFeePolicyAccepted = (
  version: string = FEE_POLICY_VERSION
): void => {
  try {
    localStorage.setItem(feeAcceptanceStorageKey, version);
  } catch {
    // Preferences write failure must not crash; disclosure will re-prompt.
  }
};

export const feePolicyDisclosureParagraphs: ReadonlyArray<string> = [
  FEE_DISCLOSURE_COPY.annualRate,
  FEE_DISCLOSURE_COPY.maxCap,
  FEE_DISCLOSURE_COPY.vaultWording,
  FEE_DISCLOSURE_COPY.nonCustodial,
  FEE_DISCLOSURE_COPY.testnetWarning,
  FEE_DISCLOSURE_COPY.collectionBlocked
];
