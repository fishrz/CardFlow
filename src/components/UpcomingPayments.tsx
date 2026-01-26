import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { UpcomingPayment, CARD_COLORS } from '../types';
import { useThemeStore } from '../store/useThemeStore';
import { format } from 'date-fns';

interface UpcomingPaymentsProps {
  payments: UpcomingPayment[];
  onViewCard: (card: UpcomingPayment['card']) => void;
  onAddTransaction: (cardId: string) => void;
}

export default function UpcomingPayments({ payments, onViewCard, onAddTransaction }: UpcomingPaymentsProps) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const getUrgencyStyle = (daysUntilDue: number, hasBalance: boolean) => {
    if (!hasBalance) return { 
      bg: isLight ? 'bg-emerald-100' : 'bg-emerald-500/10', 
      text: isLight ? 'text-emerald-700' : 'text-emerald-400', 
      label: 'Paid' 
    };
    if (daysUntilDue <= 3) return { 
      bg: isLight ? 'bg-red-100' : 'bg-red-500/10', 
      text: isLight ? 'text-red-700' : 'text-red-400', 
      label: 'Urgent' 
    };
    if (daysUntilDue <= 7) return { 
      bg: isLight ? 'bg-amber-100' : 'bg-amber-500/10', 
      text: isLight ? 'text-amber-700' : 'text-amber-400', 
      label: 'Soon' 
    };
    return { 
      bg: isLight ? 'bg-slate-100' : 'bg-zinc-500/10', 
      text: isLight ? 'text-slate-600' : 'text-zinc-400', 
      label: 'Upcoming' 
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {payments.slice(0, 4).map((payment, index) => {
        const colorConfig = CARD_COLORS[payment.card.color];
        const urgency = getUrgencyStyle(payment.daysUntilDue, payment.card.currentBalance > 0);
        
        return (
          <motion.div
            key={payment.card.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onViewCard(payment.card)}
            className={`glass rounded-2xl p-5 cursor-pointer transition-all duration-300 group ${
              isLight ? 'hover:bg-white/80' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-6 rounded-md bg-linear-to-r ${colorConfig.gradient}`} />
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgency.bg} ${urgency.text}`}>
                {urgency.label}
              </span>
            </div>
            
            <div className="mb-3">
              <p className="font-medium truncate">{payment.card.bankName}</p>
              <p className={`text-sm truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {payment.card.cardName}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs mb-0.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Amount Due</p>
                <p className="text-lg font-bold">
                  ${payment.card.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs mb-0.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Due Date</p>
                <div className="flex items-center gap-1">
                  {payment.daysUntilDue <= 3 && payment.card.currentBalance > 0 && (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <p className={`text-sm font-medium ${
                    payment.daysUntilDue <= 3 && payment.card.currentBalance > 0 
                      ? 'text-red-500' 
                      : isLight ? 'text-slate-600' : 'text-zinc-300'
                  }`}>
                    {format(payment.dueDate, 'MMM d')}
                  </p>
                </div>
              </div>
            </div>

            {payment.card.currentBalance > 0 && (
              <motion.button
                whileHover={{ x: 4 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTransaction(payment.card.id);
                }}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' 
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                }`}
              >
                <span>Record Payment</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
