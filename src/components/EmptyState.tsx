import { motion } from 'framer-motion';
import { CreditCard, Plus, Sparkles } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

interface EmptyStateProps {
  onAddCard: () => void;
}

export default function EmptyState({ onAddCard }: EmptyStateProps) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      {/* Floating Cards Animation */}
      <div className="relative w-64 h-40 mb-8">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [-8, -8, -8],
          }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute left-0 top-8 w-48 h-28 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 opacity-60"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [4, 4, 4],
          }}
          transition={{
            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 },
          }}
          className="absolute right-0 top-4 w-48 h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 opacity-60"
        />
        <motion.div
          animate={{
            y: [0, -12, 0],
          }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 },
          }}
          className="absolute left-1/2 top-0 -translate-x-1/2 w-52 h-32 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center"
        >
          <CreditCard className="w-12 h-12 text-white/80" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-3xl font-bold mb-3">Welcome to CardFlow</h2>
        <p className={`text-lg max-w-md ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Start by adding your credit cards to track payments, due dates, and spending all in one beautiful place.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddCard}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-xl shadow-violet-500/25 text-white"
      >
        <Plus className="w-6 h-6" />
        <span className="text-lg font-semibold">Add Your First Card</span>
        <Sparkles className="w-5 h-5 text-amber-300" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl"
      >
        {[
          { title: 'Track Due Dates', desc: 'Never miss a payment with visual countdown timers' },
          { title: 'Monitor Balances', desc: 'See all your outstanding amounts at a glance' },
          { title: 'Record Transactions', desc: 'Keep track of spending and payments easily' },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + index * 0.1 }}
            className="glass rounded-2xl p-5 text-left"
          >
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
