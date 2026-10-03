import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ScreenProps = {
  children: ReactNode;
  className?: string;
};

export const Screen = ({ children, className }: ScreenProps) => (
  <div
    className={cn(
      'flex h-(--popup-height) w-full min-w-0 max-w-full flex-col overflow-x-hidden overflow-y-auto overscroll-contain p-4 bg-background',
      className
    )}
  >
    {children}
  </div>
);
