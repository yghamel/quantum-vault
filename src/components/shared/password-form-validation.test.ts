import { describe, expect, it } from 'vitest';

import {
  getDisplayedInlineError,
  getPasswordConfirmationErrorOnBlur,
  getPasswordConfirmationErrorOnSubmit,
  getPasswordErrorOnBlur,
  getPasswordErrorOnSubmit
} from './password-form-validation';

describe('getPasswordErrorOnBlur', () => {
  it('returns undefined for an empty password', () => {
    const result = getPasswordErrorOnBlur({
      hasPassword: false,
      failedRequirements: ['minLength', 'uppercase']
    });

    expect(result).toBeUndefined();
  });

  it('returns the first mapped error when password is non-empty', () => {
    const result = getPasswordErrorOnBlur({
      hasPassword: true,
      failedRequirements: ['uppercase', 'digit']
    });

    expect(result).toBe('Add at least one uppercase letter.');
  });
});

describe('getPasswordConfirmationErrorOnBlur', () => {
  it('returns mismatch error when confirmation differs from password', () => {
    const result = getPasswordConfirmationErrorOnBlur({
      hasPasswordConfirmation: true,
      passwordsMatch: false
    });

    expect(result).toBe('Passwords do not match.');
  });

  it('returns undefined when confirmation is empty', () => {
    const result = getPasswordConfirmationErrorOnBlur({
      hasPasswordConfirmation: false,
      passwordsMatch: false
    });

    expect(result).toBeUndefined();
  });

  it('returns undefined when confirmation matches password', () => {
    const result = getPasswordConfirmationErrorOnBlur({
      hasPasswordConfirmation: true,
      passwordsMatch: true
    });

    expect(result).toBeUndefined();
  });
});

describe('getPasswordErrorOnSubmit', () => {
  it('requires a password when the field is empty', () => {
    expect(
      getPasswordErrorOnSubmit({
        hasPassword: false,
        failedRequirements: ['minLength']
      })
    ).toBe('Password is required.');
  });

  it('returns the first mapped error when password is non-empty', () => {
    expect(
      getPasswordErrorOnSubmit({
        hasPassword: true,
        failedRequirements: ['minLength']
      })
    ).toBe('Password is too short. Use at least 8 characters.');
  });

  it('returns undefined when every requirement passes', () => {
    expect(
      getPasswordErrorOnSubmit({ hasPassword: true, failedRequirements: [] })
    ).toBeUndefined();
  });
});

describe('getPasswordConfirmationErrorOnSubmit', () => {
  it('requires a confirmation when the field is empty', () => {
    expect(
      getPasswordConfirmationErrorOnSubmit({
        hasPasswordConfirmation: false,
        passwordsMatch: false
      })
    ).toBe('Confirm your password.');
  });

  it('returns mismatch error when confirmation differs from password', () => {
    expect(
      getPasswordConfirmationErrorOnSubmit({
        hasPasswordConfirmation: true,
        passwordsMatch: false
      })
    ).toBe('Passwords do not match.');
  });

  it('returns undefined when confirmation matches password', () => {
    expect(
      getPasswordConfirmationErrorOnSubmit({
        hasPasswordConfirmation: true,
        passwordsMatch: true
      })
    ).toBeUndefined();
  });
});

describe('getDisplayedInlineError', () => {
  it('hides error when field has not been touched', () => {
    const result = getDisplayedInlineError({
      isTouched: false,
      isFocused: false,
      hasValue: true,
      blurError: 'Some error'
    });

    expect(result).toBeUndefined();
  });

  it('hides error while user is focused and typing', () => {
    const result = getDisplayedInlineError({
      isTouched: true,
      isFocused: true,
      hasValue: true,
      blurError: 'Some error'
    });

    expect(result).toBeUndefined();
  });

  it('hides error when value is empty', () => {
    const result = getDisplayedInlineError({
      isTouched: true,
      isFocused: false,
      hasValue: false,
      blurError: 'Some error'
    });

    expect(result).toBeUndefined();
  });

  it('shows latest blur error when touched and unfocused', () => {
    const result = getDisplayedInlineError({
      isTouched: true,
      isFocused: false,
      hasValue: true,
      blurError: 'Some error'
    });

    expect(result).toBe('Some error');
  });
});
