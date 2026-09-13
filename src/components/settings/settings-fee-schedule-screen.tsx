import { Button } from '@/components/ui/button';
import { useScreen } from '@/hooks/use-screen';
import {
  feePolicyDisclosureParagraphs,
  hasAcceptedFeePolicy,
  markFeePolicyAccepted
} from '@/lib/fee-policy-acceptance';
import {
  FEE_POLICY_VERSION,
  getActiveHoldingFeePolicies
} from '@/lib/holding-fee-policy';

import { SettingsPage } from './settings-page';

export const SettingsFeeScheduleScreen = () => {
  const { navigate } = useScreen();
  const policies = getActiveHoldingFeePolicies();
  const accepted = hasAcceptedFeePolicy();

  return (
    <SettingsPage
      title='Service Fee Schedule'
      onBack={() => navigate('settings', { direction: 'back' })}
      footer={
        <>
          {!accepted ? (
            <Button
              size='flow'
              data-testid='accept-fee-policy-button'
              onClick={() => {
                markFeePolicyAccepted(FEE_POLICY_VERSION);
                navigate('settings', { direction: 'back' });
              }}
            >
              ACKNOWLEDGE POLICY {FEE_POLICY_VERSION}
            </Button>
          ) : null}
          <Button
            size='flow'
            variant='secondary'
            onClick={() => navigate('settings', { direction: 'back' })}
          >
            BACK
          </Button>
        </>
      }
    >
      <div className='space-y-4 px-4 pt-5 text-base leading-normal text-foreground'>
        {feePolicyDisclosureParagraphs.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <div className='space-y-2 pt-4 text-sm text-muted-foreground'>
          {policies.map(policy => (
            <p
              key={policy.networkId}
              data-testid={`fee-policy-${policy.networkId}`}
            >
              {policy.networkId}: collection{' '}
              {policy.featureEnabled ? 'enabled' : 'disabled'} (libqc atomic
              support: {String(policy.collectionSupportedByLibqc)}; treasury
              config: {policy.treasuryAddressConfigId})
            </p>
          ))}
          <p>Accepted version: {accepted ? FEE_POLICY_VERSION : 'none'}</p>
        </div>
      </div>
    </SettingsPage>
  );
};
