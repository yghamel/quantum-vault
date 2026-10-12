import { describe, expect, it } from 'vitest';
import {
  getWithdrawDestinationError,
  withdrawDestinationErrors
} from './withdraw-destination';

const evmSource = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed';
const evmSourceChecksummed = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
const evmOther = '0x2222222222222222222222222222222222222222';
const btcSource = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx';
const btcOther =
  'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7';

describe('getWithdrawDestinationError', () => {
  it('accepts a valid EVM destination that is not the source', () => {
    expect(
      getWithdrawDestinationError({
        destination: evmOther,
        namespace: 'eip155',
        sourceAddress: evmSource
      })
    ).toBeNull();
  });

  it.each(['', 'not-an-address', '0x1234', `${evmOther}00`])(
    'rejects malformed EVM destination %j',
    destination => {
      expect(
        getWithdrawDestinationError({
          destination,
          namespace: 'eip155',
          sourceAddress: evmSource
        })
      ).toBe(withdrawDestinationErrors.invalidEvmAddress);
    }
  );

  it('rejects an EVM address with a bad mixed-case checksum', () => {
    expect(
      getWithdrawDestinationError({
        destination: '0xaBcdef1234567890aBCDef1234567890ABcdeF12',
        namespace: 'eip155',
        sourceAddress: evmSource
      })
    ).toBe(withdrawDestinationErrors.invalidEvmAddress);
  });

  it('rejects the EVM zero address', () => {
    expect(
      getWithdrawDestinationError({
        destination: '0x0000000000000000000000000000000000000000',
        namespace: 'eip155',
        sourceAddress: evmSource
      })
    ).toBe(withdrawDestinationErrors.zeroAddress);
  });

  it('rejects the checksummed form of the source EVM address', () => {
    expect(
      getWithdrawDestinationError({
        destination: evmSourceChecksummed,
        namespace: 'eip155',
        sourceAddress: evmSource
      })
    ).toBe(withdrawDestinationErrors.sourceAddress);
  });

  it('accepts a bitcoin destination that is not the source', () => {
    expect(
      getWithdrawDestinationError({
        destination: btcOther,
        namespace: 'bip122',
        sourceAddress: btcSource
      })
    ).toBeNull();
  });

  it('rejects the source bitcoin address regardless of case', () => {
    expect(
      getWithdrawDestinationError({
        destination: btcSource.toUpperCase(),
        namespace: 'bip122',
        sourceAddress: btcSource
      })
    ).toBe(withdrawDestinationErrors.sourceAddress);
  });

  it('throws for an unsupported namespace', () => {
    expect(() =>
      getWithdrawDestinationError({
        destination: evmOther,
        namespace: 'solana',
        sourceAddress: evmSource
      })
    ).toThrow('Unsupported withdraw namespace: solana');
  });
});
