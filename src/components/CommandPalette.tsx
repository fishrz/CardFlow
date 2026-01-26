import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Command, Search, X, CreditCard, ArrowUpRight, ArrowDownLeft, 
  Zap, TrendingUp, Calendar, BarChart3, DollarSign, ChevronRight,
  Sparkles, Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { TransactionCategory, CATEGORY_CONFIG, CARD_COLORS } from '../types';
import { format, parse, isValid, setYear, getYear } from 'date-fns';
import toast from 'react-hot-toast';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInsights: () => void;
  onOpenCardSelector: () => void;
}

interface ParsedCommand {
  type: 'expense' | 'payment' | 'unknown';
  amount: number;
  cardId: string | null;
  cardMatch: string;
  description: string;
  category: TransactionCategory;
  date: string; // yyyy-MM-dd format
  dateDisplay: string | null; // Human-readable date if detected
}

// Fuzzy match helper
function fuzzyMatch(str: string, pattern: string): boolean {
  const strLower = str.toLowerCase();
  const patternLower = pattern.toLowerCase();
  let patternIdx = 0;
  
  for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
    if (strLower[i] === patternLower[patternIdx]) {
      patternIdx++;
    }
  }
  return patternIdx === patternLower.length;
}

// Category detection based on keywords
const CATEGORY_KEYWORDS: Record<TransactionCategory, string[]> = {
  food: ['food', 'lunch', 'dinner', 'breakfast', 'coffee', 'cafe', 'restaurant', 'grab', 'foodpanda', 'deliveroo', 'mcdonalds', 'kfc', 'starbucks', 'meal', 'eat'],
  transport: ['grab', 'taxi', 'uber', 'bus', 'mrt', 'train', 'petrol', 'gas', 'parking', 'transport', 'gojek', 'comfort'],
  shopping: ['shop', 'shopping', 'amazon', 'lazada', 'shopee', 'uniqlo', 'zara', 'hm', 'mall', 'buy', 'purchase'],
  entertainment: ['movie', 'netflix', 'spotify', 'game', 'concert', 'show', 'entertainment', 'fun', 'play'],
  utilities: ['bill', 'electric', 'water', 'gas', 'internet', 'phone', 'mobile', 'utility', 'singtel', 'starhub'],
  healthcare: ['doctor', 'medical', 'pharmacy', 'hospital', 'clinic', 'health', 'medicine', 'dental'],
  travel: ['flight', 'hotel', 'booking', 'airbnb', 'travel', 'trip', 'vacation', 'holiday'],
  education: ['course', 'class', 'book', 'udemy', 'school', 'tuition', 'education', 'learn'],
  subscription: ['subscription', 'sub', 'monthly', 'yearly', 'premium', 'membership'],
  other: []
};

function detectCategory(text: string): TransactionCategory {
  const lowerText = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category as TransactionCategory;
    }
  }
  return 'other';
}

// Month name mappings
const MONTH_NAMES: Record<string, number> = {
  'jan': 0, 'january': 0,
  'feb': 1, 'february': 1,
  'mar': 2, 'march': 2,
  'apr': 3, 'april': 3,
  'may': 4,
  'jun': 5, 'june': 5,
  'jul': 6, 'july': 6,
  'aug': 7, 'august': 7,
  'sep': 8, 'sept': 8, 'september': 8,
  'oct': 9, 'october': 9,
  'nov': 10, 'november': 10,
  'dec': 11, 'december': 11,
};

interface DateParseResult {
  date: Date;
  matchedText: string;
}

