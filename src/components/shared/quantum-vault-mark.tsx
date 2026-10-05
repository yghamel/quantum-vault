import type { SVGProps } from 'react';

/**
 * Quantum Vault brand mark (vault door with dial) used on the initial, lock,
 * and wallet-created success screens. Strokes use `currentColor` so the mark
 * inherits the text color of its parent.
 */
export const QuantumVaultMark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width='40'
    height='40'
    viewBox='0 0 40 40'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
    {...props}
  >
    <rect
      x='1.75'
      y='1.75'
      width='36.5'
      height='36.5'
      rx='3'
      stroke='currentColor'
      strokeWidth='2.5'
    />
    <circle cx='21' cy='20' r='9' stroke='currentColor' strokeWidth='2.5' />
    <path
      d='M21 11V29M13.2 15.5L28.8 24.5M13.2 24.5L28.8 15.5M6.5 10V14M6.5 26V30'
      stroke='currentColor'
      strokeWidth='2.5'
      strokeLinecap='round'
    />
    <circle cx='21' cy='20' r='3' fill='currentColor' />
  </svg>
);
