import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, CreditCard as CardIcon, 
  TrendingUp, Percent, DollarSign, ShoppingBag, Utensils,
  Car, Plane, Film, Zap, HeartPulse, GraduationCap, Wifi
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { CARD_COLORS, TransactionCategory, CreditCard } from '../types';

interface SmartCardSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CardRewardConfig {
  category: TransactionCategory;
  rewardRate: number; // percentage (e.g., 6 = 6%)
  rewardType: 'cashback' | 'miles' | 'points';
  milesPerDollar?: number; // For miles cards
}

// Singapore Credit Card Reward Rates (2024-2025)
// Based on real card benefits
const SINGAPORE_CARD_REWARDS: Record<string, CardRewardConfig[]> = {
  // DBS Yuu Card - 18% at yuu merchants (but we simplify for categories)
  'DBS': [
    { category: 'food', rewardRate: 10, rewardType: 'miles', milesPerDollar: 10 }, // yuu merchants
    { category: 'shopping', rewardRate: 10, rewardType: 'miles', milesPerDollar: 10 }, // yuu merchants  
    { category: 'transport', rewardRate: 5, rewardType: 'cashback' }, // SimplyGo
    { category: 'entertainment', rewardRate: 5, rewardType: 'cashback' },
    { category: 'utilities', rewardRate: 5, rewardType: 'cashback' },
    { category: 'healthcare', rewardRate: 5, rewardType: 'cashback' },
    { category: 'travel', rewardRate: 4, rewardType: 'miles', milesPerDollar: 4 },
    { category: 'education', rewardRate: 5, rewardType: 'cashback' },
    { category: 'subscription', rewardRate: 5, rewardType: 'cashback' },
    { category: 'other', rewardRate: 5, rewardType: 'cashback' },
  ],
  // OCBC 365 Card - 6% dining, 3% grocery, 3% transport
  'OCBC': [
    { category: 'food', rewardRate: 6, rewardType: 'cashback' },
    { category: 'shopping', rewardRate: 3, rewardType: 'cashback' },
    { category: 'transport', rewardRate: 3, rewardType: 'cashback' },
    { category: 'entertainment', rewardRate: 3, rewardType: 'cashback' },
    { category: 'utilities', rewardRate: 3, rewardType: 'cashback' },
    { category: 'healthcare', rewardRate: 0.3, rewardType: 'cashback' },
    { category: 'travel', rewardRate: 3, rewardType: 'cashback' },
    { category: 'education', rewardRate: 0.3, rewardType: 'cashback' },
    { category: 'subscription', rewardRate: 3, rewardType: 'cashback' },
    { category: 'other', rewardRate: 0.3, rewardType: 'cashback' },
  ],
  // UOB One Card - Up to 10% rebate
  'UOB': [
    { category: 'food', rewardRate: 10, rewardType: 'cashback' },
    { category: 'shopping', rewardRate: 5, rewardType: 'cashback' },
    { category: 'transport', rewardRate: 5, rewardType: 'cashback' },
    { category: 'entertainment', rewardRate: 5, rewardType: 'cashback' },
    { category: 'utilities', rewardRate: 5, rewardType: 'cashback' },
    { category: 'healthcare', rewardRate: 3.33, rewardType: 'cashback' },
    { category: 'travel', rewardRate: 5, rewardType: 'cashback' },
    { category: 'education', rewardRate: 3.33, rewardType: 'cashback' },
    { category: 'subscription', rewardRate: 5, rewardType: 'cashback' },
    { category: 'other', rewardRate: 3.33, rewardType: 'cashback' },
  ],
  // Citi Cash Back - 8% groceries/petrol, 6% dining
  'Citibank': [
    { category: 'food', rewardRate: 6, rewardType: 'cashback' },
    { category: 'shopping', rewardRate: 8, rewardType: 'cashback' }, // groceries
    { category: 'transport', rewardRate: 8, rewardType: 'cashback' }, // petrol
    { category: 'entertainment', rewardRate: 0.25, rewardType: 'cashback' },
    { category: 'utilities', rewardRate: 0.25, rewardType: 'cashback' },
    { category: 'healthcare', rewardRate: 0.25, rewardType: 'cashback' },
    { category: 'travel', rewardRate: 0.25, rewardType: 'cashback' },
    { category: 'education', rewardRate: 0.25, rewardType: 'cashback' },
    { category: 'subscription', rewardRate: 0.25, rewardType: 'cashback' },
    { category: 'other', rewardRate: 0.25, rewardType: 'cashback' },
  ],
  // HSBC Advance - 3.5% on selected categories
  'HSBC': [
    { category: 'food', rewardRate: 3.5, rewardType: 'cashback' },
    { category: 'shopping', rewardRate: 3.5, rewardType: 'cashback' },
    { category: 'transport', rewardRate: 3.5, rewardType: 'cashback' },
    { category: 'entertainment', rewardRate: 3.5, rewardType: 'cashback' },
    { category: 'utilities', rewardRate: 2.5, rewardType: 'cashback' },
    { category: 'healthcare', rewardRate: 2.5, rewardType: 'cashback' },
    { category: 'travel', rewardRate: 3.5, rewardType: 'cashback' },
    { category: 'education', rewardRate: 2.5, rewardType: 'cashback' },
    { category: 'subscription', rewardRate: 3.5, rewardType: 'cashback' },
    { category: 'other', rewardRate: 2.5, rewardType: 'cashback' },
  ],
  // Standard Chartered - Various rates
  'Standard Chartered': [
    { category: 'food', rewardRate: 5, rewardType: 'cashback' },
    { category: 'shopping', rewardRate: 5, rewardType: 'cashback' },
    { category: 'transport', rewardRate: 5, rewardType: 'cashback' },
    { category: 'entertainment', rewardRate: 2, rewardType: 'cashback' },
    { category: 'utilities', rewardRate: 1, rewardType: 'cashback' },
    { category: 'healthcare', rewardRate: 1, rewardType: 'cashback' },
    { category: 'travel', rewardRate: 3, rewardType: 'miles', milesPerDollar: 3 },
    { category: 'education', rewardRate: 1, rewardType: 'cashback' },
    { category: 'subscription', rewardRate: 2, rewardType: 'cashback' },
    { category: 'other', rewardRate: 1, rewardType: 'cashback' },
  ],
  // Maybank - Family & Friends
  'Maybank': [
    { category: 'food', rewardRate: 5, rewardType: 'cashback' },
    { category: 'shopping', rewardRate: 8, rewardType: 'cashback' }, // weekends
    { category: 'transport', rewardRate: 5, rewardType: 'cashback' },
    { category: 'entertainment', rewardRate: 5, rewardType: 'cashback' },
    { category: 'utilities', rewardRate: 0.3, rewardType: 'cashback' },
    { category: 'healthcare', rewardRate: 0.3, rewardType: 'cashback' },
    { category: 'travel', rewardRate: 5, rewardType: 'cashback' },
    { category: 'education', rewardRate: 0.3, rewardType: 'cashback' },
    { category: 'subscription', rewardRate: 5, rewardType: 'cashback' },
    { category: 'other', rewardRate: 0.3, rewardType: 'cashback' },
  ],
  // AMEX KrisFlyer - Miles focused
  'AMEX': [
    { category: 'food', rewardRate: 2.2, rewardType: 'miles', milesPerDollar: 2.2 },
    { category: 'shopping', rewardRate: 2.2, rewardType: 'miles', milesPerDollar: 2.2 },
    { category: 'transport', rewardRate: 2.2, rewardType: 'miles', milesPerDollar: 2.2 },
    { category: 'entertainment', rewardRate: 2.2, rewardType: 'miles', milesPerDollar: 2.2 },
    { category: 'utilities', rewardRate: 1.1, rewardType: 'miles', milesPerDollar: 1.1 },
    { category: 'healthcare', rewardRate: 1.1, rewardType: 'miles', milesPerDollar: 1.1 },
    { category: 'travel', rewardRate: 3, rewardType: 'miles', milesPerDollar: 3 },
    { category: 'education', rewardRate: 1.1, rewardType: 'miles', milesPerDollar: 1.1 },
    { category: 'subscription', rewardRate: 1.1, rewardType: 'miles', milesPerDollar: 1.1 },
    { category: 'other', rewardRate: 1.1, rewardType: 'miles', milesPerDollar: 1.1 },
  ],
  // Default fallback for other banks
  'DEFAULT': [
    { category: 'food', rewardRate: 1, rewardType: 'cashback' },
    { category: 'shopping', rewardRate: 1, rewardType: 'cashback' },
    { category: 'transport', rewardRate: 1, rewardType: 'cashback' },
    { category: 'entertainment', rewardRate: 1, rewardType: 'cashback' },
    { category: 'utilities', rewardRate: 0.5, rewardType: 'cashback' },
    { category: 'healthcare', rewardRate: 0.5, rewardType: 'cashback' },
    { category: 'travel', rewardRate: 1, rewardType: 'cashback' },
    { category: 'education', rewardRate: 0.5, rewardType: 'cashback' },
    { category: 'subscription', rewardRate: 1, rewardType: 'cashback' },
    { category: 'other', rewardRate: 0.5, rewardType: 'cashback' },
  ],
};

