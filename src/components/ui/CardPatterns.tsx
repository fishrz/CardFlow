import React from 'react';
import { CreditCard } from '@/types';

export const CardPatternOverlay: React.FC<{ pattern: CreditCard['pattern'], className?: string }> = ({ pattern, className }) => {
  if (pattern === 'none') return null;

  return (
    <div className={`absolute inset-0 opacity-20 pointer-events-none ${className}`}>
      {pattern === 'circles' && (
        <svg width="100%" height="100%">
          <circle cx="10%" cy="10%" r="20" fill="white" />
          <circle cx="90%" cy="80%" r="50" fill="white" />
          <circle cx="50%" cy="50%" r="30" fill="white" />
        </svg>
      )}
      {pattern === 'waves' && (
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <path d="M0,50 Q50,30 100,50 T200,50 T300,50 V100 H0 Z" fill="white" opacity="0.5" />
          <path d="M0,70 Q50,50 100,70 T200,70 T300,70 V100 H0 Z" fill="white" opacity="0.3" />
        </svg>
      )}
      {pattern === 'geometric' && (
        <svg width="100%" height="100%">
           <rect x="10" y="10" width="40" height="40" stroke="white" strokeWidth="2" fill="none" transform="rotate(15)" />
           <rect x="80%" y="20%" width="60" height="60" stroke="white" strokeWidth="1" fill="none" transform="rotate(-10)" />
           <polygon points="50,150 100,100 150,150" stroke="white" strokeWidth="1" fill="none" />
        </svg>
      )}
      {pattern === 'lines' && (
        <svg width="100%" height="100%">
           <defs>
             <pattern id="diagonalLines" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
               <line x1="0" y1="0" x2="0" y2="10" style={{stroke:'white', strokeWidth:1}} />
             </pattern>
           </defs>
           <rect width="100%" height="100%" fill="url(#diagonalLines)" />
        </svg>
      )}
    </div>
  );
};

