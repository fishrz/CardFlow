import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Building2, Calendar, DollarSign, Palette, Check } from 'lucide-react';
import { CreditCard as CreditCardType, CardColor, CARD_COLORS, SINGAPORE_BANKS } from '../types';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';

interface CardModalProps {
  card: CreditCardType | null;
  onClose: () => void;
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const { addCard, updateCard, deleteCard } = useStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const [formData, setFormData] = useState({
    bankName: card?.bankName || '',
    cardName: card?.cardName || '',
    lastFourDigits: card?.lastFourDigits || '',
    creditLimit: card?.creditLimit || 0,
    currentBalance: card?.currentBalance || 0,
    dueDate: card?.dueDate || 1,
    statementDate: card?.statementDate || 1,
    color: card?.color || 'purple' as CardColor,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bankName || !formData.cardName || !formData.lastFourDigits) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.lastFourDigits.length !== 4 || !/^\d{4}$/.test(formData.lastFourDigits)) {
      toast.error('Please enter exactly 4 digits');
      return;
    }

    if (card) {
      updateCard(card.id, formData);
      toast.success('Card updated successfully');
    } else {
      addCard(formData);
      toast.success('Card added successfully');
    }
    onClose();
  };

  const handleDelete = () => {
    if (card) {
      deleteCard(card.id);
      toast.success('Card deleted');
      onClose();
    }
  };

  const colorOptions: CardColor[] = ['purple', 'blue', 'emerald', 'rose', 'orange', 'cyan', 'slate', 'amber'];

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
      } backdrop-blur-sm`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-3xl overflow-hidden ${
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
              isLight ? 'bg-violet-100' : 'bg-violet-500/20'
            }`}>
              <CreditCard className={`w-5 h-5 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
            </div>
            <h2 className="text-xl font-semibold">
              {card ? 'Edit Card' : 'Add New Card'}
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

        {/* Card Preview */}
        <div className="px-6 pt-6">
          <div className={`aspect-[1.8/1] rounded-2xl bg-gradient-to-br ${CARD_COLORS[formData.color].gradient} p-5 relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <p className="text-white/70 text-sm">{formData.bankName || 'Bank Name'}</p>
                <p className="text-white font-semibold">{formData.cardName || 'Card Name'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60">••••</span>
                <span className="text-white/60">••••</span>
                <span className="text-white/60">••••</span>
                <span className="text-white font-mono">{formData.lastFourDigits || '0000'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Bank Selection */}
          <div>
            <label className={labelClasses}>
              <Building2 className="w-4 h-4" />
              Bank
            </label>
            <select
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className={`${inputClasses} appearance-none cursor-pointer`}
            >
              <option value="">Select bank...</option>
              {SINGAPORE_BANKS.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          {/* Card Name & Last 4 Digits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                <CreditCard className="w-4 h-4" />
                Card Name
              </label>
              <input
                type="text"
                value={formData.cardName}
                onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                placeholder="e.g. VISA Platinum"
                className={inputClasses}
              />
            </div>
            <div>
              <label className={`${labelClasses.replace('flex items-center gap-2', '')} block`}>Last 4 Digits</label>
              <input
                type="text"
                value={formData.lastFourDigits}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData({ ...formData, lastFourDigits: value });
                }}
                placeholder="1234"
                maxLength={4}
                className={`${inputClasses} font-mono tracking-wider`}
              />
            </div>
          </div>

          {/* Credit Limit & Current Balance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                <DollarSign className="w-4 h-4" />
                Credit Limit
              </label>
              <input
                type="number"
                value={formData.creditLimit || ''}
                onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                placeholder="10000"
                className={inputClasses}
              />
            </div>
            <div>
              <label className={`${labelClasses.replace('flex items-center gap-2', '')} block`}>Current Balance</label>
              <input
                type="number"
                value={formData.currentBalance || ''}
                onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Due Date & Statement Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                <Calendar className="w-4 h-4" />
                Due Date (Day)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: parseInt(e.target.value) || 1 })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={`${labelClasses.replace('flex items-center gap-2', '')} block`}>Statement Date</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.statementDate}
                onChange={(e) => setFormData({ ...formData, statementDate: parseInt(e.target.value) || 1 })}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className={labelClasses}>
              <Palette className="w-4 h-4" />
              Card Color
            </label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <motion.button
                  key={color}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CARD_COLORS[color].gradient} flex items-center justify-center transition-all ${
                    formData.color === color 
                      ? `ring-2 ring-white ${isLight ? 'ring-offset-2 ring-offset-white' : 'ring-offset-2 ring-offset-zinc-900'}` 
                      : ''
                  }`}
                >
                  {formData.color === color && <Check className="w-5 h-5 text-white" />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {card && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteConfirm(true)}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                  isLight 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
              >
                Delete
              </motion.button>
            )}
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
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-medium transition-colors text-white"
            >
              {card ? 'Save Changes' : 'Add Card'}
            </motion.button>
          </div>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 backdrop-blur-sm flex items-center justify-center p-6 rounded-3xl ${
              isLight ? 'bg-white/90' : 'bg-black/80'
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isLight ? 'bg-red-100' : 'bg-red-500/20'
              }`}>
                <X className={`w-8 h-8 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Delete Card?</h3>
              <p className={`mb-6 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                This will also delete all transactions for this card.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-medium transition-colors text-white"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
