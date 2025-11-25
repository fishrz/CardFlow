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
