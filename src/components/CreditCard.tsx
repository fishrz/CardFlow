import { motion } from 'framer-motion';
import { Edit3, Plus, Wifi } from 'lucide-react';
import { CreditCard as CreditCardType, CARD_COLORS } from '../types';
import { differenceInDays, setDate, addMonths, isBefore, startOfDay } from 'date-fns';

interface CreditCardProps {
  card: CreditCardType;
  index: number;
  onClick: () => void;
  onEdit: () => void;
  onAddTransaction: () => void;
}

export default function CreditCardComponent({ card, index, onClick, onEdit, onAddTransaction }: CreditCardProps) {
  const colorConfig = CARD_COLORS[card.color];
  
  // Calculate days until due
  const today = startOfDay(new Date());
  let dueDate = setDate(today, card.dueDate);
  if (isBefore(dueDate, today)) {
    dueDate = addMonths(dueDate, 1);
  }
  const daysUntilDue = differenceInDays(dueDate, today);
  
  const utilizationPercent = (card.currentBalance / card.creditLimit) * 100;
  
  const getUrgencyClass = () => {
    if (daysUntilDue <= 3 && card.currentBalance > 0) return 'urgency-critical';
    if (daysUntilDue <= 7 && card.currentBalance > 0) return 'urgency-warning';
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{ 
        y: -8,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      className={`relative group cursor-pointer ${getUrgencyClass()}`}
      onClick={onClick}
    >
      {/* Card Container */}
      <div className={`aspect-[1.6/1] rounded-3xl bg-gradient-to-br ${colorConfig.gradient} p-6 relative overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-500`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4" />
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 card-shine" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Top Row */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 text-sm font-medium">{card.bankName}</p>
              <p className="text-white text-lg font-semibold mt-0.5">{card.cardName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-6 h-6 text-white/80 rotate-90" />
            </div>
          </div>

          {/* Card Number */}
          <div className="flex items-center gap-3">
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

          {/* Bottom Row */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Outstanding</p>
              <p className="text-white text-2xl font-bold">
                ${card.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Due in</p>
              <p className={`text-xl font-bold ${daysUntilDue <= 3 ? 'text-red-200' : daysUntilDue <= 7 ? 'text-amber-200' : 'text-white'}`}>
                {daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? '1 day' : `${daysUntilDue} days`}
              </p>
            </div>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${utilizationPercent > 80 ? 'bg-red-400' : utilizationPercent > 50 ? 'bg-amber-400' : 'bg-white/50'}`}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddTransaction();
          }}
          className="w-9 h-9 rounded-xl bg-black/30 backdrop-blur-xl flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          <Plus className="w-4 h-4 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="w-9 h-9 rounded-xl bg-black/30 backdrop-blur-xl flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          <Edit3 className="w-4 h-4 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}

