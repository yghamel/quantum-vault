import { expect, test, type Page } from '@playwright/test';

import { recoveryReplaceModalCopy } from '@/components/wallet-recovery/wallet-recovery-content.constants';

import {
  createWalletAndOpenHome,
  expectAddressToAppearInHomeSection,
  getPrimaryBitcoinAddress,
  getPrimaryEthereumAddress,
  openEthereumVaultDetail,
  openReceiveScreen,
  openSettingsScreen,
  openWithdrawDestinationStep,
  pasteRecoveryPhraseInput,
  settingsButtonName,
  TEST_RECOVERY_MNEMONIC,
  TEST_USER_PASSWORD,
  vaultLoadTimeoutMs
} from '../helpers';
import { installDeterministicRecoveryNetwork } from '../network-mocks';

const idleLockTimeout = '10:30';
const fundedEthBalanceHex = '0x2386f26fc10000';
const qrQuietZoneModules = 4;
const screenTransitionSettleMs = 2000;

const lockAndReturnToStart = async (page: Page): Promise<void> => {
  await openSettingsScreen(page);
  await page.getByTestId('lock-wallet-button').click();
  await page.getByRole('button', { name: settingsButtonName.lockNow }).click();
  await page.getByTestId('lock-back-button').click();
  await expect(page.getByTestId('initial-log-in-button')).toBeVisible({
    timeout: vaultLoadTimeoutMs
  });
};

const failBitcoinTransactionHistory = async (page: Page): Promise<void> => {
  const bitcoinApiUrl = process.env.VITE_BITCOIN_API_URL;
  if (!bitcoinApiUrl) {
    throw new Error('VITE_BITCOIN_API_URL is required for this test');
  }

  await page.route(`${new URL(bitcoinApiUrl).origin}/**`, async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.includes('/txs')) {
      await route.fulfill({ status: 503, body: 'unavailable' });
      return;
    }
    await route.fallback();
  });
};

test.describe('release guards @smoke @security', () => {
  test('shows STATUS UNKNOWN instead of SAFE when a vault status cannot be read', async ({
    page
  }) => {
    await installDeterministicRecoveryNetwork({ page });
    await failBitcoinTransactionHistory(page);
    await createWalletAndOpenHome({ page, withDeterministicNetwork: false });

    const bitcoinAddress = await getPrimaryBitcoinAddress(page);
    await expectAddressToAppearInHomeSection({
      page,
      address: bitcoinAddress,
      status: 'unknown'
    });
  });

  test('locks an open withdraw flow after the idle timeout', async ({
    page
  }) => {
    await page.clock.install();
    await installDeterministicRecoveryNetwork({
      page,
      resolveEthBalance: () => fundedEthBalanceHex
    });
    await createWalletAndOpenHome({ page, withDeterministicNetwork: false });

    const ethereumAddress = await getPrimaryEthereumAddress(page);
    await openEthereumVaultDetail(page, { address: ethereumAddress });
    await openWithdrawDestinationStep(page);

    await page.clock.fastForward(idleLockTimeout);
    // Web Animations run on the document timeline, which fastForward does not
    // advance, so the screen exit transition would otherwise never finish.
    await expect(async () => {
      await page.evaluate(() => {
        for (const animation of document.getAnimations()) {
          animation.finish();
        }
      });
      await expect(page.getByTestId('unlock-wallet-button')).toBeVisible({
        timeout: screenTransitionSettleMs
      });
    }).toPass({ timeout: vaultLoadTimeoutMs });
    await expect(page.getByTestId('withdraw-step-destination')).toHaveCount(0);
  });

  test('requires the password before resetting the wallet', async ({
    page
  }) => {
    await createWalletAndOpenHome({ page });
    await lockAndReturnToStart(page);

    await page.getByTestId('initial-reset-button').click();
    await expect(
      page.getByRole('heading', { name: 'Reset wallet?' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page.getByText('Password is required.')).toBeVisible();

    const passwordField = page
      .getByTestId('reset-wallet-password')
      .getByLabel('Password', { exact: true });
    await passwordField.fill('Wrong12345678!');
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page.getByText('Incorrect password.')).toBeVisible();
    await expect(page.getByTestId('initial-log-in-button')).toBeVisible();

    await passwordField.fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expect(page.getByTestId('initial-log-in-button')).toHaveCount(0, {
      timeout: vaultLoadTimeoutMs
    });
    await expect(page.getByTestId('initial-create-button')).toBeVisible();
  });

  test('warns before recovering over an existing wallet', async ({ page }) => {
    await createWalletAndOpenHome({ page });
    await lockAndReturnToStart(page);

    await page.getByTestId('initial-recover-button').click();
    await pasteRecoveryPhraseInput({ page, phrase: TEST_RECOVERY_MNEMONIC });
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(
      page.getByRole('heading', { name: recoveryReplaceModalCopy.title })
    ).toBeVisible();
    await page.getByRole('button', { name: 'No', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: recoveryReplaceModalCopy.title })
    ).toHaveCount(0);
    const wordCount = TEST_RECOVERY_MNEMONIC.split(' ').length;
    await expect(page.getByTestId('recovery-phrase-counter')).toHaveText(
      `${wordCount}/${wordCount}`
    );
  });

  test('renders the deposit QR code with a four-module quiet zone', async ({
    page
  }) => {
    await createWalletAndOpenHome({ page });
    await openReceiveScreen(page);
    await page.getByRole('button', { name: 'Bitcoin' }).first().click();

    const qrSvg = page.getByTestId('receive-qr-code').locator('svg').first();
    await expect(qrSvg).toBeVisible();

    const bounds = await qrSvg.evaluate(svg => {
      const viewBoxSize = svg.viewBox.baseVal.width;
      const modulePaths = [...svg.querySelectorAll('path')]
        .map(path => path.getAttribute('d') ?? '')
        .filter(d => !d.startsWith('M0,0') && !d.startsWith('M0 0'));
      const coordinates = modulePaths.flatMap(d =>
        [...d.matchAll(/M(\d+)[ ,](\d+)/g)].map(([, x, y]) => ({
          x: Number(x),
          y: Number(y)
        }))
      );
      return {
        viewBoxSize,
        minX: Math.min(...coordinates.map(point => point.x)),
        minY: Math.min(...coordinates.map(point => point.y))
      };
    });

    expect(bounds.minX).toBeGreaterThanOrEqual(qrQuietZoneModules);
    expect(bounds.minY).toBeGreaterThanOrEqual(qrQuietZoneModules);
    expect(bounds.viewBoxSize).toBeGreaterThan(qrQuietZoneModules * 2);
  });

  test('opens the Privacy Policy and Terms of Use from the start screen', async ({
    page
  }) => {
    await createWalletAndOpenHome({ page });
    await lockAndReturnToStart(page);

    await page.getByTestId('initial-legal-button').click();
    await expect(page.getByTestId('legal-document-title')).toHaveText(
      'Privacy Policy'
    );
    await page.getByTestId('legal-tab-terms').click();
    await expect(page.getByTestId('legal-document-title')).toHaveText(
      'Terms of Use'
    );
    await page.getByTestId('legal-back-button').click();
    await expect(page.getByTestId('initial-log-in-button')).toBeVisible();
  });
});
