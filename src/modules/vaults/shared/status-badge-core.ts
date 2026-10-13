export const statusBadgeKinds = [
  'safe',
  'unknown',
  'vulnerable',
  'withdrawn'
] as const;

export type StatusBadgeKind = (typeof statusBadgeKinds)[number];
