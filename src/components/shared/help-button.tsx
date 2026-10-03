import { AnimatePresence, motion } from 'framer-motion';
import { CircleHelpIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useKeyDown } from '@/hooks/use-key-down';
import { cn } from '@/lib/utils';

import { ScrollableQuantumVaultAbout } from './quantum-vault-about';

type HelpButtonProps = {
  className?: string;
};

/**
 * Help icon that opens the Quantum Vault about text in a full-screen sheet.
 * The sheet is portalled to `document.body` because screen transitions apply
 * transforms, which would otherwise trap `position: fixed`.
 */
export const HelpButton = ({ className }: HelpButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useKeyDown({
    keys: ['Escape'],
    handler: () => setIsOpen(false)
  });

  return (
    <>
      <button
        type='button'
        aria-label='Help'
        data-testid='help-button'
        className={cn(
          'flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <CircleHelpIcon className='size-5' aria-hidden='true' />
      </button>

      {portalTarget &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                role='dialog'
                aria-modal='true'
                aria-label='About Quantum Vault'
                data-testid='help-sheet'
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className='fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
              >
                <div className='flex h-12 shrink-0 items-center justify-end px-4'>
                  <button
                    type='button'
                    aria-label='Close help'
                    data-testid='help-close-button'
                    className='flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
                    onClick={() => setIsOpen(false)}
                  >
                    <XIcon className='size-5' aria-hidden='true' />
                  </button>
                </div>
                <ScrollableQuantumVaultAbout className='flex-1 px-4 pb-4' />
              </motion.div>
            )}
          </AnimatePresence>,
          portalTarget
        )}
    </>
  );
};
