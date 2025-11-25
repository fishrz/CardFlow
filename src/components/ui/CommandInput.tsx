import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CreditCard as CardIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface CommandInputProps {
  onOpenManual: () => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({ onOpenManual }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { cards, addTransaction, layoutMode } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const isDesktop = layoutMode === 'desktop';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parts = input.trim().split(' ');
    
    let matchedCardId = cards[0]?.id;
    let amount = 0;
    let description = '';

    if (!isNaN(parseFloat(parts[0]))) {
        amount = parseFloat(parts[0]);
        
        const rest = parts.slice(1).join(' ').toLowerCase();
        const foundCard = cards.find(c => rest.includes(c.name.toLowerCase()) || rest.includes(c.bank.toLowerCase()));
        if (foundCard) matchedCardId = foundCard.id;
        
        description = parts.slice(1).join(' ');
    } else {
        description = input;
    }

    if (matchedCardId) {
        addTransaction({
            cardId: matchedCardId,
            amount: amount || 0,
            description: description || input,
            category: 'General'
        });
        setInput('');
        inputRef.current?.blur();
    }
  };

  return (
    <div className={`fixed bottom-6 z-50 ${isDesktop ? 'left-1/2 -translate-x-1/2 w-full max-w-xl px-4' : 'left-4 right-4 max-w-md mx-auto'}`}>
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "relative flex items-center bg-white/90 backdrop-blur-xl shadow-floating rounded-full p-2 border border-white/30 transition-all duration-300",
          isFocused ? "ring-2 ring-brand-blue/30 scale-[1.02] shadow-xl" : ""
        )}
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          onClick={onOpenManual}
          className="p-3 bg-surface-ground rounded-full text-text-secondary hover:bg-brand-blue/10 hover:text-brand-blue transition-colors"
        >
          <CardIcon size={20} />
        </button>
        
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder='Type "25 Lunch DBS"...'
          className="flex-1 bg-transparent border-none outline-none px-4 text-text-primary placeholder:text-text-muted font-medium"
        />

        <AnimatePresence>
            {input.length > 0 && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    type="submit"
                    className="p-3 bg-brand-blue text-white rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors"
                >
                    <Send size={18} />
                </motion.button>
            )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
};
