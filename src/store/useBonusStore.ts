import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardBonusRule, BonusProgress, BonusStatus, CardProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// ============================================
// CARD PROFILES - Pre-configured templates
// ============================================

export const CARD_PROFILES: CardProfile[] = [
  {
    id: 'dbs-yuu-2025-10',
    bankName: 'DBS',
    cardName: 'Yuu Card',
    version: '2025-10',
    effectiveDate: '2025-10-01',
    lastUpdated: '2025-11-27',
    officialTncUrl: 'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/promotions/dbs-yuu-cards/dbs-yuu-card-promotion-tncs.pdf',
    reviewUrl: 'https://milelion.com/2025/10/06/review-dbs-yuu-card/',
    annualFee: 196.20,
    feeWaiverSpend: 600,
    incomeRequirement: 30000,
    suggestedColor: 'purple',
    bonusRules: [
      {
        name: 'DBS Yuu Bonus Tracker',
        description: '10 mpd at yuu merchants with S$800 min spend and 4+ merchants',
        isActive: true,
        minSpend: 800,
        maxBonusSpend: 822.86,
        minMerchantCount: 4,
        qualifyingMerchants: [
          'Cold Storage',
          'Giant',
          'Guardian',
          '7-Eleven',
          '7-11',
          'foodpanda',
          'Marketplace',
          'CS Fresh',
          'SimplyGo',
          'BUS/MRT',
          'Jason\'s Deli',
          'Jasons',
        ],
        merchantMatchMode: 'contains',
        excludeKeywords: ['voucher', 'gift card', 'top-up', 'topup', 'pandapro'],
        excludePayments: true,
        bonusRate: 0.18,
        baseRate: 0.05,
        rewardUnit: 'miles',
        milesPerDollar: 10, // $1 = 10 KrisFlyer miles when qualified
        pointsToMilesRatio: 3.6, // For reference: 360 yuu points = 100 KrisFlyer miles
      },
    ],
    tips: [
      'Must transact at 4+ different yuu merchants per month',
      'SimplyGo (bus/MRT) counts as a yuu merchant',
      'Avoid using vouchers or PandaPro discounts - they may not qualify',
      'foodpanda orders with discounts may not count toward bonus',
      'First year annual fee is waived',
      'Can convert yuu points to KrisFlyer miles instantly',
    ],
  },
  {
    id: 'ocbc-365-2025',
    bankName: 'OCBC',
    cardName: '365 Card',
    version: '2025',
    effectiveDate: '2025-01-01',
    lastUpdated: '2025-11-27',
    annualFee: 192.60,
    feeWaiverSpend: 500,
    incomeRequirement: 30000,
    suggestedColor: 'rose',
    bonusRules: [
      {
        name: 'OCBC 365 Dining Cashback',
        description: '6% cashback on dining (capped at $80/month)',
        isActive: true,
        minSpend: 800,
        maxBonusSpend: 1333.33, // $80 cap ÷ 6%
        qualifyingMerchants: [],
        qualifyingCategories: ['food'],
        merchantMatchMode: 'contains',
        excludeKeywords: [],
        excludePayments: true,
        bonusRate: 0.06,
        baseRate: 0.003,
        rewardUnit: 'cashback',
      },
    ],
    tips: [
      'Best for dining with 6% cashback',
      'Minimum spend of $800 required',
      'Cashback capped at $80/month for dining',
    ],
  },
  {
    id: 'uob-one-2025',
    bankName: 'UOB',
    cardName: 'One Card',
    version: '2025',
    effectiveDate: '2025-01-01',
    lastUpdated: '2025-11-27',
    annualFee: 192.60,
    feeWaiverSpend: 500,
    incomeRequirement: 30000,
    suggestedColor: 'blue',
    bonusRules: [
      {
        name: 'UOB One Rebate',
        description: 'Up to 10% rebate with min $500 spend + 3 transactions',
        isActive: true,
        minSpend: 500,
        maxBonusSpend: 2000,
        qualifyingMerchants: [],
        merchantMatchMode: 'contains',
        excludeKeywords: [],
        excludePayments: true,
        bonusRate: 0.10,
        baseRate: 0.003,
        rewardUnit: 'cashback',
      },
    ],
    tips: [
      'Need min 3 transactions per statement',
      'Salary crediting to UOB account increases rebate',
      'GIRO payments also qualify',
    ],
  },
];

// ============================================
// STORE INTERFACE
// ============================================

interface BonusState {
  // Bonus Rules
  bonusRules: CardBonusRule[];
  
