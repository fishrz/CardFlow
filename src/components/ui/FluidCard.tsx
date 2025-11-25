import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from '@/types';
import { getCardStatus, formatCurrency } from '@/lib/finance';
import { cn } from '@/lib/utils';
import { CardPatternOverlay } from './CardPatterns';

interface FluidCardProps {
  card: CreditCard;
  balance: number;
  onClick?: () => void;
  layoutId?: string;
  minimal?: boolean;
}

const bankGradients: Record<string, string> = {
  blue: 'from-blue-500 via-blue-600 to-blue-800',
  red: 'from-red-500 via-red-600 to-red-800',
  green: 'from-emerald-500 via-emerald-600 to-emerald-800',
  orange: 'from-orange-400 via-orange-500 to-orange-700',
  purple: 'from-purple-500 via-purple-600 to-purple-800',
  black: 'from-slate-800 via-slate-900 to-black',
  pink: 'from-pink-500 via-pink-600 to-pink-800',
  cyan: 'from-cyan-400 via-cyan-500 to-cyan-700',
  slate: 'from-slate-400 via-slate-500 to-slate-700',
};

export const FluidCard: React.FC<FluidCardProps> = ({ card, balance, onClick, layoutId, minimal = false }) => {
  const { daysUntilDue, dueDate, status } = getCardStatus(card);

  return (
    <motion.div
      layoutId={layoutId}
      whileHover={!minimal ? { scale: 1.02, y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)" } : {}}
      whileTap={!minimal ? { scale: 0.96 } : {}}
      className={cn(
        "relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white shadow-floating overflow-hidden transition-all duration-300",
        "bg-gradient-to-br",
        bankGradients[card.color] || bankGradients.black,
        minimal ? "cursor-default" : "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Pattern Overlay */}
      <CardPatternOverlay pattern={card.pattern} />

      {/* Glossy Shine Effect - Animated */}
      <div className="absolute -inset-full top-0 block w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 left-[-100%] animate-shine" />
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl tracking-tight drop-shadow-md">{card.name}</h3>
            <p className="text-white/70 text-sm font-medium drop-shadow-sm">{card.bank}</p>
          </div>
          {!minimal && (
             <div className="text-right">
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-0.5">Current Due</p>
                <p className="text-2xl font-bold tracking-tight drop-shadow-md">{formatCurrency(balance)}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="font-mono text-sm text-white/80 mb-2 tracking-widest drop-shadow-sm">•••• •••• •••• {card.last4}</p>
            
            {!minimal && (
                <div className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 shadow-sm",
                status === 'good' ? "bg-emerald-500/30 text-emerald-50" : 
                status === 'warning' ? "bg-yellow-500/30 text-yellow-50" : 
                "bg-red-500/40 text-red-50"
                )}>
                {daysUntilDue < 0 ? `Overdue ${Math.abs(daysUntilDue)}d` : `${daysUntilDue} days left`}
                </div>
            )}
          </div>
          
          {!minimal && (
              <div className="text-right">
                 <p className="text-xs text-white/60 mb-0.5">Due Date</p>
                 <p className="text-base font-semibold drop-shadow-sm">{dueDate.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}</p>
              </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
