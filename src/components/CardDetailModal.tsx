import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Plus, Trash2, TrendingUp, TrendingDown, Calendar, Wifi, ArrowUpRight, ArrowDownLeft, Pencil } from 'lucide-react';
import { CreditCard, CARD_COLORS, CATEGORY_CONFIG, Transaction } from '../types';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { format, differenceInDays, setDate, addMonths, isBefore, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';
import TransactionModal from './TransactionModal';

interface CardDetailModalProps {
  card: CreditCard;
  onClose: () => void;
  onEdit: () => void;
  onAddTransaction: () => void;
}

export default function CardDetailModal({ card, onClose, onEdit, onAddTransaction }: CardDetailModalProps) {
  const { getTransactionsByCard, deleteTransaction } = useStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const transactions = getTransactionsByCard(card.id);
  const colorConfig = CARD_COLORS[card.color];
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Calculate days until due
  const today = startOfDay(new Date());
  let dueDate = setDate(today, card.dueDate);
  if (isBefore(dueDate, today)) {
    dueDate = addMonths(dueDate, 1);
  }
  const daysUntilDue = differenceInDays(dueDate, today);

  const utilizationPercent = (card.currentBalance / card.creditLimit) * 100;
  const availableCredit = card.creditLimit - card.currentBalance;

  const handleDeleteTransaction = (transaction: Transaction) => {
    deleteTransaction(transaction.id);
    toast.success('Transaction deleted');
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto ${
        isLight ? 'bg-black/40' : 'bg-black/60'
      } backdrop-blur-sm`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-3xl overflow-hidden my-8 ${
          isLight 
            ? 'bg-white shadow-2xl shadow-black/10' 
            : 'glass-strong'
        }`}
      >
        {/* Card Header */}
        <div className={`relative p-6 bg-linear-to-br ${colorConfig.gradient}`}>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-white/70 text-sm font-medium">{card.bankName}</p>
                <h2 className="text-2xl font-bold text-white">{card.cardName}</h2>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onEdit}
                  className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Wifi className="w-6 h-6 text-white/80 rotate-90" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-1">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="w-2 h-2 rounded-full bg-white/40" />
                    ))}
                  </div>
                ))}
              </div>
              <span className="text-white text-xl font-mono tracking-wider">{card.lastFourDigits}</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Outstanding</p>
                <p className="text-white text-2xl font-bold">
                  ${card.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Available</p>
                <p className="text-white/90 text-2xl font-bold">
                  ${availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Due Date</p>
                <p className={`text-2xl font-bold ${daysUntilDue <= 3 ? 'text-red-200' : 'text-white'}`}>
                  {format(dueDate, 'MMM d')}
                </p>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Credit Utilization</span>
                <span>{utilizationPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full ${utilizationPercent > 80 ? 'bg-red-400' : utilizationPercent > 50 ? 'bg-amber-400' : 'bg-white/70'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-4 p-6 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <div className={`rounded-2xl p-4 ${isLight ? 'bg-slate-100' : 'glass'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`w-4 h-4 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
              <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Statement Date</span>
            </div>
            <p className="text-xl font-semibold">
              {card.statementDate}{card.statementDate === 1 ? 'st' : card.statementDate === 2 ? 'nd' : card.statementDate === 3 ? 'rd' : 'th'} of month
            </p>
          </div>
          <div className={`rounded-2xl p-4 ${isLight ? 'bg-slate-100' : 'glass'}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Credit Limit</span>
            </div>
            <p className="text-xl font-semibold">
              ${card.creditLimit.toLocaleString('en-US')}
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddTransaction}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isLight 
                  ? 'bg-violet-100 text-violet-600 hover:bg-violet-200' 
                  : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add
            </motion.button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isLight ? 'bg-slate-100' : 'bg-white/5'
              }`}>
                <TrendingDown className={`w-8 h-8 ${isLight ? 'text-slate-300' : 'text-zinc-600'}`} />
              </div>
              <p className={`mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>No transactions yet</p>
              <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>
                Add your first transaction to start tracking
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                <div key={date}>
                  <p className={`text-xs uppercase tracking-wide mb-2 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                    {format(new Date(date), 'EEEE, MMMM d')}
                  </p>
                  <div className="space-y-2">
                    {dayTransactions.map((transaction) => {
                      const categoryConfig = CATEGORY_CONFIG[transaction.category];
                      return (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${
                            isLight ? 'bg-slate-50 hover:bg-slate-100' : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              transaction.isPayment 
                                ? (isLight ? 'bg-emerald-100' : 'bg-emerald-500/20')
                                : (isLight ? 'bg-slate-200' : 'bg-white/10')
                            }`}>
                              {transaction.isPayment ? (
                                <ArrowDownLeft className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                              ) : (
                                <span className="text-lg">{categoryConfig.icon}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                                {transaction.isPayment ? 'Payment' : categoryConfig.label}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${
                              transaction.isPayment 
                                ? (isLight ? 'text-emerald-600' : 'text-emerald-400')
                                : ''
                            }`}>
                              {transaction.isPayment ? '-' : '+'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingTransaction(transaction)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all ${
                                isLight ? 'hover:bg-violet-100' : 'hover:bg-violet-500/20'
                              }`}
                            >
                              <Pencil className={`w-4 h-4 ${isLight ? 'text-violet-500' : 'text-violet-400'}`} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteTransaction(transaction)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all ${
                                isLight ? 'hover:bg-red-100' : 'hover:bg-red-500/20'
                              }`}
                            >
                              <Trash2 className={`w-4 h-4 ${isLight ? 'text-red-500' : 'text-red-400'}`} />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Edit Transaction Modal */}
      <AnimatePresence>
        {editingTransaction && (
          <TransactionModal
            preselectedCardId={card.id}
            editTransaction={editingTransaction}
            onClose={() => setEditingTransaction(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
