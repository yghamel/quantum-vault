import type { VaultLifecycleKind } from '@/modules/vaults/lifecycle/core';

const shouldHideActionsByLifecycleKind: Record<VaultLifecycleKind, boolean> = {
  safe: false,
  unknown: false,
  vulnerable: false,
  pending: true,
  sent: false,
  withdrawn: false
};

export const shouldHideVaultDetailActions = ({
  lifecycleKind
}: {
  lifecycleKind: VaultLifecycleKind;
}): boolean => shouldHideActionsByLifecycleKind[lifecycleKind];
