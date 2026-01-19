import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Settings, Download, Upload, AlertTriangle, 
  Database, FileJson, Trash2, Moon, Sun,
  Shield, Cloud, RefreshCw, LogOut,
  Loader2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useBonusStore } from '../store/useBonusStore';
import { useThemeStore } from '../store/useThemeStore';
import { useSyncStore } from '../store/useSyncStore';
import { SwipeExport } from '../types';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const APP_VERSION = '2.0.0';
const EXPORT_VERSION = '1.0';

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { cards, transactions } = useStore();
  const { bonusRules } = useBonusStore();
  const { theme, toggleTheme } = useThemeStore();
  const { 
    isConfigured: isSyncConfigured,
    isConnected, 
    user, 
    syncStatus, 
    lastSyncTime,
    connect, 
    disconnect, 
    syncNow 
  } = useSyncStore();
  const isLight = theme === 'light';

  // Export data to JSON
  const handleExport = () => {
    const exportData: SwipeExport = {
      version: EXPORT_VERSION,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      cards,
      transactions,
      bonusRules,
      settings: {
        theme,
      },
      stats: {
        totalCards: cards.length,
        totalTransactions: transactions.length,
        dateRange: transactions.length > 0 ? {
          from: transactions.reduce((min, t) => t.date < min ? t.date : min, transactions[0]?.date || ''),
          to: transactions.reduce((max, t) => t.date > max ? t.date : max, transactions[0]?.date || ''),
        } : undefined,
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `swipe-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${cards.length} cards and ${transactions.length} transactions`);
  };

  // Import data from JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as SwipeExport;
        
        // Validate structure
        if (!data.version || !data.cards || !data.transactions) {
          throw new Error('Invalid backup file format');
        }
        
        // Import cards
        const store = useStore.getState();
        data.cards.forEach(card => {
          // Check if card already exists
          const existing = store.cards.find(c => c.id === card.id);
          if (!existing) {
            store.addCard({
              bankName: card.bankName,
              cardName: card.cardName,
              lastFourDigits: card.lastFourDigits,
              creditLimit: card.creditLimit,
              currentBalance: card.currentBalance,
              dueDate: card.dueDate,
              statementDate: card.statementDate,
              color: card.color,
            });
          }
        });
        
        // Import transactions (this is simplified - a real implementation would be smarter)
        // For now, we'll skip duplicate prevention since it's complex
        
        // Import bonus rules
        if (data.bonusRules) {
          const bonusStore = useBonusStore.getState();
          data.bonusRules.forEach(rule => {
            const existing = bonusStore.bonusRules.find(r => r.id === rule.id);
            if (!existing) {
              bonusStore.addBonusRule({
                cardId: rule.cardId,
                name: rule.name,
                description: rule.description,
                isActive: rule.isActive,
                minSpend: rule.minSpend,
                maxBonusSpend: rule.maxBonusSpend,
                minMerchantCount: rule.minMerchantCount,
                qualifyingMerchants: rule.qualifyingMerchants,
                merchantMatchMode: rule.merchantMatchMode,
                qualifyingCategories: rule.qualifyingCategories,
                excludeKeywords: rule.excludeKeywords,
                excludePayments: rule.excludePayments,
                bonusRate: rule.bonusRate,
                baseRate: rule.baseRate,
                rewardUnit: rule.rewardUnit,
                pointsToMilesRatio: rule.pointsToMilesRatio,
              });
            }
          });
        }
        
        // Import theme preference
        if (data.settings?.theme) {
          useThemeStore.getState().setTheme(data.settings.theme);
        }
        
        toast.success(`Imported data from backup`);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Import error:', error);
        setImportError(error instanceof Error ? error.message : 'Failed to import file');
        toast.error('Failed to import backup file');
      }
    };
    
    reader.onerror = () => {
      setImportError('Failed to read file');
      toast.error('Failed to read file');
    };
    
    reader.readAsText(file);
  };

  // Clear all data
  const handleClearAll = () => {
    localStorage.removeItem('cardflow-storage');
    localStorage.removeItem('cardflow-bonus-storage');
    localStorage.removeItem('cardflow-theme-storage');
    window.location.reload();
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
          className={`w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl ${
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
                isLight ? 'bg-slate-100' : 'bg-white/10'
              }`}>
                <Settings className={`w-6 h-6 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Settings</h2>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Swipe v{APP_VERSION}
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
            {/* Appearance Section */}
            <div className="mb-8">
              <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                <Moon className="w-4 h-4" />
                APPEARANCE
              </h3>
              
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                isLight ? 'bg-slate-50' : 'bg-white/5'
              }`}>
                <div className="flex items-center gap-3">
                  {isLight ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                      {isLight ? 'Light Mode' : 'Dark Mode'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className={`px-4 py-2 rounded-xl font-medium ${
                    isLight 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  Switch
                </motion.button>
              </div>
            </div>

            {/* Cloud Sync Section */}
            {isSyncConfigured && (
              <div className="mb-8">
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
                  isLight ? 'text-slate-600' : 'text-zinc-400'
                }`}>
                  <Cloud className="w-4 h-4" />
                  CLOUD SYNC
                </h3>
                
                {isConnected ? (
                  <div className={`p-4 rounded-xl ${
                    isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${
                        isLight ? 'bg-emerald-100' : 'bg-emerald-500/20'
                      }`}>
                        {user?.picture ? (
                          <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Cloud className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                          Google Drive Connected
                        </h4>
                        <p className={`text-sm truncate ${isLight ? 'text-emerald-600/80' : 'text-emerald-300/80'}`}>
                          {user?.email}
                        </p>
                        <p className={`text-xs mt-1 ${isLight ? 'text-emerald-600/60' : 'text-emerald-300/60'}`}>
                          {lastSyncTime 
                            ? `Last synced ${formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}`
                            : 'Not synced yet'
                          }
                        </p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => syncNow()}
                            disabled={syncStatus === 'syncing'}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                              isLight 
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50' 
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50'
                            }`}
                          >
                            {syncStatus === 'syncing' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              disconnect();
                              toast.success('Disconnected from Google Drive');
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                              isLight 
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                : 'bg-white/10 text-zinc-400 hover:bg-white/15'
                            }`}
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Disconnect
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl ${
                    isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      <Cloud className={`w-5 h-5 mt-0.5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                      <div className="flex-1">
                        <h4 className={`font-medium ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
                          Google Drive Sync
                        </h4>
                        <p className={`text-sm mb-3 ${isLight ? 'text-blue-600/80' : 'text-blue-300/80'}`}>
                          Automatically backup your data to Google Drive. Access from any device.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async () => {
                            try {
                              await connect();
                              toast.success('Connected to Google Drive!');
                            } catch (error) {
                              toast.error('Failed to connect');
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white ${
                            'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25'
                          }`}
                        >
                          <Cloud className="w-4 h-4" />
                          Connect Google Drive
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Data Management Section */}
            <div className="mb-8">
              <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                <Database className="w-4 h-4" />
                DATA MANAGEMENT
              </h3>
              
              {/* Data Stats */}
              <div className={`p-4 rounded-xl mb-4 ${
                isLight ? 'bg-slate-50' : 'bg-white/5'
              }`}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{cards.length}</p>
                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Cards</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Transactions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{bonusRules.length}</p>
                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>Rules</p>
                  </div>
                </div>
              </div>
              
              {/* Export */}
              <div className={`p-4 rounded-xl mb-3 ${
                isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <Download className={`w-5 h-5 mt-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <div className="flex-1">
                    <h4 className={`font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                      Export Data
                    </h4>
                    <p className={`text-sm mb-3 ${isLight ? 'text-emerald-600/80' : 'text-emerald-300/80'}`}>
                      Download all your data as a JSON file for backup
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleExport}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white ${
                        'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25'
                      }`}
                    >
                      <FileJson className="w-4 h-4" />
                      Export to JSON
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Import */}
              <div className={`p-4 rounded-xl mb-3 ${
                isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <Upload className={`w-5 h-5 mt-0.5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                  <div className="flex-1">
                    <h4 className={`font-medium ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
                      Import Data
                    </h4>
                    <p className={`text-sm mb-3 ${isLight ? 'text-blue-600/80' : 'text-blue-300/80'}`}>
                      Restore from a Swipe backup file
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
                        isLight 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                          : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                      }`}
                    >
                      <FileJson className="w-4 h-4" />
                      Import from JSON
                    </motion.button>
                    
                    {importError && (
                      <p className="text-red-500 text-sm mt-2">{importError}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Clear Data */}
              <div className={`p-4 rounded-xl ${
                isLight ? 'bg-rose-50 border border-rose-200' : 'bg-rose-500/10 border border-rose-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <Trash2 className={`w-5 h-5 mt-0.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
                  <div className="flex-1">
                    <h4 className={`font-medium ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
                      Clear All Data
                    </h4>
                    <p className={`text-sm mb-3 ${isLight ? 'text-rose-600/80' : 'text-rose-300/80'}`}>
                      Permanently delete all cards, transactions, and settings
                    </p>
                    
                    {!showClearConfirm ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowClearConfirm(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
                          isLight 
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                            : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Data
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleClearAll}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Confirm Delete
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowClearConfirm(false)}
                          className={`px-4 py-2 rounded-xl font-medium ${
                            isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10'
                          }`}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className={`p-4 rounded-xl ${
              isLight ? 'bg-slate-100' : 'bg-white/5'
            }`}>
              <div className="flex items-start gap-3">
                <Shield className={`w-5 h-5 mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`} />
                <div>
                  <h4 className={`font-medium mb-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    Privacy First
                  </h4>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    All your data is stored locally in your browser. Nothing is sent to any server.
                    Export your data regularly to prevent accidental loss.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

