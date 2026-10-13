/**
 * In-app Privacy Policy, Terms of Use and open-source licence notice.
 * `docs/legal/*.md` mirror this text for the public URLs; update both together.
 *
 * Values in `legalPlaceholders` must be replaced before release;
 * `scripts/validate-prod.mjs` fails a production build while they remain.
 */

export const legalPlaceholders = {
  supportEmail: '[SUPPORT EMAIL – TO BE CONFIRMED]',
  province: '[PROVINCE – TO BE CONFIRMED]'
} as const;

const publisher = 'Lucid Intel Limited';
const appName = 'Quantum Vault Wallet';
const lastUpdated = '12 October 2026';

export type LegalDocumentKey = 'privacy' | 'terms' | 'licences';

type LegalSection = {
  heading: string;
  paragraphs: ReadonlyArray<string>;
};

type LegalDocument = {
  tabLabel: string;
  title: string;
  lastUpdated: string;
  sections: ReadonlyArray<LegalSection>;
};

export const legalDocumentOrder: ReadonlyArray<LegalDocumentKey> = [
  'privacy',
  'terms',
  'licences'
];

const mitLicenceText = [
  'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:',
  'The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.',
  'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.'
] as const;

export const legalDocuments: Record<LegalDocumentKey, LegalDocument> = {
  privacy: {
    tabLabel: 'Privacy',
    title: 'Privacy Policy',
    lastUpdated,
    sections: [
      {
        heading: 'Who we are',
        paragraphs: [
          `${appName} is published by ${publisher} ("we", "us"). Contact us at ${legalPlaceholders.supportEmail}.`
        ]
      },
      {
        heading: 'Summary',
        paragraphs: [
          'You do not need an account. We do not run servers that receive your wallet data, and the app contains no analytics, advertising or tracking.',
          'We never see your recovery phrase, password or private keys. They do not leave your device.'
        ]
      },
      {
        heading: 'What is stored on your device',
        paragraphs: [
          'Your recovery phrase and keys are encrypted with your password and stored in the iOS Keychain. They are only available while your device is unlocked and are not transferred to other devices.',
          'The app also stores your vault addresses, recent withdrawal records, your display currency and a count of failed password attempts.',
          'Use Delete Quantum Vault in Settings to erase this data. iOS may keep Keychain items after the app is removed, so delete your vault in the app first.'
        ]
      },
      {
        heading: 'Services the app contacts',
        paragraphs: [
          'To show balances and send withdrawals, the app connects directly to these services: mempool.space (Bitcoin Testnet4 balances, transactions and fee rates), Tenderly (Ethereum Sepolia network access), Pimlico (submitting Ethereum Sepolia withdrawals) and CoinGecko (prices).',
          'These services receive your public vault addresses, the transactions you submit and, as with any internet request, your IP address. Their own privacy policies apply, and we do not control them.',
          'Blockchain transactions are public and permanent. Anyone can see the addresses, amounts and times of transactions you make.',
          'Transaction links open the public block explorers mempool.space and sepolia.etherscan.io in your browser.'
        ]
      },
      {
        heading: 'What we do not collect',
        paragraphs: [
          'We do not collect your name, email address, contacts, location, device identifiers, crash reports, usage analytics or advertising identifiers.'
        ]
      },
      {
        heading: 'Children',
        paragraphs: [`${appName} is not intended for anyone under 18.`]
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'Depending on where you live, including under Canadian privacy law and the EU and UK GDPR, you may have rights to access, correct or delete personal information. We do not hold personal information about you. For information held by the services above, contact them directly. For any question, contact us.'
        ]
      },
      {
        heading: 'Changes',
        paragraphs: [
          'If we change this policy, we will update it in the app and change the date above.'
        ]
      }
    ]
  },
  terms: {
    tabLabel: 'Terms',
    title: 'Terms of Use',
    lastUpdated,
    sections: [
      {
        heading: 'Agreement',
        paragraphs: [
          `These terms are an agreement between you and ${publisher}. By using ${appName} you accept them. You must be at least 18 years old.`
        ]
      },
      {
        heading: 'Testnet only',
        paragraphs: [
          'This version works only on Bitcoin Testnet4 and Ethereum Sepolia. Testnet coins have no monetary value.',
          'Never send real bitcoin or ether to a vault address. Funds sent from a main network may be permanently lost.'
        ]
      },
      {
        heading: 'You control your wallet',
        paragraphs: [
          `${appName} is a self-custody wallet. Only you hold your recovery phrase and password. We cannot see, recover or reset them, and we cannot reverse transactions.`,
          'If you lose your recovery phrase, you lose access to your vaults.'
        ]
      },
      {
        heading: 'Limits of quantum protection',
        paragraphs: [
          'A vault keeps its public key hidden until it sends a transaction. This reduces exposure to a future quantum computer; it does not make coins quantum-proof, and we make no guarantee about future attacks.',
          'Withdrawing reveals the vault’s public key. The vault is then burned and must not be used again. Withdrawn coins are only as protected as the address that receives them.'
        ]
      },
      {
        heading: 'Fees',
        paragraphs: [
          `${appName} charges no fees of any kind. Blockchain networks charge a network fee when you withdraw, which is shown before you confirm.`,
          'On Ethereum the maximum possible network fee is reserved. Any unused part stays in the vault’s network deposit and is not sent to the recipient.'
        ]
      },
      {
        heading: 'Third-party services',
        paragraphs: [
          'The app relies on independent network services, listed in the Privacy Policy. They may be slow, unavailable or inaccurate, and we are not responsible for them.'
        ]
      },
      {
        heading: 'Acceptable use',
        paragraphs: [
          'You must use the app lawfully. You confirm that you are not located in a country subject to a Canadian or United States government embargo and are not on any government list of prohibited or restricted parties.'
        ]
      },
      {
        heading: 'Open-source software',
        paragraphs: [
          `${appName} includes open-source software under the MIT License. The licence notices are in the Licences tab.`
        ]
      },
      {
        heading: 'No warranty',
        paragraphs: [
          'The app is provided "as is" and "as available", without warranties of any kind, to the fullest extent permitted by law.'
        ]
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          `To the fullest extent permitted by law, ${publisher} is not liable for any loss of funds, data or profits, or for any indirect or consequential loss, arising from your use of the app.`
        ]
      },
      {
        heading: 'Changes and ending use',
        paragraphs: [
          'We may update these terms. Continuing to use the app after an update means you accept the new terms. You may stop using the app at any time.'
        ]
      },
      {
        heading: 'Governing law',
        paragraphs: [
          `These terms are governed by the laws of the Province of ${legalPlaceholders.province} and the federal laws of Canada that apply there. The courts of that province have jurisdiction, unless the law where you live gives you other rights.`
        ]
      },
      {
        heading: 'Apple App Store',
        paragraphs: [
          `These terms are between you and ${publisher}, not Apple. ${publisher}, not Apple, is responsible for the app, its support and any claims about it, including product liability, legal compliance and intellectual property claims.`,
          'Apple has no obligation to provide maintenance or support. If the app fails to meet any applicable warranty, you may notify Apple, and Apple will refund the purchase price, if any; Apple has no other warranty obligation.',
          'Apple and its subsidiaries are third-party beneficiaries of these terms and may enforce them against you.'
        ]
      },
      {
        heading: 'Contact',
        paragraphs: [`${publisher} — ${legalPlaceholders.supportEmail}`]
      }
    ]
  },
  licences: {
    tabLabel: 'Licences',
    title: 'Open-source licences',
    lastUpdated,
    sections: [
      {
        heading: 'Quantum Vault Wallet and libqc — MIT License',
        paragraphs: [
          'Copyright (c) 2025-2026 Project Eleven',
          ...mitLicenceText
        ]
      },
      {
        heading: 'Other components',
        paragraphs: [
          'Other open-source components included in the app remain under their own licences, which are distributed with their source code.'
        ]
      }
    ]
  }
};
