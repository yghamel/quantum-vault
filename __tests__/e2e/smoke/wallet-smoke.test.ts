import { expect, test, type Page } from '@playwright/test';

import {
  clickActiveBackButton,
  createWalletAndOpenHome,
  expectCopiedToClipboardToast,
  expectCurrencyOptionChecked,
  expectHomeVisible,
  expectInitialEntryVisible,
  expectSettingsScreenVisible,
  expectUnifiedHomeSectionOrder,
  exportSecretPhraseTestId,
  getCurrencyOption,
  getPrimaryBitcoinAddress,
  getPrimaryEthereumAddress,
  installClipboardMock,
  openExportKeysPasswordGate,
  openSettingsScreen,
  openSettingsSubScreen,
  openBitcoinVaultDetail,
  openEthereumVaultDetail,
  openReceiveScreen,
  receiveSelectedAddressByAddress,
  readRecoveryPhraseRevealPageWords,
  readCopiedClipboardText,
  recoverWalletAndOpenHome,
  settingsButtonName,
  TEST_USER_PASSWORD,
  unlockWalletIfPrompted
} from '../helpers';

const recoveryPhraseWordCount = 24;
const continueButtonName = /^Continue$/i;

const expectInvalidPasswordToast = async (page: Page): Promise<void> => {
  await expect(
    page
      .locator('[data-sonner-toast]')
      .filter({ hasText: 'Invalid password.' })
      .first()
  ).toBeVisible();
};

const lockWalletFromSettings = async (page: Page): Promise<void> => {
  await page.getByTestId('lock-wallet-button').click();
  await expect(
    page.getByRole('heading', { name: 'Lock Wallet' })
  ).toBeVisible();
  await page.getByRole('button', { name: settingsButtonName.lockNow }).click();
  await expect(page.getByRole('button', { name: 'Unlock' })).toBeVisible();
};

