import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Target, Store, 
  ChevronRight, AlertTriangle, CheckCircle, Sparkles,
  Settings, Info, Plane, Plus, Trash2, Edit3
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useBonusStore, CARD_PROFILES } from '../store/useBonusStore';
import { useThemeStore } from '../store/useThemeStore';
import { CARD_COLORS, BonusProgress, CardBonusRule } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface BonusTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BonusTracker({ isOpen, onClose }: BonusTrackerProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [editingRule, setEditingRule] = useState<CardBonusRule | null>(null);
  const [newMerchant, setNewMerchant] = useState('');
  
  const { cards, transactions } = useStore();
  const { bonusRules, calculateBonusProgress, applyCardProfile, getActiveRuleForCard, addMerchantToRule, removeMerchantFromRule } = useBonusStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  // Calculate progress for all cards with active rules
  const cardProgressList = useMemo(() => {
    return cards.map(card => {
      const rule = getActiveRuleForCard(card.id);
      if (!rule) return { card, progress: null, rule: null, unrecognizedMerchants: [] };
      
      const cardTransactions = transactions
        .filter(t => t.cardId === card.id && !t.isPayment)
        .map(t => ({
          amount: t.amount,
          description: t.description,
          date: t.date,
          isPayment: t.isPayment,
          category: t.category,
        }));
      
      const progress = calculateBonusProgress(card.id, cardTransactions);
      
      // Find unrecognized merchants (from transactions but not in qualifying list)
      const allMerchantDescriptions = new Set<string>();
      cardTransactions.forEach(t => {
        // Extract a cleaner merchant name from description
        const cleanDesc = t.description.trim();
        if (cleanDesc && !t.isPayment) {
          allMerchantDescriptions.add(cleanDesc);
        }
      });
      
      // Filter out ones that are already recognized
      const unrecognizedMerchants = Array.from(allMerchantDescriptions).filter(desc => {
        const descLower = desc.toLowerCase();
        return !rule.qualifyingMerchants.some(m => 
          descLower.includes(m.toLowerCase()) || m.toLowerCase().includes(descLower.split(' ')[0].toLowerCase())
        );
      });
      
      return { card, progress, rule, unrecognizedMerchants };
    });
  }, [cards, transactions, getActiveRuleForCard, calculateBonusProgress]);

  const trackedCards = cardProgressList.filter(item => item.progress !== null);
  const untrackedCards = cardProgressList.filter(item => item.progress === null);

  const getStatusColor = (status: BonusProgress['status']) => {
    switch (status) {
      case 'in_sweet_spot':
        return isLight ? 'text-emerald-600' : 'text-emerald-400';
      case 'at_cap':
        return isLight ? 'text-cyan-600' : 'text-cyan-400';
      case 'below_minimum':
        return isLight ? 'text-amber-600' : 'text-amber-400';
      case 'over_cap':
        return isLight ? 'text-rose-600' : 'text-rose-400';
      default:
        return isLight ? 'text-slate-600' : 'text-zinc-400';
    }
  };

  const getStatusBg = (status: BonusProgress['status']) => {
    switch (status) {
      case 'in_sweet_spot':
        return isLight ? 'bg-emerald-50' : 'bg-emerald-500/10';
      case 'at_cap':
        return isLight ? 'bg-cyan-50' : 'bg-cyan-500/10';
      case 'below_minimum':
        return isLight ? 'bg-amber-50' : 'bg-amber-500/10';
      case 'over_cap':
        return isLight ? 'bg-rose-50' : 'bg-rose-500/10';
      default:
        return isLight ? 'bg-slate-50' : 'bg-white/5';
    }
  };

  const getStatusLabel = (status: BonusProgress['status']) => {
    switch (status) {
      case 'in_sweet_spot':
        return 'IN ZONE';
      case 'at_cap':
        return 'MAXED';
      case 'below_minimum':
        return 'BELOW MIN';
      case 'over_cap':
        return 'OVER CAP';
      default:
        return 'INACTIVE';
    }
  };

  const handleApplyProfile = (profileId: string, cardId: string) => {
    applyCardProfile(profileId, cardId);
    setShowProfileSelector(false);
    setSelectedCardId(null);
  };

  const handleAddMerchant = () => {
    if (editingRule && newMerchant.trim()) {
      addMerchantToRule(editingRule.id, newMerchant.trim());
      setNewMerchant('');
    }
  };

  const handleRemoveMerchant = (merchant: string) => {
    if (editingRule) {
      removeMerchantFromRule(editingRule.id, merchant);
    }
  };

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
          className={`w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl ${
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
                isLight ? 'bg-gradient-to-br from-emerald-100 to-cyan-100' : 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20'
              }`}>
                <Target className={`w-6 h-6 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Bonus Tracker</h2>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {format(new Date(), 'MMMM yyyy')} Progress
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

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Tracked Cards */}
            {trackedCards.length > 0 && (
              <div className="mb-8">
                <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  TRACKING ({trackedCards.length})
                </h3>
                <div className="space-y-4">
                  {trackedCards.map(({ card, progress, rule, unrecognizedMerchants }) => {
                    if (!progress || !rule) return null;
                    
                    const progressPercent = rule.maxBonusSpend 
                      ? Math.min((progress.qualifyingSpend / rule.maxBonusSpend) * 100, 100)
                      : 0;
                    
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-5 rounded-2xl ${getStatusBg(progress.status)} border ${
                          isLight ? 'border-slate-200' : 'border-white/10'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-8 rounded-lg bg-gradient-to-br ${CARD_COLORS[card.color].gradient}`} />
                            <div>
                              <h4 className="font-semibold">{card.bankName} {card.cardName}</h4>
                              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                                {rule.name}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBg(progress.status)} ${getStatusColor(progress.status)}`}>
                            {getStatusLabel(progress.status)}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Bonus Progress</span>
                            <span className="font-medium">
                              ${progress.qualifyingSpend.toFixed(2)} / ${rule.maxBonusSpend?.toFixed(2) || '∞'}
                            </span>
                          </div>
                          <div className={`h-3 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className={`h-full rounded-full ${
                                progress.status === 'over_cap'
                                  ? 'bg-gradient-to-r from-rose-500 to-red-500'
                                  : progress.status === 'at_cap'
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                  : progress.status === 'in_sweet_spot'
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
                              }`}
                            />
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className={`p-3 rounded-xl ${isLight ? 'bg-white/80' : 'bg-black/20'}`}>
                            <div className="flex items-center gap-1 mb-1">
                              {progress.minSpendMet 
                                ? <CheckCircle className="w-3 h-3 text-emerald-500" />
                                : <AlertTriangle className="w-3 h-3 text-amber-500" />
                              }
                              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Min Spend</span>
                            </div>
                            <p className="font-semibold text-sm">
                              ${progress.totalSpend.toFixed(0)} / ${rule.minSpend}
                            </p>
                          </div>
                          
                          <div className={`p-3 rounded-xl ${isLight ? 'bg-white/80' : 'bg-black/20'}`}>
                            <div className="flex items-center gap-1 mb-1">
                              {progress.merchantRequirementMet 
                                ? <CheckCircle className="w-3 h-3 text-emerald-500" />
                                : <Store className="w-3 h-3 text-amber-500" />
                              }
                              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Merchants</span>
                            </div>
                            <p className="font-semibold text-sm">
                              {progress.merchantCount} / {rule.minMerchantCount || 0}
                            </p>
                          </div>
                          
                          <div className={`p-3 rounded-xl ${isLight ? 'bg-white/80' : 'bg-black/20'}`}>
                            <div className="flex items-center gap-1 mb-1">
                              <Sparkles className={`w-3 h-3 ${isLight ? 'text-violet-500' : 'text-violet-400'}`} />
                              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Est. Bonus</span>
                            </div>
                            <p className={`font-semibold text-sm ${isLight ? 'text-violet-600' : 'text-violet-400'}`}>
                              ${progress.estimatedBonus.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Miles Conversion */}
                        {progress.estimatedMiles !== undefined && progress.estimatedMiles > 0 && (
                          <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 ${
                            isLight ? 'bg-indigo-50' : 'bg-indigo-500/10'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Plane className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                              <span className={`text-sm ${isLight ? 'text-indigo-600' : 'text-indigo-300'}`}>
                                ≈ {Math.round(progress.estimatedMiles).toLocaleString()} KrisFlyer miles
                              </span>
                            </div>
                            {rule.milesPerDollar && (
                              <span className={`text-xs ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`}>
                                ({rule.milesPerDollar} mpd)
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Recommendations */}
                        {progress.recommendations.length > 0 && (
                          <div className={`p-3 rounded-xl ${isLight ? 'bg-white/80' : 'bg-black/20'}`}>
                            <div className="flex items-center gap-1 mb-2">
                              <Info className={`w-3 h-3 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                              <span className={`text-xs font-medium ${isLight ? 'text-blue-600' : 'text-blue-300'}`}>Tips</span>
                            </div>
                            <ul className={`text-xs space-y-1 ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                              {progress.recommendations.slice(0, 2).map((rec, i) => (
                                <li key={i}>💡 {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Merchants Used */}
                        {progress.merchantsUsed.length > 0 && (
                          <div className="mt-3">
                            <p className={`text-xs mb-2 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                              ✅ Qualifying Merchants Used ({progress.merchantsUsed.length}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {progress.merchantsUsed.map((merchant) => (
                                <span 
                                  key={merchant}
                                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-300'
                                  }`}
                                >
                                  {merchant}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Unrecognized Merchants from Transactions */}
                        {unrecognizedMerchants && unrecognizedMerchants.length > 0 && (
                          <div className={`mt-3 p-3 rounded-xl ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                            <p className={`text-xs mb-2 font-medium ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                              ⚠️ Transactions not counted ({unrecognizedMerchants.length}):
                            </p>
                            <p className={`text-[10px] mb-2 ${isLight ? 'text-amber-600' : 'text-amber-400/70'}`}>
                              Click to add as qualifying merchant
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {unrecognizedMerchants.slice(0, 5).map((merchant) => (
                                <motion.button
                                  key={merchant}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    // Extract a simpler merchant name (first few words)
                                    const simpleName = merchant.split(/\s+/).slice(0, 2).join(' ');
                                    addMerchantToRule(rule.id, simpleName);
                                    toast.success(`Added "${simpleName}" to qualifying merchants`);
                                  }}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors ${
                                    isLight 
                                      ? 'bg-white hover:bg-amber-100 text-amber-700 border border-amber-200' 
                                      : 'bg-black/20 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  <Plus className="w-3 h-3" />
                                  <span className="truncate max-w-[120px]">{merchant}</span>
                                </motion.button>
                              ))}
                              {unrecognizedMerchants.length > 5 && (
                                <span className={`px-2 py-1 text-[10px] ${isLight ? 'text-amber-500' : 'text-amber-400/60'}`}>
                                  +{unrecognizedMerchants.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Edit Rule Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setEditingRule(rule)}
                          className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                            isLight 
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' 
                              : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                          }`}
                        >
                          <Edit3 className="w-4 h-4" />
                          Manage Qualifying Merchants
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Untracked Cards */}
            {untrackedCards.length > 0 && (
              <div>
                <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  NOT TRACKING ({untrackedCards.length})
                </h3>
                <div className="space-y-2">
                  {untrackedCards.map(({ card }) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        isLight ? 'bg-slate-50' : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-6 rounded-lg bg-gradient-to-br ${CARD_COLORS[card.color].gradient}`} />
                        <div>
                          <p className="font-medium text-sm">{card.bankName}</p>
                          <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                            {card.cardName}
                          </p>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedCardId(card.id);
                          setShowProfileSelector(true);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                          isLight 
                            ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' 
                            : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Set Up Tracking
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {cards.length === 0 && (
              <div className={`text-center py-12 rounded-2xl ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                <Target className={`w-16 h-16 mx-auto mb-4 ${isLight ? 'text-slate-300' : 'text-zinc-600'}`} />
                <h3 className="text-lg font-semibold mb-2">No Cards Added</h3>
                <p className={`${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                  Add cards to start tracking bonuses
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Selector Modal */}
        <AnimatePresence>
          {showProfileSelector && selectedCardId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              onClick={() => setShowProfileSelector(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md rounded-2xl p-6 ${
                  isLight ? 'bg-white shadow-2xl' : 'bg-zinc-900 border border-white/10'
                }`}
              >
                <h3 className="text-lg font-semibold mb-4">Select Card Profile</h3>
                <p className={`text-sm mb-4 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Choose a pre-configured profile to automatically set up bonus tracking rules.
                </p>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {CARD_PROFILES.map((profile) => (
                    <motion.button
                      key={profile.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleApplyProfile(profile.id, selectedCardId)}
                      className={`w-full text-left p-4 rounded-xl ${
                        isLight ? 'bg-slate-50 hover:bg-slate-100' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{profile.bankName} {profile.cardName}</p>
                          <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                            v{profile.version} • {profile.bonusRules[0]?.description}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-300' : 'text-zinc-600'}`} />
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowProfileSelector(false)}
                  className={`w-full mt-4 px-4 py-3 rounded-xl font-medium ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Merchant Management Modal */}
        <AnimatePresence>
          {editingRule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              onClick={() => setEditingRule(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md rounded-2xl p-6 ${
                  isLight ? 'bg-white shadow-2xl' : 'bg-zinc-900 border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Qualifying Merchants</h3>
                  <button
                    onClick={() => setEditingRule(null)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className={`text-sm mb-4 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Add merchants that qualify for bonus rewards. Transactions matching these names will count toward your bonus.
                </p>
                
                {/* Add New Merchant */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newMerchant}
                    onChange={(e) => setNewMerchant(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMerchant()}
                    placeholder="e.g., Cold Storage, Giant..."
                    className={`flex-1 px-4 py-2 rounded-xl text-sm ${
                      isLight 
                        ? 'bg-slate-100 border border-slate-200 focus:border-violet-400' 
                        : 'bg-white/5 border border-white/10 focus:border-violet-500'
                    } outline-none transition-colors`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddMerchant}
                    disabled={!newMerchant.trim()}
                    className={`px-4 py-2 rounded-xl font-medium ${
                      newMerchant.trim()
                        ? 'bg-violet-500 text-white hover:bg-violet-600'
                        : isLight ? 'bg-slate-200 text-slate-400' : 'bg-white/10 text-zinc-500'
                    } transition-colors`}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {/* Merchant List */}
                <div className={`rounded-xl overflow-hidden ${
                  isLight ? 'bg-slate-50' : 'bg-white/5'
                }`}>
                  <div className={`px-4 py-2 text-xs font-semibold ${
                    isLight ? 'text-slate-500 bg-slate-100' : 'text-zinc-400 bg-white/5'
                  }`}>
                    {editingRule.qualifyingMerchants.length} merchants configured
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {editingRule.qualifyingMerchants.length === 0 ? (
                      <p className={`p-4 text-sm text-center ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                        No merchants added yet
                      </p>
                    ) : (
                      editingRule.qualifyingMerchants.map((merchant) => (
                        <div
                          key={merchant}
                          className={`flex items-center justify-between px-4 py-2 ${
                            isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Store className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
                            <span className="text-sm">{merchant}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveMerchant(merchant)}
                            className={`p-1 rounded-lg ${
                              isLight ? 'hover:bg-red-100 text-red-500' : 'hover:bg-red-500/20 text-red-400'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <p className={`mt-4 text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                  💡 Tip: Use partial names for flexible matching (e.g., "Giant" will match "GIANT SUPERMARKET")
                </p>
                
                <button
                  onClick={() => setEditingRule(null)}
                  className={`w-full mt-4 px-4 py-3 rounded-xl font-medium ${
                    isLight 
                      ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' 
                      : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                  }`}
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

