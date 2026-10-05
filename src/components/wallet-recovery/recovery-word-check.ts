import { wordlist } from '@scure/bip39/wordlists/english.js';

const recoveryWords: ReadonlySet<string> = new Set(wordlist);

export const isRecoveryWord = (word: string): boolean =>
  recoveryWords.has(word);

export const findInvalidWordPositions = (words: readonly string[]): number[] =>
  words.flatMap((word, index) => (isRecoveryWord(word) ? [] : [index + 1]));
