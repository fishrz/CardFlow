import React from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, getCardStatus } from '@/lib/finance';
import { motion } from 'framer-motion';

export const DashboardPulse: React.FC = () => {
  const { cards, transactions, layoutMode } = useStore();
  const isDesktop = layoutMode === 'desktop';

  const totalDue = cards.reduce((acc, card) => {
    const cardTrans = transactions.filter(t => t.cardId === card.id && !t.isPaid);
    const balance = cardTrans.reduce((sum, t) => sum + t.amount, 0);
    return acc + balance;
  }, 0);

  const upcomingDueCount = cards.filter(card => {
      const { daysUntilDue } = getCardStatus(card);
      return daysUntilDue <= 7;
  }).length;

  return (
    <div className={`mt-8 mb-6 ${isDesktop ? 'px-6 lg:px-8' : 'px-4'}`}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={isDesktop ? 'flex items-center justify-between' : 'text-center'}
      >
        <div className={isDesktop ? '' : ''}>
          <h2 className="text-text-secondary text-sm font-medium tracking-wide uppercase mb-1">Total Outstanding</h2>
          <div className={`font-bold text-text-primary tracking-tight ${isDesktop ? 'text-6xl' : 'text-5xl'}`}>
            {formatCurrency(totalDue)}
          </div>
        </div>
        
        {upcomingDueCount > 0 && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium ${isDesktop ? '' : 'mt-3'}`}
            >
                {upcomingDueCount} card{upcomingDueCount > 1 ? 's' : ''} due soon
            </motion.div>
        )}
      </motion.div>
    </div>
  );
};
