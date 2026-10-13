/**
 * Deposit QR rendering settings. Scanners need a quiet zone of at least four
 * modules, and the excavated centre must stay small enough for level-H error
 * correction to recover: at this size a 69px keep-out does not decode, 40px
 * does.
 */
export const receiveQrSettings = {
  sizePx: 168,
  level: 'H',
  marginModules: 4,
  centerKeepOutSizePx: 40,
  centerIconSizePx: 28
} as const;

export const receiveQrCenterKeepOutDataUri = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${receiveQrSettings.centerKeepOutSizePx}' height='${receiveQrSettings.centerKeepOutSizePx}'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3C/svg%3E`;