test.describe('wallet smoke @smoke', () => {
  test('creates a wallet and lands on home', async ({ page }) => {
    await createWalletAndOpenHome({ page });
    await expectUnifiedHomeSectionOrder(page);
  });

  test('completes mnemonic confirmation without runtime crash', async ({
    page
  }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const mnemonicConfirmationCrashMessage =
      'Expected mnemonic after password submission to be present';

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await createWalletAndOpenHome({
      page,
      backupMode: 'verify'
    });
    await expectUnifiedHomeSectionOrder(page);

    const encounteredMnemonicCrash =
      pageErrors.some(error =>
        error.includes(mnemonicConfirmationCrashMessage)
      ) ||
      consoleErrors.some(error =>
        error.includes(mnemonicConfirmationCrashMessage)
      );

    expect(encounteredMnemonicCrash).toBe(false);
  });

  test('locks and unlocks the wallet', async ({ page }) => {
    await createWalletAndOpenHome({ page });

    await openSettingsScreen(page);
    await lockWalletFromSettings(page);

    await unlockWalletIfPrompted(page, TEST_USER_PASSWORD);
    await expectHomeVisible(page);
  });

  test('keeps the selected currency across lock and unlock', async ({
    page
  }) => {
    await createWalletAndOpenHome({ page });

    await openSettingsScreen(page);
    await openSettingsSubScreen({
      page,
      actionName: settingsButtonName.changeCurrency,
      screenName: 'Currency'
    });
    await expectCurrencyOptionChecked({ page, currencyCode: 'usd' });

    await getCurrencyOption(page, 'eur').click();
    await expectCurrencyOptionChecked({ page, currencyCode: 'eur' });

    await clickActiveBackButton(page);
    await expectSettingsScreenVisible(page);
    await clickActiveBackButton(page);
    await expectHomeVisible(page);

    await openSettingsScreen(page);
    await lockWalletFromSettings(page);
    await unlockWalletIfPrompted(page, TEST_USER_PASSWORD);
    await expectHomeVisible(page);
    await openSettingsScreen(page);
    await openSettingsSubScreen({
      page,
      actionName: settingsButtonName.changeCurrency,
      screenName: 'Currency'
    });
    await expectCurrencyOptionChecked({ page, currencyCode: 'eur' });
  });

  test('cancels export keys from the password gate and returns to settings', async ({
    page
  }) => {
    await createWalletAndOpenHome({ page });

    await openSettingsScreen(page);
    await openExportKeysPasswordGate(page);

    await page.getByTestId('export-recovery-phrase-back-button').click();
    await expect(
      page.getByRole('heading', { name: 'Stop export recovery phrase?' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'No', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Confirm Your Password' })
    ).toBeVisible();

    await page.getByTestId('export-recovery-phrase-back-button').click();
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await expectSettingsScreenVisible(page);

    await clickActiveBackButton(page);
    await expectHomeVisible(page);
  });

  test('exports keys after the password gate without touching the clipboard', async ({
    page
  }) => {
    await installClipboardMock(page);
    await createWalletAndOpenHome({ page });

    await openSettingsScreen(page);
    await openExportKeysPasswordGate(page);
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByTestId(exportSecretPhraseTestId)).toHaveCount(0);

    await page.getByLabel('Password', { exact: true }).fill('Wrong12345678!');
    await page.getByRole('button', { name: continueButtonName }).click();
    await expectInvalidPasswordToast(page);
    await expect(
      page.getByRole('heading', { name: 'Confirm Your Password' })
    ).toBeVisible();
    await expect(page.getByTestId(exportSecretPhraseTestId)).toHaveCount(0);

    await page.getByLabel('Password', { exact: true }).fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: continueButtonName }).click();
    await expect(
      page.getByRole('heading', { name: 'Export Keys' })
    ).toBeVisible();
    await expect(page.getByTestId(exportSecretPhraseTestId)).toHaveCount(0);

    await page
      .getByRole('button', { name: settingsButtonName.revealKeys })
      .click();
    await expect(page.getByTestId(exportSecretPhraseTestId)).toBeVisible();
    const revealedWords = await readRecoveryPhraseRevealPageWords({
      page,
      secretPhraseTestId: exportSecretPhraseTestId
    });
    expect(revealedWords).toHaveLength(recoveryPhraseWordCount);
    await expect(
      page.getByRole('button', { name: settingsButtonName.copy })
    ).toHaveCount(0);

    await page.getByTestId('confirm-recovery-phrase-written').click();
    await expectSettingsScreenVisible(page);
    expect(await readCopiedClipboardText(page)).toBe('');
  });

  test('deletes quantum vault and returns to the initial state', async ({
    page
  }) => {
    await createWalletAndOpenHome({ page });

    await openSettingsScreen(page);
    await openSettingsSubScreen({
      page,
      actionName: settingsButtonName.deleteQuantumVault,
      screenName: 'Delete Quantum Vault'
    });
    await page.getByTestId('confirm-delete-wallet-button').click();
    await expect(page.getByText('Password is required.')).toBeVisible();

    await page
      .getByLabel('Enter your password to confirm')
      .fill('Wrong12345678!');
    await page.getByTestId('confirm-delete-wallet-button').click();
    await expect(page.getByText('Incorrect password.')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Delete Quantum Vault' })
    ).toBeVisible();

    await page
      .getByLabel('Enter your password to confirm')
      .fill(TEST_USER_PASSWORD);
    await page.getByTestId('confirm-delete-wallet-button').click();

    await expectInitialEntryVisible(page);
  });

  // The web build keeps vault storage in memory only, so the test cannot
  // remove a stored key from outside the app.
  test.skip('shows formatted libqc export error when recovery phrase storage is missing', async ({
    page
  }) => {
    await createWalletAndOpenHome({ page });
    await page.evaluate(() => localStorage.removeItem('vault_state.entropy'));

    await page.getByTestId('settings-button').click();
    await page.getByTestId('export-keys-button').click();
    await page.getByLabel('Password', { exact: true }).fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(
      page
        .locator('[data-sonner-toast]')
        .filter({
          hasText: 'Export failed: Seed not found in storage'
        })
        .first()
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Confirm Your Password' })
    ).toBeVisible();
  });

  test('recovers a wallet and shows deterministic vaults', async ({ page }) => {
    await recoverWalletAndOpenHome({ page });
    await expectUnifiedHomeSectionOrder(page);
  });

  test('renders deposit network selection and address copy', async ({
    page
  }) => {
    await installClipboardMock(page);
    await createWalletAndOpenHome({ page });

    await openReceiveScreen(page);

    await expect(page.getByTestId('receive-chain-selection')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ethereum' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bitcoin' })).toBeVisible();

    await page.getByRole('button', { name: 'Ethereum' }).first().click();
    await expect(page.getByTestId('receive-qr-code')).toBeVisible();
    await expect(
      page.locator(
        '[data-testid="receive-selected-address"][data-address^="0x"]'
      )
    ).toBeVisible();

    const ethereumAddress = await page
      .locator('[data-testid="receive-selected-address"][data-address^="0x"]')
      .first()
      .getAttribute('data-address');

    await page.getByTestId('receive-inline-copy-address-button').click();
    await expectCopiedToClipboardToast(page);
    expect(await readCopiedClipboardText(page)).toBe(ethereumAddress);

    await page.getByTestId('receive-copy-address-button').click();
    await expectCopiedToClipboardToast(page);
    expect(await readCopiedClipboardText(page)).toBe(ethereumAddress);

    await page.getByTestId('back-button').click();
    await expect(page.getByTestId('receive-screen')).toBeVisible();

    await page.getByRole('button', { name: 'Bitcoin' }).first().click();
    await expect(
      page.locator(
        '[data-testid="receive-selected-address"][data-address^="tb1"]'
      )
    ).toBeVisible();

    await page.getByTestId('back-button').click();
    await page.getByTestId('back-button').click();
    await expectHomeVisible(page);
  });

  test('opens selected vault detail account in deposit flow', async ({
    page
  }) => {
    await createWalletAndOpenHome({ page });

    const ethereumAddress = await getPrimaryEthereumAddress(page);
    await openEthereumVaultDetail(page, {
      address: ethereumAddress,
      withdrawButtonExpectation: 'hidden'
    });
    await page.getByRole('button', { name: 'Deposit' }).click();

    await expect(page.getByTestId('receive-address-view')).toBeVisible();
    await expect(
      receiveSelectedAddressByAddress(page, ethereumAddress)
    ).toBeVisible();

    await page.getByTestId('back-button').click();
    await expect(
      page.getByTestId('vault-detail-copy-address-button')
    ).toBeVisible();
    await page.getByTestId('vault-detail-back-button').click();
    await expectHomeVisible(page);
  });

  test('copies vault detail address from header icon', async ({ page }) => {
    await installClipboardMock(page);
    await createWalletAndOpenHome({ page });

    const bitcoinAddress = await getPrimaryBitcoinAddress(page);
    await openBitcoinVaultDetail(page, {
      address: bitcoinAddress,
      withdrawButtonExpectation: 'hidden'
    });

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const copyButton = document.querySelector<HTMLButtonElement>(
            '[data-testid="vault-detail-copy-address-button"]'
          );
          if (!copyButton) {
            return false;
          }
          copyButton.click();
          return true;
        })
      )
      .toBe(true);
    await expectCopiedToClipboardToast(page);
    expect(await readCopiedClipboardText(page)).toBe(bitcoinAddress);
  });
});
