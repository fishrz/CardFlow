export interface CreditCard {
  id: string;
  bankName: string;
  cardName: string;
  lastFourDigits: string;
  creditLimit: number;
  currentBalance: number;
  dueDate: number; // Day of month (1-31)
  statementDate: number; // Day of month when statement is generated
  color: CardColor;
  createdAt: string;
}

export interface Transaction {
  id: string;
  cardId: string;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: string;
  isPayment: boolean; // true if this is a payment to the card
  createdAt: string;
}

export type CardColor = 
  | 'purple'
  | 'blue'
  | 'emerald'
  | 'rose'
  | 'orange'
  | 'cyan'
  | 'slate'
  | 'amber';

export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'utilities'
  | 'healthcare'
  | 'travel'
  | 'education'
  | 'subscription'
  | 'other';

export interface CardStats {
  totalBalance: number;
  totalLimit: number;
  utilizationRate: number;
  upcomingPayments: UpcomingPayment[];
}

export interface UpcomingPayment {
  card: CreditCard;
  daysUntilDue: number;
  dueDate: Date;
}

// Singapore Banks
export const SINGAPORE_BANKS = [
  'DBS',
  'OCBC',
  'UOB',
  'Citibank',
  'HSBC',
  'Standard Chartered',
  'Maybank',
  'CIMB',
  'Bank of China',
  'AMEX',
  'Other'
] as const;

export type SingaporeBank = typeof SINGAPORE_BANKS[number];

export const CARD_COLORS: Record<CardColor, { gradient: string; glow: string; accent: string }> = {
  purple: {
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    glow: 'shadow-glow-purple',
    accent: '#8B5CF6'
  },
  blue: {
    gradient: 'from-blue-600 via-indigo-600 to-violet-600',
    glow: 'shadow-glow-blue',
    accent: '#3B82F6'
  },
  emerald: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glow: 'shadow-glow-emerald',
    accent: '#10B981'
  },
  rose: {
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    glow: 'shadow-glow-rose',
    accent: '#F43F5E'
  },
  orange: {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glow: 'shadow-glow-purple',
    accent: '#F97316'
  },
  cyan: {
    gradient: 'from-cyan-500 via-sky-500 to-blue-500',
    glow: 'shadow-glow-blue',
    accent: '#06B6D4'
  },
  slate: {
    gradient: 'from-slate-600 via-slate-700 to-zinc-800',
    glow: 'shadow-glow-purple',
    accent: '#64748B'
  },
  amber: {
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    glow: 'shadow-glow-rose',
    accent: '#F59E0B'
  }
};

export const CATEGORY_CONFIG: Record<TransactionCategory, { icon: string; label: string; color: string }> = {
  food: { icon: '🍽️', label: 'Food & Dining', color: '#F97316' },
  transport: { icon: '🚗', label: 'Transport', color: '#3B82F6' },
  shopping: { icon: '🛍️', label: 'Shopping', color: '#EC4899' },
  entertainment: { icon: '🎬', label: 'Entertainment', color: '#8B5CF6' },
  utilities: { icon: '💡', label: 'Utilities', color: '#14B8A6' },
  healthcare: { icon: '🏥', label: 'Healthcare', color: '#EF4444' },
  travel: { icon: '✈️', label: 'Travel', color: '#06B6D4' },
  education: { icon: '📚', label: 'Education', color: '#10B981' },
  subscription: { icon: '📱', label: 'Subscriptions', color: '#6366F1' },
  other: { icon: '📌', label: 'Other', color: '#64748B' }
};

// ============================================
// BONUS TRACKING TYPES
// ============================================

export type BonusRuleType = 
  | 'minimum_spend'      // Must spend X to qualify for bonus
  | 'bonus_cap'          // Bonus stops after X spend
  | 'merchant_count'     // Must use X different merchants
  | 'category_bonus';    // Bonus for specific categories

export type MerchantMatchMode = 'exact' | 'contains' | 'regex';

export type RewardUnit = 'cashback' | 'points' | 'miles';

