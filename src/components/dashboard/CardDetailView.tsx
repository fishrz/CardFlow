import React from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Calendar, Trash2 } from 'lucide-react';
import { CreditCard } from '@/types';
import { FluidCard } from '@/components/ui/FluidCard';
import { formatCurrency, getCardBalance } from '@/lib/finance';
import { useStore } from '@/store/useStore';

interface CardDetailViewProps {
  card: CreditCard;
  onClose: () => void;
}

export const CardDetailView: React.FC<CardDetailViewProps> = ({ card, onClose }) => {
  const { transactions, addTransaction, markTransactionPaid, deleteCard, layoutMode } = useStore();
  
  const cardTransactions = transactions
    .filter(t => t.cardId === card.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const balance = getCardBalance(card.id, transactions);

  const handleQuickAdd = (amount: number, desc: string) => {
    addTransaction({
        cardId: card.id,
        amount,
        description: desc,
        category: 'Quick'
    });
  };

  const isDesktop = layoutMode === 'desktop';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex justify-center items-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Container - Wider for desktop */}
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={`
          w-full bg-surface-ground flex flex-col shadow-2xl overflow-hidden
          ${isDesktop 
            ? 'max-w-2xl max-h-[85vh] rounded-3xl m-4' 
            : 'max-w-md h-full md:h-[850px] md:rounded-4xl'
          }
        `}
      >
          {/* Header Actions */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <button 
                onClick={onClose}
                className="p-2 bg-white rounded-full shadow-xs hover:bg-gray-100 transition-colors"
            >
                <X size={24} className="text-text-primary" />
            </button>
            <h2 className="font-bold text-lg text-text-primary">{card.name}</h2>
            <button 
                onClick={() => {
                    if (confirm('Are you sure you want to delete this card?')) {
                        deleteCard(card.id);
                        onClose();
                    }
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
                <Trash2 size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
                {/* Hero Card - Smaller in desktop modal */}
                <div className={`mb-8 ${isDesktop ? 'max-w-sm mx-auto' : ''}`}>
                    <FluidCard card={card} balance={balance} minimal />
                </div>

                {/* Stats Row for Desktop */}
                {isDesktop && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-4 text-center shadow-xs">
                      <p className="text-text-secondary text-xs mb-1">Current Due</p>
                      <p className="text-xl font-bold text-text-primary">{formatCurrency(balance)}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-xs">
                      <p className="text-text-secondary text-xs mb-1">Credit Limit</p>
                      <p className="text-xl font-bold text-text-primary">{formatCurrency(card.creditLimit)}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-xs">
                      <p className="text-text-secondary text-xs mb-1">Transactions</p>
                      <p className="text-xl font-bold text-text-primary">{cardTransactions.length}</p>
                    </div>
                  </div>
                )}

                {/* Action Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button 
                        onClick={() => {
                            const amount = prompt('Enter amount to add:');
                            const desc = prompt('Description (optional):') || 'Manual Entry';
                            if (amount && !isNaN(parseFloat(amount))) {
                                handleQuickAdd(parseFloat(amount), desc);
                            }
                        }}
                        className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xs active:scale-95 transition-transform hover:shadow-md"
                    >
                        <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-2">
                            <Plus size={24} />
                        </div>
                        <span className="font-semibold text-text-primary">Add Spend</span>
                    </button>

                    <button 
                        className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xs active:scale-95 transition-transform hover:shadow-md"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                            <Calendar size={24} />
                        </div>
                        <span className="font-semibold text-text-primary">History</span>
                    </button>
                </div>

                {/* Transaction List */}
                <h3 className="text-lg font-bold text-text-primary mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                    {cardTransactions.length === 0 ? (
                        <p className="text-center text-text-muted py-8 bg-white rounded-xl">No transactions yet.</p>
                    ) : (
                        cardTransactions.map(t => (
                            <motion.div 
                                key={t.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-xs hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${t.isPaid ? 'bg-green-500' : 'bg-orange-500'}`} />
                                    <div>
                                        <p className="font-medium text-text-primary">{t.description}</p>
                                        <p className="text-xs text-text-secondary">{new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-text-primary">{formatCurrency(t.amount)}</p>
                                    {!t.isPaid && (
                                        <button 
                                            onClick={() => markTransactionPaid(t.id)}
                                            className="text-xs text-brand-blue font-medium hover:underline"
                                        >
                                            Mark Paid
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
};
