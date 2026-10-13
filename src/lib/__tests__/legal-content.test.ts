import { describe, expect, it } from 'vitest';
import {
  legalDocumentOrder,
  legalDocuments,
  type LegalDocumentKey
} from '../legal-content';

const publicCopyPathByKey: Record<LegalDocumentKey, string> = {
  privacy: '../../../docs/legal/privacy-policy.md',
  terms: '../../../docs/legal/terms-of-use.md',
  licences: '../../../docs/legal/licences.md'
};

const renderMarkdown = (key: LegalDocumentKey) => {
  const document = legalDocuments[key];
  const sections = document.sections.map(section =>
    [`## ${section.heading}`, ...section.paragraphs].join('\n\n')
  );

  return [
    `# ${document.title}`,
    `_Last updated: ${document.lastUpdated}_`,
    ...sections
  ].join('\n\n');
};

describe('legal documents', () => {
  it.each(legalDocumentOrder)(
    'keeps the public %s copy identical to the in-app text',
    async key => {
      await expect(`${renderMarkdown(key)}\n`).toMatchFileSnapshot(
        publicCopyPathByKey[key]
      );
    }
  );
});