// Parse date from natural language input
function detectDate(text: string): DateParseResult | null {
  const lowerText = text.toLowerCase();
  const today = new Date();
  const currentYear = getYear(today);
  
  // Pattern 1: "25 Nov", "25 November", "25th Nov", "25th of Nov"
  const pattern1 = /\b(\d{1,2})(?:st|nd|rd|th)?(?:\s+of)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;
  const match1 = text.match(pattern1);
  if (match1) {
    const day = parseInt(match1[1], 10);
    const monthStr = match1[2].toLowerCase();
    const month = MONTH_NAMES[monthStr.replace(/ember|uary|ch|il|e|y|ust|ober/g, (m) => {
      // Find the key that starts with the beginning of monthStr
      for (const key of Object.keys(MONTH_NAMES)) {
        if (monthStr.startsWith(key.substring(0, 3))) {
          return '';
        }
      }
      return '';
    })] ?? MONTH_NAMES[monthStr.substring(0, 3)];
    
    if (month !== undefined && day >= 1 && day <= 31) {
      let date = new Date(currentYear, month, day);
      // If the date is in the future by more than 2 months, assume last year
      // This helps with entries like "25 Dec" in January
      if (date > today && (date.getMonth() - today.getMonth() > 2 || 
          (date.getMonth() - today.getMonth() < 0 && date.getMonth() + 12 - today.getMonth() > 2))) {
        date = setYear(date, currentYear - 1);
      }
      if (isValid(date)) {
        return { date, matchedText: match1[0] };
      }
    }
  }
  
  // Pattern 2: "Nov 25", "November 25", "Nov 25th"
  const pattern2 = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i;
  const match2 = text.match(pattern2);
  if (match2) {
    const monthStr = match2[1].toLowerCase();
    const day = parseInt(match2[2], 10);
    const month = MONTH_NAMES[monthStr.substring(0, 3)];
    
    if (month !== undefined && day >= 1 && day <= 31) {
      let date = new Date(currentYear, month, day);
      if (date > today && (date.getMonth() - today.getMonth() > 2 || 
          (date.getMonth() - today.getMonth() < 0 && date.getMonth() + 12 - today.getMonth() > 2))) {
        date = setYear(date, currentYear - 1);
      }
      if (isValid(date)) {
        return { date, matchedText: match2[0] };
      }
    }
  }
  
  // Pattern 3: "25/11", "25-11", "25.11" (day/month format common in Singapore)
  const pattern3 = /\b(\d{1,2})[\/\-\.](\d{1,2})\b/;
  const match3 = text.match(pattern3);
  if (match3) {
    const num1 = parseInt(match3[1], 10);
    const num2 = parseInt(match3[2], 10);
    
    // Assume day/month format (Singapore style)
    if (num1 >= 1 && num1 <= 31 && num2 >= 1 && num2 <= 12) {
      let date = new Date(currentYear, num2 - 1, num1);
      if (date > today && (date.getMonth() - today.getMonth() > 2 || 
          (date.getMonth() - today.getMonth() < 0 && date.getMonth() + 12 - today.getMonth() > 2))) {
        date = setYear(date, currentYear - 1);
      }
      if (isValid(date)) {
        return { date, matchedText: match3[0] };
      }
    }
  }
  
  // Pattern 4: "yesterday", "today"
  if (lowerText.includes('yesterday')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { date: yesterday, matchedText: 'yesterday' };
  }
  
  if (lowerText.includes('today')) {
    return { date: today, matchedText: 'today' };
  }
  
  // Pattern 5: "last monday", "last tue", etc.
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const shortDayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const lastDayPattern = /\blast\s+(sun(?:day)?|mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?)\b/i;
  const matchLastDay = text.match(lastDayPattern);
  if (matchLastDay) {
    const dayStr = matchLastDay[1].toLowerCase();
    let targetDay = -1;
    
    for (let i = 0; i < dayNames.length; i++) {
      if (dayNames[i].startsWith(dayStr) || shortDayNames[i] === dayStr.substring(0, 3)) {
        targetDay = i;
        break;
      }
    }
    
    if (targetDay >= 0) {
      const currentDay = today.getDay();
      let daysAgo = currentDay - targetDay;
      if (daysAgo <= 0) daysAgo += 7;
      
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      return { date, matchedText: matchLastDay[0] };
    }
  }
  
  return null;
}

