import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, FileText, Tag, ArrowDownLeft, ArrowUpRight, CreditCard, Zap } from 'lucide-react';
import { TransactionCategory, CATEGORY_CONFIG, CARD_COLORS, Transaction } from '../types';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import DatePicker from './DatePicker';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TransactionModalProps {
  preselectedCardId: string | null;
  onClose: () => void;
  editTransaction?: Transaction | null; // Optional: for editing existing transactions
}

export default function TransactionModal({ preselectedCardId, onClose, editTransaction }: TransactionModalProps) {
  const { cards, addTransaction, updateTransaction } = useStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const isEditing = !!editTransaction;
  
  const [formData, setFormData] = useState({
    cardId: editTransaction?.cardId || preselectedCardId || '',
    amount: editTransaction?.amount || 0,
    description: editTransaction?.description || '',
    category: (editTransaction?.category || 'other') as TransactionCategory,
    date: editTransaction?.date || format(new Date(), 'yyyy-MM-dd'),
    isPayment: editTransaction?.isPayment || false,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cardId) {
      toast.error('Please select a card');
      return;
    }
    
    if (formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (isEditing && editTransaction) {
      // Update existing transaction
      updateTransaction(editTransaction.id, {
        cardId: formData.cardId,
        amount: formData.amount,
        description: formData.description || (formData.isPayment ? 'Payment' : 'Transaction'),
        category: formData.category,
        date: formData.date,
        isPayment: formData.isPayment,
      });
      toast.success('Transaction updated');
    } else {
      // Add new transaction
      addTransaction({
        cardId: formData.cardId,
        amount: formData.amount,
        description: formData.description || (formData.isPayment ? 'Payment' : 'Transaction'),
        category: formData.category,
        date: formData.date,
        isPayment: formData.isPayment,
      });
      toast.success(formData.isPayment ? 'Payment recorded' : 'Transaction added');
    }
    
    onClose();
  };

  const categories: TransactionCategory[] = [
    'food', 'transport', 'shopping', 'entertainment', 'utilities',
    'healthcare', 'travel', 'education', 'subscription', 'other'
  ];

  const selectedCard = cards.find(c => c.id === formData.cardId);

  // Pay Full Balance handler
  const handlePayFullBalance = () => {
    if (selectedCard && selectedCard.currentBalance > 0) {
      setFormData({ 
        ...formData, 
        amount: selectedCard.currentBalance,
        description: 'Full balance payment'
      });
      toast.success('Full balance amount filled!');
    }
  };

  const inputClasses = `w-full px-4 py-3 rounded-xl transition-colors ${
    isLight 
      ? 'bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-violet-400' 
      : 'bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:border-violet-500/50'
  }`;

  const labelClasses = `flex items-center gap-2 text-sm mb-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isLight ? 'bg-black/40' : 'bg-black/60'
      } backdrop-blur-sm overflow-y-auto`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-3xl overflow-hidden my-4 ${
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
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              formData.isPayment 
                ? (isLight ? 'bg-emerald-100' : 'bg-emerald-500/20')
                : (isLight ? 'bg-rose-100' : 'bg-rose-500/20')
            }`}>
              {formData.isPayment ? (
                <ArrowDownLeft className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              ) : (
                <ArrowUpRight className={`w-5 h-5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
              )}
            </div>
            <h2 className="text-xl font-semibold">
              {isEditing 
                ? (formData.isPayment ? 'Edit Payment' : 'Edit Transaction')
                : (formData.isPayment ? 'Record Payment' : 'Add Transaction')
              }
            </h2>
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

        {/* Transaction Type Toggle */}
        <div className="px-6 pt-6">
          <div className={`flex gap-2 p-1 rounded-xl ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, isPayment: false })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                !formData.isPayment 
                  ? (isLight ? 'bg-white shadow-xs text-rose-600' : 'bg-rose-500/20 text-rose-400')
                  : (isLight ? 'text-slate-500 hover:text-slate-700' : 'text-zinc-400 hover:text-zinc-300')
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Expense
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, isPayment: true })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                formData.isPayment 
                  ? (isLight ? 'bg-white shadow-xs text-emerald-600' : 'bg-emerald-500/20 text-emerald-400')
                  : (isLight ? 'text-slate-500 hover:text-slate-700' : 'text-zinc-400 hover:text-zinc-300')
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Payment
            </motion.button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Card Selection */}
          <div>
            <label className={labelClasses}>
              <CreditCard className="w-4 h-4" />
              Select Card
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cards.map((card) => (
                <motion.button
                  key={card.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, cardId: card.id })}
                  className={`p-3 rounded-xl text-left transition-all ${
                    formData.cardId === card.id
                      ? 'ring-2 ring-violet-500 ' + (isLight ? 'bg-violet-50' : 'bg-white/10')
                      : (isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/5 hover:bg-white/10')
                  }`}
                >
                  <div className={`w-8 h-5 rounded-sm bg-linear-to-r ${CARD_COLORS[card.color].gradient} mb-2`} />
                  <p className="text-sm font-medium truncate">{card.bankName}</p>
                  <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    •••• {card.lastFourDigits}
                  </p>
                </motion.button>
              ))}
            </div>
            {cards.length === 0 && (
              <p className={`text-sm text-center py-4 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                No cards added yet
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`flex items-center gap-2 text-sm ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <DollarSign className="w-4 h-4" />
                Amount
              </label>
              
              {/* Pay Full Balance Button - Only shows in payment mode with balance > 0 */}
              {formData.isPayment && selectedCard && selectedCard.currentBalance > 0 && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePayFullBalance}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isLight 
                      ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40' 
                      : 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Pay Full (${selectedCard.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                </motion.button>
              )}
            </div>
            
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>$</span>
              <input
                type="number"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className={`${inputClasses} pl-10 text-2xl font-semibold`}
              />
            </div>
            {selectedCard && (
              <div className={`flex items-center justify-between text-xs mt-2 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                <span>Current balance: ${selectedCard.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                {formData.isPayment && formData.amount > 0 && (
                  <span className={isLight ? 'text-emerald-600' : 'text-emerald-400'}>
                    After payment: ${Math.max(0, selectedCard.currentBalance - formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelClasses}>
              <FileText className="w-4 h-4" />
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={formData.isPayment ? "e.g. Monthly payment" : "e.g. Lunch at restaurant"}
              className={inputClasses}
            />
          </div>

          {/* Category (only for expenses) */}
          {!formData.isPayment && (
            <div>
              <label className={labelClasses}>
                <Tag className="w-4 h-4" />
                Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {categories.map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  return (
                    <motion.button
                      key={cat}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        formData.category === cat
                          ? 'ring-2 ring-violet-500 ' + (isLight ? 'bg-violet-50' : 'bg-white/10')
                          : (isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/5 hover:bg-white/10')
                      }`}
                    >
                      <span className="text-xl">{config.icon}</span>
                      <span className={`text-[10px] truncate w-full text-center ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {config.label.split(' ')[0]}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date - Using new DatePicker */}
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors text-white ${
                formData.isPayment
                  ? 'bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                  : 'bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500'
              }`}
            >
              {isEditing 
                ? 'Save Changes' 
                : (formData.isPayment ? 'Record Payment' : 'Add Transaction')
              }
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
