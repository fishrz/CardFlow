import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { BankColor, CreditCard } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose }) => {
  const { addCard } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    last4: '',
    statementDate: '1',
    paymentDueDays: '25',
    creditLimit: '10000',
    color: 'blue' as BankColor,
    pattern: 'none'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCard({
      name: formData.name,
      bank: formData.bank,
      last4: formData.last4,
      statementDate: parseInt(formData.statementDate),
      paymentDueDays: parseInt(formData.paymentDueDays),
      creditLimit: parseInt(formData.creditLimit),
      color: formData.color,
      pattern: formData.pattern as any
    });
    onClose();
    // Reset form...
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] bottom-auto md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] bg-white rounded-3xl shadow-2xl z-[70] p-6 overflow-y-auto max-h-[80vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Card</h2>
              <button onClick={onClose} className="p-2 bg-surface-ground rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Card Nickname</label>
                <input
                  required
                  className="w-full p-3 bg-surface-ground rounded-xl border-none focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  placeholder="e.g. DBS Altitude"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Bank Name</label>
                    <input
                    required
                    className="w-full p-3 bg-surface-ground rounded-xl border-none focus:ring-2 focus:ring-brand-blue/20 outline-none"
                    placeholder="DBS"
                    value={formData.bank}
                    onChange={e => setFormData({...formData, bank: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Last 4 Digits</label>
                    <input
                    required
                    maxLength={4}
                    className="w-full p-3 bg-surface-ground rounded-xl border-none focus:ring-2 focus:ring-brand-blue/20 outline-none"
                    placeholder="1234"
                    value={formData.last4}
                    onChange={e => setFormData({...formData, last4: e.target.value})}
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Statement Day</label>
                    <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    className="w-full p-3 bg-surface-ground rounded-xl border-none focus:ring-2 focus:ring-brand-blue/20 outline-none"
                    value={formData.statementDate}
                    onChange={e => setFormData({...formData, statementDate: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Payment Window (Days)</label>
                    <input
                    type="number"
                    min={15}
                    max={60}
                    required
                    className="w-full p-3 bg-surface-ground rounded-xl border-none focus:ring-2 focus:ring-brand-blue/20 outline-none"
                    value={formData.paymentDueDays}
                    onChange={e => setFormData({...formData, paymentDueDays: e.target.value})}
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Card Color</label>
                <div className="flex gap-2 flex-wrap">
                    {['blue', 'red', 'green', 'orange', 'purple', 'black'].map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({...formData, color: color as BankColor})}
                            className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-brand-blue scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color === 'black' ? '#333' : color }}
                        />
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Card Pattern</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['none', 'circles', 'waves', 'geometric', 'lines'].map((pattern) => (
                        <button
                            key={pattern}
                            type="button"
                            onClick={() => setFormData({...formData, pattern: pattern as any})}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 text-sm capitalize ${
                                formData.pattern === pattern 
                                ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' 
                                : 'border-gray-100 bg-gray-50 text-text-secondary'
                            }`}
                        >
                            {pattern}
                        </button>
                    ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-blue text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform mt-4"
              >
                Add Card
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

