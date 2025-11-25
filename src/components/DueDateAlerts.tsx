import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, AlertTriangle, Clock, Calendar, CreditCard as CardIcon,
  DollarSign, Zap, CheckCircle, XCircle, Bell
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { CARD_COLORS, UpcomingPayment } from '../types';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

interface DueDateAlertsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentAlert extends UpcomingPayment {
  urgency: 'critical' | 'warning' | 'normal';
  estimatedInterest: number;
  missedRewards: number;
}

// Estimated interest calculation (simplified - 24% APR is common in SG)
const ESTIMATED_APR = 0.24;
const MONTHLY_RATE = ESTIMATED_APR / 12;

export default function DueDateAlerts({ isOpen, onClose }: DueDateAlertsProps) {
  const { cards, getUpcomingPayments, addTransaction } = useStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const alerts = useMemo((): PaymentAlert[] => {
    const payments = getUpcomingPayments();
    
    return payments
      .filter(p => p.card.currentBalance > 0) // Only show cards with balance
      .map(payment => {
        let urgency: 'critical' | 'warning' | 'normal' = 'normal';
        
        if (payment.daysUntilDue <= 3) {
          urgency = 'critical';
        } else if (payment.daysUntilDue <= 7) {
          urgency = 'warning';
        }
        
        // Estimate interest if payment is missed (one month of interest)
        const estimatedInterest = payment.card.currentBalance * MONTHLY_RATE;
        
        // Estimate missed rewards (assumed 1% average reward rate)
        const missedRewards = payment.card.currentBalance * 0.01;
        
        return {
          ...payment,
          urgency,
          estimatedInterest,
          missedRewards,
        };
      })
      .sort((a, b) => {
        // Sort by urgency first, then by days until due
        const urgencyOrder = { critical: 0, warning: 1, normal: 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.daysUntilDue - b.daysUntilDue;
      });
  }, [getUpcomingPayments]);

  const handlePayNow = (alert: PaymentAlert) => {
    addTransaction({
      cardId: alert.card.id,
      amount: alert.card.currentBalance,
      description: 'Full balance payment',
      category: 'other',
      date: format(new Date(), 'yyyy-MM-dd'),
      isPayment: true,
    });
    
    toast.success(`💰 Payment of $${alert.card.currentBalance.toFixed(2)} recorded for ${alert.card.bankName}!`);
  };

  const criticalCount = alerts.filter(a => a.urgency === 'critical').length;
  const warningCount = alerts.filter(a => a.urgency === 'warning').length;

  const getUrgencyStyles = (urgency: 'critical' | 'warning' | 'normal') => {
    switch (urgency) {
      case 'critical':
        return {
          bg: isLight ? 'bg-red-50' : 'bg-red-500/10',
          border: isLight ? 'border-red-200' : 'border-red-500/30',
          icon: isLight ? 'text-red-600' : 'text-red-400',
          badge: isLight ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400',
        };
      case 'warning':
        return {
          bg: isLight ? 'bg-amber-50' : 'bg-amber-500/10',
          border: isLight ? 'border-amber-200' : 'border-amber-500/30',
          icon: isLight ? 'text-amber-600' : 'text-amber-400',
          badge: isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400',
        };
      default:
        return {
          bg: isLight ? 'bg-slate-50' : 'bg-white/5',
          border: isLight ? 'border-slate-200' : 'border-white/10',
          icon: isLight ? 'text-slate-600' : 'text-zinc-400',
          badge: isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-zinc-400',
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
          className={`w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl ${
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
                criticalCount > 0 
                  ? (isLight ? 'bg-red-100' : 'bg-red-500/20')
                  : warningCount > 0
                  ? (isLight ? 'bg-amber-100' : 'bg-amber-500/20')
                  : (isLight ? 'bg-emerald-100' : 'bg-emerald-500/20')
              }`}>
                {criticalCount > 0 ? (
                  <AlertTriangle className={`w-6 h-6 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
                ) : warningCount > 0 ? (
                  <Clock className={`w-6 h-6 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                ) : (
                  <CheckCircle className={`w-6 h-6 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Due Date Intelligence</h2>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {criticalCount > 0 
                    ? `${criticalCount} critical payment${criticalCount > 1 ? 's' : ''} due!`
                    : warningCount > 0
                    ? `${warningCount} payment${warningCount > 1 ? 's' : ''} due this week`
                    : 'All payments on track'
                  }
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
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className={`p-4 rounded-xl text-center ${
                isLight ? 'bg-red-50' : 'bg-red-500/10'
              }`}>
                <p className={`text-2xl font-bold ${isLight ? 'text-red-600' : 'text-red-400'}`}>
                  {criticalCount}
                </p>
                <p className={`text-xs ${isLight ? 'text-red-600/70' : 'text-red-400/70'}`}>Critical</p>
              </div>
              <div className={`p-4 rounded-xl text-center ${
                isLight ? 'bg-amber-50' : 'bg-amber-500/10'
              }`}>
                <p className={`text-2xl font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                  {warningCount}
                </p>
                <p className={`text-xs ${isLight ? 'text-amber-600/70' : 'text-amber-400/70'}`}>This Week</p>
              </div>
              <div className={`p-4 rounded-xl text-center ${
                isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'
              }`}>
                <p className={`text-2xl font-bold ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                  {alerts.filter(a => a.urgency === 'normal').length}
                </p>
                <p className={`text-xs ${isLight ? 'text-emerald-600/70' : 'text-emerald-400/70'}`}>On Track</p>
              </div>
            </div>

            {/* Alerts List */}
            {alerts.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${isLight ? 'text-emerald-400' : 'text-emerald-500/50'}`} />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className={`${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                  No outstanding balances on any cards
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert, index) => {
                  const styles = getUrgencyStyles(alert.urgency);
                  
                  return (
                    <motion.div
                      key={alert.card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-2xl border ${styles.bg} ${styles.border}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Card Visual */}
                        <div className={`w-16 h-10 rounded-lg bg-gradient-to-br ${CARD_COLORS[alert.card.color].gradient} p-2 flex-shrink-0`}>
                          <div className="text-white/80 text-[8px] truncate">{alert.card.bankName}</div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{alert.card.bankName}</h3>
                              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                                •••• {alert.card.lastFourDigits}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles.badge}`}>
                              {alert.urgency === 'critical' 
                                ? 'URGENT' 
                                : alert.urgency === 'warning' 
                                ? 'DUE SOON' 
                                : 'ON TRACK'
                              }
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Balance Due</p>
                              <p className="font-semibold">${alert.card.currentBalance.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Due Date</p>
                              <p className="font-semibold">{format(alert.dueDate, 'MMM d')}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Days Left</p>
                              <p className={`font-semibold ${
                                alert.daysUntilDue <= 3 
                                  ? (isLight ? 'text-red-600' : 'text-red-400')
                                  : alert.daysUntilDue <= 7
                                  ? (isLight ? 'text-amber-600' : 'text-amber-400')
                                  : ''
                              }`}>
                                {alert.daysUntilDue} day{alert.daysUntilDue !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          
                          {/* Cost of Missing Payment */}
                          {alert.urgency !== 'normal' && (
                            <div className={`p-3 rounded-xl mb-3 ${
                              isLight ? 'bg-white/80' : 'bg-black/20'
                            }`}>
                              <p className={`text-xs font-medium mb-1 ${styles.icon}`}>
                                ⚠️ If you miss this payment:
                              </p>
                              <div className="flex gap-4 text-xs">
                                <span className={`${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                                  Interest: ~${alert.estimatedInterest.toFixed(2)}
                                </span>
                                <span className={`${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                                  Lost rewards: ~${alert.missedRewards.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handlePayNow(alert)}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white ${
                                alert.urgency === 'critical'
                                  ? 'bg-gradient-to-r from-red-500 to-rose-500'
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                              } shadow-lg ${
                                alert.urgency === 'critical' 
                                  ? 'shadow-red-500/25' 
                                  : 'shadow-emerald-500/25'
                              }`}
                            >
                              <Zap className="w-4 h-4" />
                              Record Payment
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                // Export to calendar (simplified - would need actual calendar API)
                                const event = {
                                  title: `Pay ${alert.card.bankName} - $${alert.card.currentBalance.toFixed(2)}`,
                                  start: alert.dueDate,
                                };
                                toast.success('Calendar reminder set! (Feature coming soon)');
                              }}
                              className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${
                                isLight 
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                                  : 'bg-white/10 hover:bg-white/15'
                              }`}
                            >
                              <Calendar className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Tips */}
            {alerts.some(a => a.urgency !== 'normal') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`mt-6 p-4 rounded-xl ${
                  isLight ? 'bg-violet-50 border border-violet-200' : 'bg-violet-500/10 border border-violet-500/30'
                }`}
              >
                <h4 className={`font-semibold mb-2 ${isLight ? 'text-violet-700' : 'text-violet-300'}`}>
                  💡 Pro Tips
                </h4>
                <ul className={`text-sm space-y-1 ${isLight ? 'text-violet-600/80' : 'text-violet-300/80'}`}>
                  <li>• Set up GIRO to auto-pay minimum balance</li>
                  <li>• Pay full balance to avoid 24%+ interest</li>
                  <li>• Keep credit utilization under 30% for better credit score</li>
                </ul>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

