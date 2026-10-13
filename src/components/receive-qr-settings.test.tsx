import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  receiveQrCenterKeepOutDataUri,
  receiveQrSettings
} from './receive-qr-settings';

const minimumQuietZoneModules = 4;
/** Largest keep-out share of the code width that still decoded on Apple's
 * CoreImage and Vision QR readers for Testnet4 and Sepolia addresses. */
const maximumKeepOutWidthShare = 0.24;

describe('receive QR settings', () => {
  it('keeps a four-module quiet zone around the code', () => {
    const markup = renderToStaticMarkup(
      <QRCodeSVG
        value='tb1q07fymc3nhh8vtvmp6suhurh7tpnkm290mtwug8'
        size={receiveQrSettings.sizePx}
        level={receiveQrSettings.level}
        marginSize={receiveQrSettings.marginModules}
      />
    );
    const darkPath = markup.match(/fill="#000000" d="M(\d+)[ ,](\d+)/);

    expect(receiveQrSettings.marginModules).toBeGreaterThanOrEqual(
      minimumQuietZoneModules
    );
    expect(Number(darkPath?.[1])).toBe(receiveQrSettings.marginModules);
    expect(Number(darkPath?.[2])).toBe(receiveQrSettings.marginModules);
  });

  it('keeps the centre keep-out small and light', () => {
    expect(
      receiveQrSettings.centerKeepOutSizePx / receiveQrSettings.sizePx
    ).toBeLessThanOrEqual(maximumKeepOutWidthShare);
    expect(receiveQrSettings.centerIconSizePx).toBeLessThan(
      receiveQrSettings.centerKeepOutSizePx
    );
    expect(receiveQrCenterKeepOutDataUri).toContain("fill='white'");
  });
});
