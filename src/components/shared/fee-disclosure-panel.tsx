import {
  FEE_DISCLOSURE_COPY,
  FEE_POLICY_VERSION
} from '@/lib/holding-fee-policy';
import {
  hasAcceptedFeePolicy,
  markFeePolicyAccepted
} from '@/lib/fee-policy-acceptance';
import { Button } from '@/components/ui/button';

type FeeDisclosurePanelProps = {
  /** Require acknowledge before continuing (e.g. first receive). */
  requireAcknowledge?: boolean;
  onAcknowledged?: () => void;
  compact?: boolean;
};

/**
 * Holding-duration service-fee disclosure. Collection may still be disabled;
 * users must still see the 2%/10% policy and non-custodial wording.
 */
export const FeeDisclosurePanel = ({
  requireAcknowledge = false,
  onAcknowledged,
  compact = false
}: FeeDisclosurePanelProps) => {
  const accepted = hasAcceptedFeePolicy(FEE_POLICY_VERSION);

  return (
    <div
      data-testid='fee-disclosure-panel'
      className={
        compact
          ? 'space-y-2 border border-popover px-3 py-3 text-sm text-muted-foreground'
          : 'space-y-3 border border-popover px-4 py-4 text-base text-foreground'
      }
    >
      <p className='font-medium text-foreground'>Service fee schedule</p>
      <p>{FEE_DISCLOSURE_COPY.annualRate}</p>
      <p>{FEE_DISCLOSURE_COPY.maxCap}</p>
      <p>{FEE_DISCLOSURE_COPY.vaultWording}</p>
      <p>{FEE_DISCLOSURE_COPY.nonCustodial}</p>
      <p>{FEE_DISCLOSURE_COPY.testnetWarning}</p>
      <p className='text-muted-foreground'>
        {FEE_DISCLOSURE_COPY.collectionBlocked}
      </p>
      {requireAcknowledge && !accepted ? (
        <Button
          size='flow'
          data-testid='fee-disclosure-acknowledge'
          onClick={() => {
            markFeePolicyAccepted(FEE_POLICY_VERSION);
            onAcknowledged?.();
          }}
        >
          ACKNOWLEDGE FEE POLICY
        </Button>
      ) : null}
    </div>
  );
};
