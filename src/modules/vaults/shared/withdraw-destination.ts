import { isAddress } from '@project-eleven/libqc';

const zeroAddress = '0x0000000000000000000000000000000000000000';

export const withdrawDestinationErrors = {
  invalidEvmAddress: 'Please enter a valid EVM address.',
  zeroAddress: 'Funds sent to the zero address are permanently lost.',
  sourceAddress: 'This is the vault you are withdrawing from.'
} as const;

const getNamespaceError = (
  namespace: string,
  destination: string
): string | null => {
  switch (namespace) {
    // Network and format are enforced by libqc when the sweep is built.
    case 'bip122':
      return null;
    case 'eip155':
      if (!isAddress(destination)) {
        return withdrawDestinationErrors.invalidEvmAddress;
      }
      return destination.toLowerCase() === zeroAddress
        ? withdrawDestinationErrors.zeroAddress
        : null;
    default:
      throw new Error(`Unsupported withdraw namespace: ${namespace}`);
  }
};

export const getWithdrawDestinationError = ({
  destination,
  namespace,
  sourceAddress
}: {
  destination: string;
  namespace: string;
  sourceAddress: string;
}): string | null => {
  const namespaceError = getNamespaceError(namespace, destination);
  if (namespaceError) {
    return namespaceError;
  }

  // Vault addresses are bech32 or EVM hex, both case-insensitive.
  return destination.toLowerCase() === sourceAddress.toLowerCase()
    ? withdrawDestinationErrors.sourceAddress
    : null;
};
