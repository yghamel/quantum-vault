import type { VaultStatus } from '../core';
import type { VaultSnapshot } from '../types';

export const resolveSnapshotWithStickyStatus = ({
  next,
  previousStatus
}: {
  next: VaultSnapshot;
  previousStatus: VaultStatus | null | undefined;
}): VaultSnapshot => {
  const stickyStatus: VaultStatus | null =
    next.status ?? previousStatus ?? null;
  return { ...next, status: stickyStatus };
};
