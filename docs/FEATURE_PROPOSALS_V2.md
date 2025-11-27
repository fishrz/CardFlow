# 🚀 CardFlow v2.0 Feature Proposals

> **Version:** 2.0  
> **Date:** November 2025  
> **Status:** In Development

---

## 📋 Executive Summary

Based on user pain points with complex credit card bonus structures (e.g., DBS Yuu Card), we're introducing three major feature sets:

1. **Bonus Tracker** - Track card-specific spending rules and bonus progress
2. **Card Library** - Pre-configured profiles for popular Singapore cards
3. **Data Vault** - Export/Import functionality for data portability

---

## 🎯 Pain Point Analysis

### The DBS Yuu Card Example

Reference: [MileLion DBS Yuu Card Review](https://milelion.com/2025/10/06/review-dbs-yuu-card/)

| Requirement | Details |
|-------------|---------|
| **Minimum Spend** | S$800/month to qualify for bonus |
| **Bonus Cap** | ~S$822.86 of qualifying spend |
| **Merchant Rule** | Must transact at **4+ different yuu merchants** |
| **Qualifying Merchants** | Cold Storage, Giant, Guardian, 7-Eleven, foodpanda, SimplyGo, etc. |
| **Bonus Rate** | 18% rebate at yuu merchants (or 10 mpd for KrisFlyer) |
| **Base Rate** | 5% for all other spending |
| **Exclusions** | Voucher purchases, PandaPro discounts, certain promotions |

### User Pain Points

1. **Manual Tracking Hell** - Users must manually calculate qualifying transactions
2. **Fear of Over-spending** - Exceeding cap wastes potential bonus elsewhere
3. **Multi-Merchant Confusion** - Must remember to use 4+ different merchants
4. **T&C Complexity** - Rules are buried in dense legal documents

---

## 🛠️ Feature 1: Bonus Tracker

### Overview

A real-time tracking system that monitors spending against card-specific bonus rules.

### Data Structure

```typescript
// Card Bonus Rule - Defines a single rule for a card
interface CardBonusRule {
  id: string;
  cardId: string;
  name: string;
  description?: string;
  isActive: boolean;
  
  // Rule Type
  type: 'minimum_spend' | 'bonus_cap' | 'merchant_count' | 'category_bonus';
  
  // Thresholds
  minSpend?: number;              // Minimum to qualify (e.g., 800)
  maxBonusSpend?: number;         // Cap on bonus-earning spend (e.g., 822.86)
  minMerchantCount?: number;      // Required unique merchants (e.g., 4)
  
  // Merchant Matching
  qualifyingMerchants: string[];  // Merchant names that qualify
  merchantMatchMode: 'exact' | 'contains' | 'regex';
  
  // Category Matching
  qualifyingCategories?: TransactionCategory[];
  
  // Exclusions
  excludeKeywords?: string[];     // e.g., ["voucher", "gift card"]
  excludePayments?: boolean;      // Exclude card payments
  
  // Reward Calculation
  bonusRate: number;              // e.g., 0.18 for 18%
  baseRate: number;               // e.g., 0.05 for 5%
  rewardUnit: 'cashback' | 'points' | 'miles';
  pointsToMilesRatio?: number;    // e.g., 360 yuu points = 100 miles
}

// Bonus Progress - Calculated state for a card
interface BonusProgress {
  cardId: string;
  period: string;                 // "2025-11" (YYYY-MM)
  
  // Spending Totals
  totalSpend: number;             // All card spending
  qualifyingSpend: number;        // Only bonus-eligible spend
  nonQualifyingSpend: number;     // Spend that doesn't count
  
  // Merchant Tracking
  merchantsUsed: string[];        // Unique qualifying merchants
  merchantCount: number;
  
  // Status
  minSpendMet: boolean;
  bonusCapReached: boolean;
  merchantRequirementMet: boolean;
  
  // Recommendations
  remainingToMinimum: number;     // $ needed to hit minimum
  remainingToCapSpend: number;         // $ before hitting cap
  
  // Estimated Rewards
  estimatedBonus: number;
  estimatedMiles?: number;
  
  // Overall Status
  status: 'inactive' | 'below_minimum' | 'in_sweet_spot' | 'at_cap' | 'over_cap';
}
```

### User Interface

**Bonus Progress Widget** (Dashboard Component):
- Visual progress bar (0% → 100% of cap)
- Traffic light indicators (✅ ⚠️ ❌)
- Merchant count tracker
- Smart recommendations
- Estimated rewards calculator

---

## 🛠️ Feature 2: Card Library

### Overview

Pre-configured card profiles with bonus rules, eliminating manual setup.

### Data Structure

```typescript
interface CardProfile {
  id: string;
  bankName: string;
  cardName: string;
  
  // Version Control
  version: string;               // "2025-10" - T&Cs change!
  effectiveDate: string;         // When these rules took effect
  lastUpdated: string;
  
  // Sources
  officialTncUrl?: string;
  reviewUrl?: string;
  
  // Pre-configured Rules
  bonusRules: Omit<CardBonusRule, 'id' | 'cardId'>[];
  
  // Card Info
  annualFee: number;
  feeWaiverSpend?: number;
  incomeRequirement?: number;
  
  // Pro Tips
  tips?: string[];
}
```

### Initial Card Profiles (Phase 1)

1. **DBS Yuu Card** (AMEX & Visa)
2. **OCBC 365 Card**
3. **UOB One Card**
4. **Citi Cash Back Card**
5. **HSBC TravelOne Card**
6. **StanChart Journey Card**
7. **AMEX KrisFlyer Card**
8. **Maybank Family & Friends**
9. **CIMB Visa Signature**
10. **Bank of China Family Card**

---

## 🛠️ Feature 3: Data Vault (Export/Import)

### Overview

Allow users to export all data to JSON and import it back, enabling:
- Data backup
- Cross-browser migration
- Device switching
- Data sharing (without sensitive info)

### Data Structure

```typescript
interface CardFlowExport {
  // Metadata
  version: string;               // Export format version
  appVersion: string;            // CardFlow app version
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
  
  // Integrity
  checksum?: string;
}
```

### Security Considerations

- No encryption (user responsibility)
- Clear warning about sensitive data
- Option to exclude transaction descriptions
- Checksum for integrity verification

---

## 📋 Implementation Priority

| Phase | Feature | Status |
|-------|---------|--------|
| **P0** | Export/Import (Data Vault) | 🚧 Building |
| **P0** | Bonus Rules Data Structure | 🚧 Building |
| **P0** | Bonus Progress Widget | 🚧 Building |
| **P1** | Card Profile: DBS Yuu | 📋 Planned |
| **P1** | Card Profile Selector | 📋 Planned |
| **P2** | More Card Profiles | 📋 Planned |
| **P3** | Cloud Sync (Optional) | 💭 Future |

---

## 🎨 UI/UX Mockups

### Dashboard with Bonus Tracker

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Bonus Goals - November 2025                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ DBS Yuu Card                                       IN ZONE  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░  92%             │
│                                                             │
│ ✅ Minimum Spend:  $834 / $800          MET                 │
│ ⚡ Bonus Spend:    $756 / $822.86       $66 remaining       │
│ ✅ Merchants:      5 / 4 required       MET                 │
│                                                             │
│ 💰 Estimated: $136.08 cashback (756 × 18%)                  │
│ ✈️ Or: ~378 KrisFlyer miles                                 │
│                                                             │
│ 💡 Tip: You can spend $66 more at yuu merchants this month  │
│                                                             │
│ [View Transactions] [Edit Rules]                            │
└─────────────────────────────────────────────────────────────┘
```

### Settings Panel with Data Vault

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Settings                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎨 APPEARANCE                                               │
│ Theme: [Dark ▼]                                             │
│                                                             │
│ 💾 DATA MANAGEMENT                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Export Data                                             │ │
│ │ Download all your cards, transactions, and settings     │ │
│ │ [📥 Export to JSON]                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Import Data                                             │ │
│ │ Restore from a CardFlow backup file                     │ │
│ │ [📤 Import from JSON]                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ⚠️ Data is stored locally in your browser.                  │
│    Export regularly to prevent data loss.                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 References

- [DBS Yuu Card T&C PDF](https://www.dbs.com.sg/iwov-resources/media/pdf/cards/promotions/dbs-yuu-cards/dbs-yuu-card-promotion-tncs.pdf)
- [MileLion DBS Yuu Card Review](https://milelion.com/2025/10/06/review-dbs-yuu-card/)
- [Seedly Credit Card Comparison](https://seedly.sg/credit-cards)

---

*Last Updated: November 2025*

