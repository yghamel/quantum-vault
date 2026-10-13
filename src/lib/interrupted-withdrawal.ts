/**
 * Remembers, for the life of the app process, that the session ended while a
 * withdrawal broadcast was in flight so Home can tell the user after unlock.
 */
let hasInterruptedWithdrawal = false;

export const markWithdrawalInterrupted = (): void => {
  hasInterruptedWithdrawal = true;
};

export const isWithdrawalInterrupted = (): boolean => hasInterruptedWithdrawal;

export const clearWithdrawalInterrupted = (): void => {
  hasInterruptedWithdrawal = false;
};