export type BonusStatus = 
  | 'inactive'           // Not tracking
  | 'below_minimum'      // Haven't hit minimum spend
  | 'in_sweet_spot'      // In the optimal range
  | 'at_cap'             // Hit the cap exactly
  | 'over_cap';          // Exceeded cap (wasted potential)

// Card Bonus Rule - Defines a single bonus rule for a card
export interface CardBonusRule {
  id: string;
  cardId: string;
  name: string;
  description?: string;
  isActive: boolean;
  
  // Rule Thresholds
  minSpend?: number;              // Minimum to qualify (e.g., 800)
  maxBonusSpend?: number;         // Cap on bonus-earning spend (e.g., 822.86)
  minMerchantCount?: number;      // Required unique merchants (e.g., 4)
  
  // Merchant Matching
  qualifyingMerchants: string[];  // Merchant names that qualify
  merchantMatchMode: MerchantMatchMode;
  
  // Category Matching (alternative to merchants)
  qualifyingCategories?: TransactionCategory[];
  
  // Exclusions
  excludeKeywords: string[];      // e.g., ["voucher", "gift card"]
  excludePayments: boolean;       // Exclude card payments
  
  // Reward Calculation
  bonusRate: number;              // e.g., 0.18 for 18%
  baseRate: number;               // e.g., 0.05 for 5%
  rewardUnit: RewardUnit;
  pointsToMilesRatio?: number;    // e.g., 3.6 (360 points = 100 miles) - for intermediate calculation
  milesPerDollar?: number;        // e.g., 10 (direct mpd when qualified) - preferred for display
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Bonus Progress - Calculated state for a card in a period
export interface BonusProgress {
  cardId: string;
  period: string;                 // "2025-11" (YYYY-MM)
  
  // Spending Totals
  totalSpend: number;             // All card spending
  qualifyingSpend: number;        // Only bonus-eligible spend
  nonQualifyingSpend: number;     // Spend that doesn't count
  
  // Merchant Tracking
  merchantsUsed: string[];        // Unique qualifying merchants used
  merchantCount: number;
  
  // Rule Status
  minSpendMet: boolean;
  bonusCapReached: boolean;
  merchantRequirementMet: boolean;
  
  // Calculations
  remainingToMinimum: number;     // $ needed to hit minimum
  remainingToCap: number;         // $ before hitting cap
  
  // Estimated Rewards
  estimatedBonus: number;         // In reward units
  estimatedMiles?: number;        // Converted to miles if applicable
  
  // Overall Status
  status: BonusStatus;
  
  // Recommendations
  recommendations: string[];
}

// Card Profile - Pre-configured template for popular cards
export interface CardProfile {
  id: string;
  bankName: string;
  cardName: string;
  
  // Version Control
  version: string;               // "2025-10"
  effectiveDate: string;         // When rules took effect
  lastUpdated: string;
  
  // Sources
  officialTncUrl?: string;
  reviewUrl?: string;
  
  // Pre-configured Rules (without id/cardId - will be generated)
  bonusRules: Omit<CardBonusRule, 'id' | 'cardId' | 'createdAt' | 'updatedAt'>[];
  
  // Card Info
  annualFee: number;
  feeWaiverSpend?: number;
  incomeRequirement?: number;
  
  // Tips
  tips?: string[];
  
  // Card appearance
  suggestedColor: CardColor;
}

// ============================================
// DATA EXPORT/IMPORT TYPES
// ============================================

export interface SwipeExport {
  // Metadata
  version: string;               // Export format version
  appVersion: string;            // Swipe app version
  exportedAt: string;            // ISO timestamp
  
  // Core Data
  cards: CreditCard[];
  transactions: Transaction[];
  
  // Bonus Configuration
  bonusRules: CardBonusRule[];
  
  // Settings
  settings: {
    theme: 'dark' | 'light';
  };
  
  // Statistics (for reference, not imported)
  stats?: {
    totalCards: number;
    totalTransactions: number;
    dateRange?: {
      from: string;
      to: string;
    };
  };
}
