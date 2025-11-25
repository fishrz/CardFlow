import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Receipt, TrendingUp, TrendingDown, DollarSign, Calendar,
  AlertCircle, CheckCircle, Phone, XCircle, CreditCard as CardIcon,
  Sparkles, Calculator
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { CARD_COLORS, CreditCard } from '../types';
import { format, addMonths, differenceInMonths, differenceInDays, parseISO } from 'date-fns';

interface AnnualFeeTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CardFeeAnalysis {
  card: CreditCard;
  annualFee: number;
  renewalDate: Date;
  daysUntilRenewal: number;
  estimatedRewards: number;
  netValue: number;
  isWorthKeeping: boolean;
  suggestion: 'keep' | 'waive' | 'cancel';
}

// Common annual fees for SG cards (simplified - could be user-configured)
const ESTIMATED_ANNUAL_FEES: Record<string, number> = {
  'DBS': 192.60,
  'OCBC': 192.60,
  'UOB': 192.60,
  'Citibank': 192.60,
  'HSBC': 428.00,
  'Standard Chartered': 192.60,
  'Maybank': 160.50,
  'CIMB': 171.20,
  'Bank of China': 171.20,
  'AMEX': 321.00,
  'Other': 192.60,
};

export default function AnnualFeeTracker({ isOpen, onClose }: AnnualFeeTrackerProps) {
  const { cards, transactions } = useStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  // Analyze each card's fee value
  const cardAnalysis = useMemo((): CardFeeAnalysis[] => {
    return cards.map(card => {
      const annualFee = ESTIMATED_ANNUAL_FEES[card.bankName] || ESTIMATED_ANNUAL_FEES['Other'];
      
      // Estimate renewal date (1 year from card creation)
      const createdDate = parseISO(card.createdAt);
      let renewalDate = addMonths(createdDate, 12);
      
      // If renewal has passed, get next renewal
      while (renewalDate < new Date()) {
        renewalDate = addMonths(renewalDate, 12);
      }
      
      const daysUntilRenewal = differenceInDays(renewalDate, new Date());
      
      // Calculate spending on this card (last 12 months)
      const yearAgo = addMonths(new Date(), -12);
      const cardTransactions = transactions.filter(t => 
        t.cardId === card.id && 
        !t.isPayment &&
        parseISO(t.date) >= yearAgo
      );
      
      const totalSpending = cardTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Estimate rewards (assuming average 2% reward rate - would be user-configured in real app)
      const estimatedRewards = totalSpending * 0.02;
      
      // Calculate net value
      const netValue = estimatedRewards - annualFee;
      
      // Determine suggestion
      let suggestion: 'keep' | 'waive' | 'cancel' = 'keep';
      if (netValue < -100) {
        suggestion = 'cancel';
      } else if (netValue < 0) {
        suggestion = 'waive';
      }
      
      return {
        card,
        annualFee,
        renewalDate,
        daysUntilRenewal,
        estimatedRewards,
        netValue,
        isWorthKeeping: netValue >= 0,
        suggestion,
      };
    }).sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
  }, [cards, transactions]);

  const totalFees = cardAnalysis.reduce((sum, a) => sum + a.annualFee, 0);
  const totalRewards = cardAnalysis.reduce((sum, a) => sum + a.estimatedRewards, 0);
  const netSavings = totalRewards - totalFees;

  const upcomingRenewals = cardAnalysis.filter(a => a.daysUntilRenewal <= 60);
  const cardsToReview = cardAnalysis.filter(a => a.suggestion !== 'keep');

  const getSuggestionStyles = (suggestion: 'keep' | 'waive' | 'cancel') => {
    switch (suggestion) {
      case 'keep':
        return {
          bg: isLight ? 'bg-emerald-50' : 'bg-emerald-500/10',
          text: isLight ? 'text-emerald-700' : 'text-emerald-400',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'waive':
        return {
          bg: isLight ? 'bg-amber-50' : 'bg-amber-500/10',
          text: isLight ? 'text-amber-700' : 'text-amber-400',
          icon: <Phone className="w-4 h-4" />,
        };
      case 'cancel':
        return {
          bg: isLight ? 'bg-red-50' : 'bg-red-500/10',
          text: isLight ? 'text-red-700' : 'text-red-400',
          icon: <XCircle className="w-4 h-4" />,
        };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          isLight ? 'bg-black/40' : 'bg-black/60'
        } backdrop-blur-sm`}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl ${
            isLight 
              ? 'bg-white shadow-2xl shadow-black/10' 
              : 'glass-strong'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isLight ? 'bg-gradient-to-br from-rose-100 to-orange-100' : 'bg-gradient-to-br from-rose-500/20 to-orange-500/20'
              }`}>
                <Receipt className={`w-6 h-6 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Annual Fee Tracker</h2>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Is each card worth keeping?
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
              }`}
            >
              <X className={`w-5 h-5 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
            </motion.button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-4 rounded-2xl ${
                  isLight ? 'bg-rose-50' : 'bg-rose-500/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`w-4 h-4 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
                  <span className={`text-xs font-medium ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>Total Fees/Year</span>
                </div>
                <p className="text-2xl font-bold">${totalFees.toFixed(2)}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`p-4 rounded-2xl ${
                  isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <span className={`text-xs font-medium ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>Est. Rewards</span>
                </div>
                <p className="text-2xl font-bold">${totalRewards.toFixed(2)}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-4 rounded-2xl ${
                  netSavings >= 0
                    ? (isLight ? 'bg-cyan-50' : 'bg-cyan-500/10')
                    : (isLight ? 'bg-amber-50' : 'bg-amber-500/10')
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className={`w-4 h-4 ${
                    netSavings >= 0
                      ? (isLight ? 'text-cyan-600' : 'text-cyan-400')
                      : (isLight ? 'text-amber-600' : 'text-amber-400')
                  }`} />
                  <span className={`text-xs font-medium ${
                    netSavings >= 0
                      ? (isLight ? 'text-cyan-600' : 'text-cyan-400')
                      : (isLight ? 'text-amber-600' : 'text-amber-400')
                  }`}>Net Value</span>
                </div>
                <p className={`text-2xl font-bold ${
                  netSavings >= 0
                    ? (isLight ? 'text-cyan-600' : 'text-cyan-400')
                    : (isLight ? 'text-amber-600' : 'text-amber-400')
                }`}>
                  {netSavings >= 0 ? '+' : ''}{netSavings.toFixed(2)}
                </p>
              </motion.div>
            </div>

            {/* Upcoming Renewals Alert */}
            {upcomingRenewals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={`mb-6 p-4 rounded-2xl ${
                  isLight 
                    ? 'bg-amber-50 border border-amber-200' 
                    : 'bg-amber-500/10 border border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className={`w-5 h-5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                  <h3 className={`font-semibold ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                    Upcoming Renewals
                  </h3>
                </div>
                <p className={`text-sm ${isLight ? 'text-amber-600/80' : 'text-amber-300/80'}`}>
                  {upcomingRenewals.length} card{upcomingRenewals.length > 1 ? 's' : ''} renewing in the next 60 days.
                  Review to decide if you want to keep, waive, or cancel.
                </p>
              </motion.div>
            )}

            {/* Cards Analysis */}
            {cards.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                <CardIcon className={`w-16 h-16 mx-auto mb-4 ${isLight ? 'text-slate-300' : 'text-zinc-600'}`} />
                <h3 className="text-lg font-semibold mb-2">No Cards Added</h3>
                <p className={`${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                  Add cards to track annual fee value
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cardAnalysis.map((analysis, index) => {
                  const suggestionStyles = getSuggestionStyles(analysis.suggestion);
                  
                  return (
                    <motion.div
                      key={analysis.card.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Card Visual */}
                        <div className={`w-20 h-12 rounded-xl bg-gradient-to-br ${CARD_COLORS[analysis.card.color].gradient} p-2 flex-shrink-0 flex flex-col justify-between`}>
                          <div className="text-white/80 text-[8px] truncate">{analysis.card.bankName}</div>
                          <div className="text-white text-[9px]">•••• {analysis.card.lastFourDigits}</div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{analysis.card.cardName || analysis.card.bankName}</h3>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                                Renews {format(analysis.renewalDate, 'MMM d, yyyy')} ({analysis.daysUntilRenewal} days)
                              </p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${suggestionStyles.bg} ${suggestionStyles.text}`}>
                              {suggestionStyles.icon}
                              {analysis.suggestion === 'keep' ? 'Worth Keeping' : analysis.suggestion === 'waive' ? 'Try Waiving' : 'Consider Cancel'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-3">
                            <div>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Annual Fee</p>
                              <p className={`font-semibold ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
                                ${analysis.annualFee.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Est. Rewards</p>
                              <p className={`font-semibold ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                                ${analysis.estimatedRewards.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Net Value</p>
                              <p className={`font-semibold ${
                                analysis.netValue >= 0 
                                  ? (isLight ? 'text-cyan-600' : 'text-cyan-400')
                                  : (isLight ? 'text-amber-600' : 'text-amber-400')
                              }`}>
                                {analysis.netValue >= 0 ? '+' : ''}{analysis.netValue.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Verdict</p>
                              <p className={`font-semibold ${
                                analysis.isWorthKeeping 
                                  ? (isLight ? 'text-emerald-600' : 'text-emerald-400')
                                  : (isLight ? 'text-rose-600' : 'text-rose-400')
                              }`}>
                                {analysis.isWorthKeeping ? '✓ Profit' : '✗ Loss'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Suggestion Tips */}
                          {analysis.suggestion !== 'keep' && (
                            <div className={`mt-3 p-3 rounded-xl ${
                              isLight ? 'bg-white' : 'bg-black/20'
                            }`}>
                              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                                {analysis.suggestion === 'waive' && (
                                  <>💡 Call {analysis.card.bankName} and request a fee waiver. Most banks waive fees if you spend ≥$500/month.</>
                                )}
                                {analysis.suggestion === 'cancel' && (
                                  <>⚠️ This card costs more than it earns. Consider cancelling unless it offers other benefits you value.</>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pro Tips */}
            {cards.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`mt-6 p-4 rounded-xl ${
                  isLight ? 'bg-violet-50 border border-violet-200' : 'bg-violet-500/10 border border-violet-500/30'
                }`}
              >
                <h4 className={`font-semibold mb-2 ${isLight ? 'text-violet-700' : 'text-violet-300'}`}>
                  💡 Fee Waiver Tips (Singapore)
                </h4>
                <ul className={`text-sm space-y-1 ${isLight ? 'text-violet-600/80' : 'text-violet-300/80'}`}>
                  <li>• Most banks waive fees if you spend $500-800/month</li>
                  <li>• Call 2-4 weeks before renewal to negotiate</li>
                  <li>• First-year fees are often auto-waived</li>
                  <li>• Mention competitor offers for better leverage</li>
                </ul>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