const CATEGORY_ICONS: Record<TransactionCategory, JSX.Element> = {
  food: <Utensils className="w-5 h-5" />,
  transport: <Car className="w-5 h-5" />,
  shopping: <ShoppingBag className="w-5 h-5" />,
  entertainment: <Film className="w-5 h-5" />,
  utilities: <Wifi className="w-5 h-5" />,
  healthcare: <HeartPulse className="w-5 h-5" />,
  travel: <Plane className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  subscription: <Zap className="w-5 h-5" />,
  other: <DollarSign className="w-5 h-5" />,
};

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  food: 'Food & Dining',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  utilities: 'Utilities & Bills',
  healthcare: 'Healthcare',
  travel: 'Travel',
  education: 'Education',
  subscription: 'Subscriptions',
  other: 'General',
};

// Helper function to get reward config for a card based on bank name
function getCardRewardConfig(bankName: string): CardRewardConfig[] {
  const bankKey = Object.keys(SINGAPORE_CARD_REWARDS).find(key => 
    bankName.toUpperCase().includes(key.toUpperCase())
  );
  return SINGAPORE_CARD_REWARDS[bankKey || 'DEFAULT'];
}

export default function SmartCardSelector({ isOpen, onClose }: SmartCardSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(null);
  const [amount, setAmount] = useState<number>(100);
  
  const { cards } = useStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  // Get reward config for each card based on bank name
  const cardRewards = useMemo(() => {
    const rewards: Map<string, CardRewardConfig[]> = new Map();
    
    cards.forEach((card) => {
      const config = getCardRewardConfig(card.bankName);
      rewards.set(card.id, config);
    });
    
    return rewards;
  }, [cards]);

  // Get best card for selected category
  const recommendation = useMemo(() => {
    if (!selectedCategory || cards.length === 0) return null;
    
    let bestCard: CreditCard | null = null;
    let bestRate = 0;
    let bestRewardType: 'cashback' | 'miles' | 'points' = 'cashback';
    let bestMilesPerDollar: number | undefined;
    
    cards.forEach(card => {
      const rewards = cardRewards.get(card.id);
      const categoryReward = rewards?.find(r => r.category === selectedCategory);
      
      if (categoryReward && categoryReward.rewardRate > bestRate) {
        bestCard = card;
        bestRate = categoryReward.rewardRate;
        bestRewardType = categoryReward.rewardType;
        bestMilesPerDollar = categoryReward.milesPerDollar;
      }
    });
    
    if (!bestCard) return null;
    
    // Calculate savings/rewards
    const savings = bestRewardType === 'miles' && bestMilesPerDollar
      ? amount * bestMilesPerDollar // total miles earned
      : (amount * bestRate) / 100;  // cashback amount
    
    return {
      card: bestCard,
      rate: bestRate,
      rewardType: bestRewardType,
      savings,
      milesPerDollar: bestMilesPerDollar,
    };
  }, [selectedCategory, cards, cardRewards, amount]);

  // All cards ranked for category
  const rankedCards = useMemo(() => {
    if (!selectedCategory || cards.length === 0) return [];
    
    return cards
      .map(card => {
        const rewards = cardRewards.get(card.id);
        const categoryReward = rewards?.find(r => r.category === selectedCategory);
        const rewardRate = categoryReward?.rewardRate || 0;
        const rewardType = categoryReward?.rewardType || 'cashback';
        const milesPerDollar = categoryReward?.milesPerDollar;
        
        // Calculate value based on reward type
        const savings = rewardType === 'miles' && milesPerDollar
          ? amount * milesPerDollar // total miles
          : (amount * rewardRate) / 100; // cashback
        
        return {
          card,
          rate: rewardRate,
          rewardType,
          savings,
          milesPerDollar,
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [selectedCategory, cards, cardRewards, amount]);

  const categories: TransactionCategory[] = [
    'food', 'transport', 'shopping', 'entertainment', 'utilities',
    'healthcare', 'travel', 'education', 'subscription', 'other'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          isLight ? 'bg-black/40' : 'bg-black/60'
        } backdrop-blur-sm`}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl ${
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
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isLight ? 'bg-gradient-to-br from-cyan-100 to-violet-100' : 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20'
              }`}>
                <Sparkles className={`w-6 h-6 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Smart Card Selector</h2>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Find the best card for your purchase
                </p>
              </div>
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

          <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
            {/* Amount Input */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Purchase Amount
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-xl font-semibold ${
                    isLight 
                      ? 'bg-slate-100 border border-slate-200 text-slate-900 focus:border-violet-400' 
                      : 'bg-white/5 border border-white/10 text-white focus:border-violet-500/50'
                  } transition-colors`}
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                What are you buying?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {categories.map(cat => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      selectedCategory === cat
                        ? 'ring-2 ring-violet-500 ' + (isLight ? 'bg-violet-50 text-violet-600' : 'bg-violet-500/20 text-violet-400')
                        : (isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-white/5 hover:bg-white/10 text-zinc-400')
                    }`}
                  >
                    {CATEGORY_ICONS[cat]}
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {CATEGORY_LABELS[cat].split(' ')[0]}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <AnimatePresence mode="wait">
              {recommendation && (
                <motion.div
                  key={recommendation.card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-6 p-5 rounded-2xl ${
                    isLight 
                      ? 'bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200' 
                      : 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    <span className={`text-sm font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                      BEST CHOICE
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Card Visual */}
                    <div className={`w-24 h-16 rounded-xl bg-gradient-to-br ${CARD_COLORS[recommendation.card.color].gradient} p-3 flex flex-col justify-between`}>
                      <div className="text-white/80 text-xs font-medium truncate">
                        {recommendation.card.bankName}
                      </div>
                      <div className="text-white text-xs">
                        •••• {recommendation.card.lastFourDigits}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{recommendation.card.cardName || recommendation.card.bankName}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          {recommendation.rewardType === 'miles' ? (
                            <Plane className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                          ) : (
                            <Percent className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                          )}
                          <span className={`text-sm font-medium ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                            {recommendation.rewardType === 'miles' && recommendation.milesPerDollar
                              ? `${recommendation.milesPerDollar} mpd`
                              : `${recommendation.rate}% cashback`
                            }
                          </span>
                        </div>
                        <div className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          on {CATEGORY_LABELS[selectedCategory!]}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                        {recommendation.rewardType === 'miles'
                          ? `${Math.round(recommendation.savings).toLocaleString()}`
                          : `$${recommendation.savings.toFixed(2)}`
                        }
                      </p>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {recommendation.rewardType === 'miles' ? 'miles' : 'savings'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* All Cards Comparison */}
            {selectedCategory && rankedCards.length > 1 && (
              <div>
                <h3 className={`text-sm font-medium mb-3 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  All Cards Compared
                </h3>
                <div className="space-y-2">
                  {rankedCards.slice(1).map((item, index) => (
                    <motion.div
                      key={item.card.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        isLight ? 'bg-slate-50' : 'bg-white/5'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${CARD_COLORS[item.card.color].gradient}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.card.bankName}</p>
                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                          {item.card.cardName || `•••• ${item.card.lastFourDigits}`}
                        </p>
                      </div>
                      <div className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                        {item.rewardType === 'miles' && item.milesPerDollar
                          ? `${item.milesPerDollar} mpd`
                          : `${item.rate}%`
                        }
                      </div>
                      <div className={`text-sm ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                        {item.rewardType === 'miles'
                          ? `${Math.round(item.savings).toLocaleString()} mi`
                          : `$${item.savings.toFixed(2)}`
                        }
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Savings Comparison */}
                {recommendation && rankedCards.length > 1 && (
                  <div className={`mt-4 p-3 rounded-xl ${
                    isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'
                  }`}>
                    <p className={`text-sm ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                      💡 Using <strong>{recommendation.card.bankName}</strong> instead of <strong>{rankedCards[rankedCards.length - 1].card.bankName}</strong> saves you{' '}
                      <strong>${(recommendation.savings - rankedCards[rankedCards.length - 1].savings).toFixed(2)}</strong> on this purchase!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {cards.length === 0 && (
              <div className={`text-center py-12 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                <CardIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Add cards to get personalized recommendations</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