export default function CommandPalette({ isOpen, onClose, onOpenInsights, onOpenCardSelector }: CommandPaletteProps) {
  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { cards, addTransaction, getUpcomingPayments } = useStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  // Parse the input command
  const parsedCommand = useMemo((): ParsedCommand => {
    const parts = input.trim().split(/\s+/);
    let type: 'expense' | 'payment' | 'unknown' = 'unknown';
    let amount = 0;
    let cardId: string | null = null;
    let cardMatch = '';
    let description = '';
    
    // Detect date first
    const dateResult = detectDate(input);
    const date = dateResult ? format(dateResult.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const dateDisplay = dateResult ? format(dateResult.date, 'MMM d, yyyy') : null;
    
    // Check for payment keywords
    const paymentKeywords = ['pay', 'paid', 'payment', 'repay'];
    const isPayment = paymentKeywords.some(k => input.toLowerCase().includes(k));
    
    // Find amount (any number in the input, but not if it looks like part of a date)
    for (const part of parts) {
      // Skip if this part is part of the matched date text
      if (dateResult && dateResult.matchedText.toLowerCase().includes(part.toLowerCase())) {
        continue;
      }
      const num = parseFloat(part.replace(/[,$]/g, ''));
      if (!isNaN(num) && num > 0) {
        amount = num;
        break;
      }
    }
    
    // Find card match
    for (const card of cards) {
      const searchTerms = [
        card.bankName.toLowerCase(),
        card.cardName.toLowerCase(),
        card.lastFourDigits,
      ];
      
      for (const term of searchTerms) {
        if (parts.some(p => fuzzyMatch(term, p.toLowerCase()) || term.includes(p.toLowerCase()))) {
          cardId = card.id;
          cardMatch = `${card.bankName} •••• ${card.lastFourDigits}`;
          break;
        }
      }
      if (cardId) break;
    }
    
    // Default to first card if none matched
    if (!cardId && cards.length > 0) {
      cardId = cards[0].id;
      cardMatch = `${cards[0].bankName} •••• ${cards[0].lastFourDigits}`;
    }
    
    // Build description from non-numeric, non-card parts
    // Also filter out date-related words
    const dateWords = dateResult 
      ? dateResult.matchedText.toLowerCase().split(/\s+/)
      : [];
    
    description = parts
      .filter(p => isNaN(parseFloat(p.replace(/[,$]/g, ''))))
      .filter(p => !cards.some(c => 
        fuzzyMatch(c.bankName.toLowerCase(), p.toLowerCase()) ||
        fuzzyMatch(c.cardName.toLowerCase(), p.toLowerCase()) ||
        c.lastFourDigits.includes(p)
      ))
      .filter(p => !paymentKeywords.includes(p.toLowerCase()))
      .filter(p => !dateWords.includes(p.toLowerCase()))
      .filter(p => !['on', 'at', 'yesterday', 'today', 'last'].includes(p.toLowerCase()))
      .join(' ');
    
    if (amount > 0) {
      type = isPayment ? 'payment' : 'expense';
    }
    
    const category = detectCategory(description || input);
    
    return { type, amount, cardId, cardMatch, description, category, date, dateDisplay };
  }, [input, cards]);

  // Quick actions
  const quickActions = useMemo(() => {
    const upcomingPayments = getUpcomingPayments();
    const urgentPayment = upcomingPayments.find(p => p.daysUntilDue <= 7 && p.card.currentBalance > 0);
    
    return [
      {
        id: 'insights',
        icon: <BarChart3 className="w-4 h-4" />,
        label: 'View Monthly Insights',
        shortcut: '⌘I',
        action: onOpenInsights,
        color: 'violet'
      },
      {
        id: 'selector',
        icon: <Sparkles className="w-4 h-4" />,
        label: 'Smart Card Selector',
        shortcut: '⌘S',
        action: onOpenCardSelector,
        color: 'cyan'
      },
      ...(urgentPayment ? [{
        id: 'urgent',
        icon: <Clock className="w-4 h-4" />,
        label: `Pay ${urgentPayment.card.bankName} - $${urgentPayment.card.currentBalance.toFixed(2)} due in ${urgentPayment.daysUntilDue} days`,
        shortcut: '',
        action: () => {
          addTransaction({
            cardId: urgentPayment.card.id,
            amount: urgentPayment.card.currentBalance,
            description: 'Full balance payment',
            category: 'other',
            date: format(new Date(), 'yyyy-MM-dd'),
            isPayment: true,
          });
          toast.success(`Payment of $${urgentPayment.card.currentBalance.toFixed(2)} recorded!`);
          onClose();
        },
        color: 'amber'
      }] : [])
    ];
  }, [getUpcomingPayments, onOpenInsights, onOpenCardSelector, addTransaction, onClose]);

  // Recent transactions for suggestions (mockup - could be enhanced with actual history)
  const suggestions = useMemo(() => {
    if (!input) return [];
    
    const common = [
      { text: 'lunch 15', desc: 'Quick lunch expense' },
      { text: 'coffee 6', desc: 'Coffee expense' },
      { text: 'grab 25', desc: 'Grab transport' },
      { text: 'pay dbs', desc: 'Pay DBS card' },
    ];
    
    return common.filter(s => 
      fuzzyMatch(s.text, input) || s.text.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 3);
  }, [input]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setInput('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, quickActions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && !input && quickActions[selectedIndex]) {
        e.preventDefault();
        quickActions[selectedIndex].action();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, input, selectedIndex, quickActions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    if (parsedCommand.type === 'unknown' || parsedCommand.amount <= 0) {
      toast.error('Try: "lunch 25 dbs" or "pay 500 ocbc"');
      return;
    }
    
    if (!parsedCommand.cardId) {
      toast.error('No card found. Add a card first!');
      return;
    }
    
    addTransaction({
      cardId: parsedCommand.cardId,
      amount: parsedCommand.amount,
      description: parsedCommand.description || (parsedCommand.type === 'payment' ? 'Payment' : 'Expense'),
      category: parsedCommand.category,
      date: parsedCommand.date,
      isPayment: parsedCommand.type === 'payment',
    });
    
    const dateInfo = parsedCommand.dateDisplay ? ` on ${parsedCommand.dateDisplay}` : '';
    toast.success(
      parsedCommand.type === 'payment' 
        ? `💰 Payment of $${parsedCommand.amount.toFixed(2)} recorded${dateInfo}`
        : `✓ $${parsedCommand.amount.toFixed(2)} ${parsedCommand.description} added${dateInfo}`
    );
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 ${isLight ? 'bg-black/40' : 'bg-black/70'} backdrop-blur-sm`}
        />
        
        {/* Command Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl ${
            isLight 
              ? 'bg-white border border-slate-200' 
              : 'bg-zinc-900/95 border border-white/10'
          }`}
        >
          {/* Input Area */}
          <form onSubmit={handleSubmit} className={`flex items-center gap-3 px-4 py-4 border-b ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
              isLight ? 'bg-violet-100' : 'bg-violet-500/20'
            }`}>
              <Command className={`w-5 h-5 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Type "lunch 25 dbs" or "pay 500 ocbc"...'
              className={`flex-1 bg-transparent border-none outline-hidden text-lg ${
                isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-zinc-500'
              }`}
            />
            
            <div className="flex items-center gap-2">
              {input && (
                <motion.button
                  type="button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setInput('')}
                  className={`p-2 rounded-lg transition-colors ${
                    isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                  }`}
                >
                  <X className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
                </motion.button>
              )}
              
              <kbd className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                isLight 
                  ? 'bg-slate-100 text-slate-500' 
                  : 'bg-white/5 text-zinc-500'
              }`}>
                ESC
              </kbd>
            </div>
          </form>
          
          {/* Live Preview */}
          <AnimatePresence mode="wait">
            {input && parsedCommand.amount > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`px-4 py-3 border-b ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      parsedCommand.type === 'payment'
                        ? (isLight ? 'bg-emerald-100' : 'bg-emerald-500/20')
                        : (isLight ? 'bg-rose-100' : 'bg-rose-500/20')
                    }`}>
                      {parsedCommand.type === 'payment' 
                        ? <ArrowDownLeft className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                        : <ArrowUpRight className={`w-4 h-4 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
                      }
                    </div>
                    
                    <div>
                      <p className="font-semibold text-lg">
                        ${parsedCommand.amount.toFixed(2)}
                      </p>
                      <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {parsedCommand.type === 'payment' ? 'Payment' : parsedCommand.description || 'Expense'} 
                        {parsedCommand.type === 'expense' && ` • ${CATEGORY_CONFIG[parsedCommand.category].icon}`}
                        {parsedCommand.dateDisplay && (
                          <span className={`ml-1 ${isLight ? 'text-violet-600' : 'text-violet-400'}`}>
                            • 📅 {parsedCommand.dateDisplay}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {parsedCommand.cardMatch && (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        isLight ? 'bg-white' : 'bg-white/10'
                      }`}>
                        <CreditCard className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
                        <span className="text-sm font-medium">{parsedCommand.cardMatch}</span>
                      </div>
                    )}
                    
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      className={`px-4 py-2 rounded-xl font-medium text-white transition-all ${
                        parsedCommand.type === 'payment'
                          ? 'bg-linear-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25'
                          : 'bg-linear-to-r from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/25'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Quick Actions */}
          {!input && (
            <div className="p-2">
              <p className={`px-3 py-2 text-xs font-medium uppercase tracking-wider ${
                isLight ? 'text-slate-400' : 'text-zinc-500'
              }`}>
                Quick Actions
              </p>
              
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  onClick={action.action}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    selectedIndex === index
                      ? (isLight ? 'bg-slate-100' : 'bg-white/10')
                      : (isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5')
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    action.color === 'violet' 
                      ? (isLight ? 'bg-violet-100 text-violet-600' : 'bg-violet-500/20 text-violet-400')
                      : action.color === 'cyan'
                      ? (isLight ? 'bg-cyan-100 text-cyan-600' : 'bg-cyan-500/20 text-cyan-400')
                      : (isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-400')
                  }`}>
                    {action.icon}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <p className="font-medium">{action.label}</p>
                  </div>
                  
                  {action.shortcut && (
                    <kbd className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      isLight 
                        ? 'bg-slate-100 text-slate-500' 
                        : 'bg-white/5 text-zinc-500'
                    }`}>
                      {action.shortcut}
                    </kbd>
                  )}
                  
                  <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-300' : 'text-zinc-600'}`} />
                </motion.button>
              ))}
            </div>
          )}
          
          {/* Suggestions */}
          {input && suggestions.length > 0 && parsedCommand.amount === 0 && (
            <div className="p-2">
              <p className={`px-3 py-2 text-xs font-medium uppercase tracking-wider ${
                isLight ? 'text-slate-400' : 'text-zinc-500'
              }`}>
                Suggestions
              </p>
              
              {suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion.text}
                  onClick={() => setInput(suggestion.text)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <Search className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{suggestion.text}</p>
                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{suggestion.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
          
          {/* Footer Help */}
          <div className={`px-4 py-3 border-t flex items-center justify-between text-xs ${
            isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-white/10 bg-white/5 text-zinc-500'
          }`}>
            <div className="flex items-center gap-4">
              <span><kbd className={`px-1.5 py-0.5 rounded-sm ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>↵</kbd> to submit</span>
              <span><kbd className={`px-1.5 py-0.5 rounded-sm ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>↑↓</kbd> to navigate</span>
            </div>
            <span>⌘K to open anytime</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

