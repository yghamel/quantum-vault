import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@project-eleven/libqc', () => ({}));

import type { PasswordValidationResult } from '@project-eleven/libqc';

import { readPasswordFieldValues } from './password-field-dom';
import { PasswordStep } from './password-step';

const emptyPasswordValidation: PasswordValidationResult = {
  valid: false,
  requirements: {
    asciiOnly: true,
    minLength: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false
  },
  failedRequirements: [
    'minLength',
    'uppercase',
    'lowercase',
    'digit',
    'specialChar'
  ]
};

const renderPasswordStep = () =>
  renderToStaticMarkup(
    <PasswordStep
      passwordsMatch={false}
      passwordValidation={emptyPasswordValidation}
      isSubmitting={false}
      isPasswordReady={() => false}
      onPasswordChange={() => {}}
      onPasswordConfirmationChange={() => {}}
      onSubmit={() => {}}
      onBack={() => {}}
    />
  );

describe('PasswordStep', () => {
  it('keeps Continue enabled so an invalid submit can show feedback', () => {
    const html = renderPasswordStep();

    expect(html).toMatch(
      /<button[^>]*data-testid="password-continue-button"(?![^>]*disabled)[^>]*>/
    );
    expect(html).toContain('data-testid="back-button"');
  });

  it('hides the requirements checklist before any input', () => {
    expect(renderPasswordStep()).not.toContain(
      'data-testid="password-requirements"'
    );
  });
});

describe('readPasswordFieldValues', () => {
  it('reads the current input values', () => {
    const passwordInputRef = {
      current: { value: 'ValidPass123!' } as HTMLInputElement
    };
    const passwordConfirmationInputRef = {
      current: { value: 'ValidPass123?' } as HTMLInputElement
    };

    expect(
      readPasswordFieldValues({
        passwordInputRef,
        passwordConfirmationInputRef
      })
    ).toEqual({
      password: 'ValidPass123!',
      passwordConfirmation: 'ValidPass123?'
    });
  });

  it('returns empty strings when inputs are not mounted', () => {
    expect(readPasswordFieldValues({})).toEqual({
      password: '',
      passwordConfirmation: ''
    });
  });
});
