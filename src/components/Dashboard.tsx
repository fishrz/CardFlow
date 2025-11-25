import { motion } from 'framer-motion';
import { 
  Plus, CreditCard as CardIcon, TrendingUp, Calendar, Sparkles,
  Command, BarChart3, AlertTriangle, Receipt, Search
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { CreditCard } from '../types';
import CreditCardComponent from './CreditCard';
import StatsCard from './StatsCard';
import UpcomingPayments from './UpcomingPayments';
import EmptyState from './EmptyState';
import ThemeToggle from './ThemeToggle';
import { format } from 'date-fns';

interface DashboardProps {
  onAddCard: () => void;
  onEditCard: (card: CreditCard) => void;
  onAddTransaction: (cardId?: string) => void;
  onViewCard: (card: CreditCard) => void;
  onOpenCommandPalette: () => void;
  onOpenInsights: () => void;
  onOpenDueDateAlerts: () => void;
  onOpenAnnualFeeTracker: () => void;
  onOpenCardSelector: () => void;
}

export default function Dashboard({ 
  onAddCard, 
  onEditCard, 
  onAddTransaction, 
  onViewCard,
  onOpenCommandPalette,
  onOpenInsights,
  onOpenDueDateAlerts,
  onOpenAnnualFeeTracker,
  onOpenCardSelector,
}: DashboardProps) {
  const { cards, getCardStats, getUpcomingPayments } = useStore();
  const { theme } = useThemeStore();
  const stats = getCardStats();
  const isLight = theme === 'light';
  
  // Check for urgent payments
  const urgentPayments = getUpcomingPayments().filter(p => p.daysUntilDue <= 7 && p.card.currentBalance > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient">CardFlow</h1>
              </motion.div>
              <p className={`text-lg ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Command Palette Trigger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenCommandPalette}
                className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' 
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                }`}
              >
                <Command className="w-4 h-4" />
                <span className="text-sm">Quick Log</span>
                <kbd className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  isLight ? 'bg-slate-200 text-slate-500' : 'bg-white/10 text-zinc-500'
                }`}>⌘K</kbd>
              </motion.button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddTransaction()}
                className={`hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl glass transition-all duration-300 ${
                  isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
                }`}
              >
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Add Transaction</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddCard}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-violet-500/25 text-white"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Card</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Quick Actions Bar */}
        {cards.length > 0 && (
          <motion.section variants={itemVariants} className="mb-8">
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenInsights}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  isLight 
                    ? 'bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200' 
                    : 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/30'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Monthly Insights</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenCardSelector}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  isLight 
                    ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200' 
                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Best Card for...</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenDueDateAlerts}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  urgentPayments.length > 0
                    ? (isLight 
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30')
                    : (isLight 
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')
                }`}
              >
                {urgentPayments.length > 0 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {urgentPayments.length > 0 
                    ? `${urgentPayments.length} Payment${urgentPayments.length > 1 ? 's' : ''} Due` 
                    : 'Due Dates'
                  }
                </span>
                {urgentPayments.length > 0 && (
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    isLight ? 'bg-red-500' : 'bg-red-400'
                  }`} />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenAnnualFeeTracker}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  isLight 
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' 
                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span className="text-sm font-medium">Annual Fees</span>
              </motion.button>
            </div>
          </motion.section>
        )}

        {cards.length === 0 ? (
          <EmptyState onAddCard={onAddCard} />
        ) : (
          <>
            {/* Stats Overview */}
            <motion.section variants={itemVariants} className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  title="Total Balance"
                  value={`$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  subtitle={`of $${stats.totalLimit.toLocaleString('en-US')} limit`}
                  icon={<CardIcon className="w-6 h-6" />}
                  color="purple"
                />
                <StatsCard
                  title="Credit Utilization"
                  value={`${stats.utilizationRate.toFixed(1)}%`}
                  subtitle={stats.utilizationRate > 30 ? 'Consider paying down' : 'Looking healthy'}
                  icon={<TrendingUp className="w-6 h-6" />}
                  color={stats.utilizationRate > 50 ? 'rose' : stats.utilizationRate > 30 ? 'amber' : 'emerald'}
                  showProgress
                  progress={stats.utilizationRate}
                />
                <StatsCard
                  title="Active Cards"
                  value={cards.length.toString()}
                  subtitle={`${stats.upcomingPayments.filter(p => p.daysUntilDue <= 7).length} due this week`}
                  icon={<Calendar className="w-6 h-6" />}
                  color="cyan"
                />
              </div>
            </motion.section>

            {/* Upcoming Payments */}
            {stats.upcomingPayments.length > 0 && (
              <motion.section variants={itemVariants} className="mb-12">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-500" />
                  Upcoming Payments
                </h2>
                <UpcomingPayments 
                  payments={stats.upcomingPayments} 
                  onViewCard={onViewCard}
                  onAddTransaction={onAddTransaction}
                />
              </motion.section>
            )}

            {/* Cards Grid */}
            <motion.section variants={itemVariants}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CardIcon className="w-5 h-5 text-violet-500" />
                Your Cards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                  <CreditCardComponent
                    key={card.id}
                    card={card}
                    index={index}
                    onClick={() => onViewCard(card)}
                    onEdit={() => onEditCard(card)}
                    onAddTransaction={() => onAddTransaction(card.id)}
                  />
                ))}
                
                {/* Add Card Placeholder */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onAddCard}
                  className={`aspect-[1.6/1] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 group ${
                    isLight 
                      ? 'border-slate-200 hover:border-violet-400' 
                      : 'border-white/10 hover:border-violet-500/50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isLight 
                      ? 'bg-slate-100 group-hover:bg-violet-100' 
                      : 'bg-white/5 group-hover:bg-violet-500/20'
                  }`}>
                    <Plus className={`w-7 h-7 transition-colors ${
                      isLight 
                        ? 'text-slate-400 group-hover:text-violet-500' 
                        : 'text-zinc-500 group-hover:text-violet-400'
                    }`} />
                  </div>
                  <span className={`font-medium transition-colors ${
                    isLight 
                      ? 'text-slate-400 group-hover:text-slate-600' 
                      : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}>
                    Add New Card
                  </span>
                </motion.button>
              </div>
            </motion.section>
          </>
        )}

        {/* Mobile FAB - Opens Command Palette */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenCommandPalette}
          className="md:hidden fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30 z-50"
        >
          <Command className="w-7 h-7 text-white" />
        </motion.button>
      </motion.div>
    </div>
  );
}