  // Actions - Rules Management
  addBonusRule: (rule: Omit<CardBonusRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBonusRule: (id: string, updates: Partial<CardBonusRule>) => void;
  deleteBonusRule: (id: string) => void;
  toggleBonusRule: (id: string) => void;
  
  // Actions - Merchant Management
  addMerchantToRule: (ruleId: string, merchant: string) => void;
  removeMerchantFromRule: (ruleId: string, merchant: string) => void;
  
  // Actions - Profile Templates
  applyCardProfile: (profileId: string, cardId: string) => void;
  
  // Computed - Progress Calculation
  calculateBonusProgress: (cardId: string, transactions: { amount: number; description: string; date: string; isPayment: boolean; category: string }[], period?: string) => BonusProgress | null;
  
  // Helpers
  getRulesForCard: (cardId: string) => CardBonusRule[];
  getActiveRuleForCard: (cardId: string) => CardBonusRule | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function matchesMerchant(description: string, merchants: string[], mode: 'exact' | 'contains' | 'regex'): boolean {
  const descLower = description.toLowerCase();
  
  for (const merchant of merchants) {
    const merchantLower = merchant.toLowerCase();
    
    switch (mode) {
      case 'exact':
        if (descLower === merchantLower) return true;
        break;
      case 'contains':
        if (descLower.includes(merchantLower)) return true;
        break;
      case 'regex':
        try {
          if (new RegExp(merchant, 'i').test(description)) return true;
        } catch {
          // Invalid regex, skip
        }
        break;
    }
  }
  
  return false;
}

function hasExcludedKeyword(description: string, keywords: string[]): boolean {
  const descLower = description.toLowerCase();
  return keywords.some(keyword => descLower.includes(keyword.toLowerCase()));
}

function extractMerchantName(description: string, merchants: string[], mode: 'exact' | 'contains' | 'regex'): string | null {
  const descLower = description.toLowerCase();
  
  for (const merchant of merchants) {
    const merchantLower = merchant.toLowerCase();
    
    switch (mode) {
      case 'exact':
        if (descLower === merchantLower) return merchant;
        break;
      case 'contains':
        if (descLower.includes(merchantLower)) return merchant;
        break;
      case 'regex':
        try {
          if (new RegExp(merchant, 'i').test(description)) return merchant;
        } catch {
          // Invalid regex, skip
        }
        break;
    }
  }
  
  return null;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useBonusStore = create<BonusState>()(
  persist(
    (set, get) => ({
      bonusRules: [],
      
      addBonusRule: (ruleData) => {
        const newRule: CardBonusRule = {
          ...ruleData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ bonusRules: [...state.bonusRules, newRule] }));
      },
      
      updateBonusRule: (id, updates) => {
        set((state) => ({
          bonusRules: state.bonusRules.map((rule) =>
            rule.id === id 
              ? { ...rule, ...updates, updatedAt: new Date().toISOString() } 
              : rule
          ),
        }));
      },
      
      deleteBonusRule: (id) => {
        set((state) => ({
          bonusRules: state.bonusRules.filter((rule) => rule.id !== id),
        }));
      },
      
      toggleBonusRule: (id) => {
        set((state) => ({
          bonusRules: state.bonusRules.map((rule) =>
            rule.id === id 
              ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() } 
              : rule
          ),
        }));
      },
      
      addMerchantToRule: (ruleId, merchant) => {
        set((state) => ({
          bonusRules: state.bonusRules.map((rule) =>
            rule.id === ruleId && !rule.qualifyingMerchants.includes(merchant)
              ? { 
                  ...rule, 
                  qualifyingMerchants: [...rule.qualifyingMerchants, merchant],
                  updatedAt: new Date().toISOString() 
                } 
              : rule
          ),
        }));
      },
      
      removeMerchantFromRule: (ruleId, merchant) => {
        set((state) => ({
          bonusRules: state.bonusRules.map((rule) =>
            rule.id === ruleId
              ? { 
                  ...rule, 
                  qualifyingMerchants: rule.qualifyingMerchants.filter(m => m !== merchant),
                  updatedAt: new Date().toISOString() 
                } 
              : rule
          ),
        }));
      },
      
      applyCardProfile: (profileId, cardId) => {
        const profile = CARD_PROFILES.find(p => p.id === profileId);
        if (!profile) return;
        
        // Create new rules from profile template
        const newRules: CardBonusRule[] = profile.bonusRules.map((ruleTemplate) => ({
          ...ruleTemplate,
          id: uuidv4(),
          cardId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        
        // Remove existing rules for this card and add new ones in single update
        set((state) => ({
          bonusRules: [
            ...state.bonusRules.filter((rule) => rule.cardId !== cardId),
            ...newRules,
          ],
        }));
      },
      
      getRulesForCard: (cardId) => {
        return get().bonusRules.filter((rule) => rule.cardId === cardId);
      },
      
      getActiveRuleForCard: (cardId) => {
        return get().bonusRules.find((rule) => rule.cardId === cardId && rule.isActive) || null;
      },
      
      calculateBonusProgress: (cardId, transactions, period) => {
        const rule = get().getActiveRuleForCard(cardId);
        if (!rule) return null;
        
        // Determine period (default to current month)
        const targetPeriod = period || format(new Date(), 'yyyy-MM');
        const [year, month] = targetPeriod.split('-').map(Number);
        const periodStart = startOfMonth(new Date(year, month - 1));
        const periodEnd = endOfMonth(new Date(year, month - 1));
        
        // Filter transactions for this period
        const periodTransactions = transactions.filter(t => {
          const txDate = parseISO(t.date);
          return isWithinInterval(txDate, { start: periodStart, end: periodEnd });
        });
        
        // Calculate spending
        let totalSpend = 0;
        let qualifyingSpend = 0;
        let nonQualifyingSpend = 0;
        const merchantsUsed = new Set<string>();
        
        periodTransactions.forEach(tx => {
          // Skip payments if configured
          if (rule.excludePayments && tx.isPayment) return;
          if (tx.isPayment) return; // Always skip payments for bonus calculations
          
          totalSpend += tx.amount;
          
          // Check if transaction qualifies
          const matchesMerchantRule = rule.qualifyingMerchants.length === 0 || 
            matchesMerchant(tx.description, rule.qualifyingMerchants, rule.merchantMatchMode);
          
          const matchesCategoryRule = !rule.qualifyingCategories || 
            rule.qualifyingCategories.length === 0 ||
            rule.qualifyingCategories.includes(tx.category as any);
          
          const hasExclusion = hasExcludedKeyword(tx.description, rule.excludeKeywords);
          
          if (matchesMerchantRule && matchesCategoryRule && !hasExclusion) {
            qualifyingSpend += tx.amount;
            
            // Track merchant
            const merchantName = extractMerchantName(tx.description, rule.qualifyingMerchants, rule.merchantMatchMode);
            if (merchantName) {
              merchantsUsed.add(merchantName);
            }
          } else {
            nonQualifyingSpend += tx.amount;
          }
        });
        
        // Calculate status
        const minSpend = rule.minSpend || 0;
        const maxBonusSpend = rule.maxBonusSpend || Infinity;
        const minMerchantCount = rule.minMerchantCount || 0;
        
        const minSpendMet = totalSpend >= minSpend;
        const bonusCapReached = qualifyingSpend >= maxBonusSpend;
        const merchantRequirementMet = merchantsUsed.size >= minMerchantCount;
        
        const remainingToMinimum = Math.max(0, minSpend - totalSpend);
        const remainingToCap = Math.max(0, maxBonusSpend - qualifyingSpend);
        
        // Determine overall status
        let status: BonusStatus = 'inactive';
        if (!rule.isActive) {
          status = 'inactive';
        } else if (!minSpendMet) {
          status = 'below_minimum';
        } else if (qualifyingSpend > maxBonusSpend) {
          status = 'over_cap';
        } else if (qualifyingSpend >= maxBonusSpend * 0.98) {
          status = 'at_cap';
        } else {
          status = 'in_sweet_spot';
        }
        
        // Calculate estimated bonus
        const effectiveQualifyingSpend = Math.min(qualifyingSpend, maxBonusSpend);
        const estimatedBonus = minSpendMet && merchantRequirementMet
          ? effectiveQualifyingSpend * rule.bonusRate
          : 0;
        
        // Calculate estimated miles - prefer direct milesPerDollar if available
        let estimatedMiles: number | undefined;
        if (minSpendMet && merchantRequirementMet) {
          if (rule.milesPerDollar) {
            // Direct calculation: $1 = X miles
            estimatedMiles = effectiveQualifyingSpend * rule.milesPerDollar;
          } else if (rule.pointsToMilesRatio) {
            // Indirect calculation through points
            estimatedMiles = estimatedBonus / rule.pointsToMilesRatio;
          }
        }
        
        // Generate recommendations
        const recommendations: string[] = [];
        
        if (!minSpendMet) {
          recommendations.push(`Spend $${remainingToMinimum.toFixed(2)} more to hit minimum requirement`);
        }
        
        if (!merchantRequirementMet && minMerchantCount > 0) {
          const remaining = minMerchantCount - merchantsUsed.size;
          recommendations.push(`Use ${remaining} more qualifying merchant${remaining > 1 ? 's' : ''}`);
        }
        
        if (minSpendMet && merchantRequirementMet && remainingToCap > 0 && remainingToCap < 100) {
          recommendations.push(`Only $${remainingToCap.toFixed(2)} left before hitting bonus cap`);
        }
        
        if (status === 'in_sweet_spot' && remainingToCap > 0) {
          recommendations.push(`You can spend $${remainingToCap.toFixed(2)} more at qualifying merchants`);
        }
        
        if (status === 'over_cap') {
          const overspend = qualifyingSpend - maxBonusSpend;
          recommendations.push(`You've exceeded the cap by $${overspend.toFixed(2)} - bonus is maxed`);
        }
        
        return {
          cardId,
          period: targetPeriod,
          totalSpend,
          qualifyingSpend,
          nonQualifyingSpend,
          merchantsUsed: Array.from(merchantsUsed),
          merchantCount: merchantsUsed.size,
          minSpendMet,
          bonusCapReached,
          merchantRequirementMet,
          remainingToMinimum,
          remainingToCap,
          estimatedBonus,
          estimatedMiles,
          status,
          recommendations,
        };
      },
    }),
    {
      name: 'cardflow-bonus-storage',
    }
  )
);

