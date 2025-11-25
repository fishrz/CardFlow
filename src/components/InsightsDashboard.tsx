import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BarChart3, TrendingUp, TrendingDown, ArrowRight,
  Calendar, CreditCard as CardIcon, DollarSign, Percent,
  ChevronLeft, ChevronRight, Sparkles, Target, PieChart
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { CATEGORY_CONFIG, CARD_COLORS, TransactionCategory } from '../types';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';

interface InsightsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategorySpending {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  transactionCount: number;
}

interface CardSpending {
  cardId: string;
  cardName: string;
  bankName: string;
  color: string;
  amount: number;
  percentage: number;
}

export default function InsightsDashboard({ isOpen, onClose }: InsightsDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const { cards, transactions } = useStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  // Get transactions for selected month
  const monthlyTransactions = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    return transactions.filter(t => {
      if (t.isPayment) return false; // Exclude payments from spending
      const txDate = parseISO(t.date);
      return isWithinInterval(txDate, { start, end });
    });
  }, [transactions, selectedMonth]);

  // Previous month transactions for comparison
  const previousMonthTransactions = useMemo(() => {
    const prevMonth = subMonths(selectedMonth, 1);
    const start = startOfMonth(prevMonth);
    const end = endOfMonth(prevMonth);
    
    return transactions.filter(t => {
      if (t.isPayment) return false;
      const txDate = parseISO(t.date);
      return isWithinInterval(txDate, { start, end });
    });
  }, [transactions, selectedMonth]);

  // Calculate totals
  const currentTotal = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
  const previousTotal = previousMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const changePercent = previousTotal > 0 
    ? ((currentTotal - previousTotal) / previousTotal) * 100 
    : 0;

  // Calculate payments made this month
  const monthlyPayments = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    return transactions
      .filter(t => {
        if (!t.isPayment) return false;
        const txDate = parseISO(t.date);
        return isWithinInterval(txDate, { start, end });
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedMonth]);

  // Spending by category
  const categorySpending = useMemo((): CategorySpending[] => {
    const byCategory = new Map<TransactionCategory, { amount: number; count: number }>();
    
    monthlyTransactions.forEach(t => {
      const current = byCategory.get(t.category) || { amount: 0, count: 0 };
      byCategory.set(t.category, {
        amount: current.amount + t.amount,
        count: current.count + 1,
      });
    });
    
    return Array.from(byCategory.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: currentTotal > 0 ? (data.amount / currentTotal) * 100 : 0,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyTransactions, currentTotal]);

  // Spending by card
  const cardSpending = useMemo((): CardSpending[] => {
    const byCard = new Map<string, number>();
    
    monthlyTransactions.forEach(t => {
      byCard.set(t.cardId, (byCard.get(t.cardId) || 0) + t.amount);
    });
    
    return Array.from(byCard.entries())
      .map(([cardId, amount]) => {
        const card = cards.find(c => c.id === cardId);
        return {
          cardId,
          cardName: card?.cardName || 'Unknown',
          bankName: card?.bankName || 'Unknown',
          color: card?.color || 'slate',
          amount,
          percentage: currentTotal > 0 ? (amount / currentTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyTransactions, currentTotal, cards]);

  // Daily average
  const daysInMonth = endOfMonth(selectedMonth).getDate();
  const dailyAverage = currentTotal / daysInMonth;

  // Top spending day (mockup - could be enhanced with actual data)
  const topCategory = categorySpending[0];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(current => 
      direction === 'prev' ? subMonths(current, 1) : subMonths(current, -1)
    );
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
          className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl ${
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
                isLight ? 'bg-gradient-to-br from-violet-100 to-indigo-100' : 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20'
              }`}>
                <BarChart3 className={`w-6 h-6 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Monthly Insights</h2>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Your spending story
                </p>
              </div>
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigateMonth('prev')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                }`}
              >
                <ChevronLeft className={`w-5 h-5 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
              </motion.button>
              
              <div className={`px-4 py-2 rounded-xl font-medium ${
                isLight ? 'bg-slate-100' : 'bg-white/10'
              }`}>
                <Calendar className="w-4 h-4 inline mr-2 opacity-60" />
                {format(selectedMonth, 'MMMM yyyy')}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigateMonth('next')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                }`}
              >
                <ChevronRight className={`w-5 h-5 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ml-2 ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                }`}
              >
                <X className={`w-5 h-5 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
              </motion.button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Total Spending */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-4 rounded-2xl ${
                  isLight ? 'bg-gradient-to-br from-violet-50 to-indigo-50' : 'bg-gradient-to-br from-violet-500/10 to-indigo-500/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`w-4 h-4 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
                  <span className={`text-xs font-medium ${isLight ? 'text-violet-600' : 'text-violet-400'}`}>Total Spending</span>
                </div>
                <p className="text-2xl font-bold">${currentTotal.toFixed(2)}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  changePercent >= 0 
                    ? (isLight ? 'text-rose-600' : 'text-rose-400')
                    : (isLight ? 'text-emerald-600' : 'text-emerald-400')
                }`}>
                  {changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(changePercent).toFixed(1)}% vs last month
                </div>
              </motion.div>

              {/* Payments Made */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`p-4 rounded-2xl ${
                  isLight ? 'bg-gradient-to-br from-emerald-50 to-teal-50' : 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CardIcon className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <span className={`text-xs font-medium ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>Payments Made</span>
                </div>
                <p className="text-2xl font-bold">${monthlyPayments.toFixed(2)}</p>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Card repayments
                </p>
              </motion.div>

              {/* Daily Average */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-4 rounded-2xl ${
                  isLight ? 'bg-gradient-to-br from-cyan-50 to-sky-50' : 'bg-gradient-to-br from-cyan-500/10 to-sky-500/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className={`w-4 h-4 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                  <span className={`text-xs font-medium ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`}>Daily Average</span>
                </div>
                <p className="text-2xl font-bold">${dailyAverage.toFixed(2)}</p>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Per day average
                </p>
              </motion.div>

              {/* Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={`p-4 rounded-2xl ${
                  isLight ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                  <span className={`text-xs font-medium ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>Transactions</span>
                </div>
                <p className="text-2xl font-bold">{monthlyTransactions.length}</p>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Total purchases
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Spending by Category */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <PieChart className={`w-5 h-5 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
                  By Category
                </h3>
                
                {categorySpending.length === 0 ? (
                  <div className={`text-center py-8 rounded-2xl ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                    <p className={`${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                      No transactions this month
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categorySpending.map((item, index) => {
                      const config = CATEGORY_CONFIG[item.category];
                      return (
                        <motion.div
                          key={item.category}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className={`p-3 rounded-xl ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{config.icon}</span>
                              <span className="font-medium text-sm">{config.label}</span>
                            </div>
                            <span className="font-semibold">${item.amount.toFixed(2)}</span>
                          </div>
                          <div className="relative h-2 rounded-full overflow-hidden bg-black/10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{ backgroundColor: config.color }}
                            />
                          </div>
                          <div className={`flex justify-between mt-1 text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                            <span>{item.transactionCount} transactions</span>
                            <span>{item.percentage.toFixed(1)}%</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Spending by Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CardIcon className={`w-5 h-5 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
                  By Card
                </h3>
                
                {cardSpending.length === 0 ? (
                  <div className={`text-center py-8 rounded-2xl ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                    <p className={`${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                      No transactions this month
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cardSpending.map((item, index) => (
                      <motion.div
                        key={item.cardId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className={`p-3 rounded-xl ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-5 rounded bg-gradient-to-r ${CARD_COLORS[item.color as keyof typeof CARD_COLORS]?.gradient || 'from-slate-500 to-slate-600'}`} />
                            <div>
                              <span className="font-medium text-sm">{item.bankName}</span>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{item.cardName}</p>
                            </div>
                          </div>
                          <span className="font-semibold">${item.amount.toFixed(2)}</span>
                        </div>
                        <div className="relative h-2 rounded-full overflow-hidden bg-black/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${CARD_COLORS[item.color as keyof typeof CARD_COLORS]?.gradient || 'from-slate-500 to-slate-600'}`}
                          />
                        </div>
                        <div className={`text-right mt-1 text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                          {item.percentage.toFixed(1)}% of total
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Insight Card */}
            {topCategory && monthlyTransactions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`mt-6 p-5 rounded-2xl ${
                  isLight 
                    ? 'bg-gradient-to-r from-violet-100 via-purple-100 to-indigo-100' 
                    : 'bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-indigo-500/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isLight ? 'bg-white/80' : 'bg-black/20'
                  }`}>
                    <Sparkles className={`w-6 h-6 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Monthly Insight</h4>
                    <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                      Your top spending category this month is <strong>{CATEGORY_CONFIG[topCategory.category].label}</strong> at{' '}
                      <strong>${topCategory.amount.toFixed(2)}</strong> ({topCategory.percentage.toFixed(1)}% of total).
                      {changePercent > 0 
                        ? ` Your overall spending increased by ${changePercent.toFixed(1)}% compared to last month.`
                        : changePercent < 0 
                        ? ` Great job! You reduced spending by ${Math.abs(changePercent).toFixed(1)}% compared to last month.`
                        : ''
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

