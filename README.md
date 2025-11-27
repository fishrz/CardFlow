# 💳 CardFlow

A beautifully crafted credit card tracker designed for the future. Manage multiple credit cards, track due dates, optimize rewards, and gain insights into your spending — all in one stunning interface.

![CardFlow](https://img.shields.io/badge/React-18.2-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3.3-06B6D4?logo=tailwindcss) ![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)

## ✨ Features

### ⚡ Quick Log Command Bar (⌘K)
- **Speed-first logging** — Type "lunch 25 dbs" and log in 2 seconds
- **Natural language parsing** — Understands "pay 500 ocbc" as a payment
- **Smart card matching** — Fuzzy search finds your cards by bank name or last 4 digits
- **Auto-categorization** — Detects categories from keywords (food, transport, shopping, etc.)
- **Quick actions** — Access insights, card selector, and urgent payments instantly

### 📊 Monthly Insights Dashboard
- **Spending breakdown** — See where your money goes by category and card
- **Month-over-month trends** — Track if spending is increasing or decreasing
- **Beautiful visualizations** — Animated progress bars and charts
- **Daily averages** — Know your spending patterns at a glance
- **Smart insights** — AI-generated summary of your monthly spending story

### 🎯 Smart Card Selector
- **Best card recommendations** — Know which card to use for each purchase
- **Category-based rewards** — See reward rates across all cards for any category
- **Savings calculator** — See exactly how much you save using the right card
- **Side-by-side comparison** — All cards ranked by reward rate

### ⏰ Due Date Intelligence
- **Smart urgency levels** — Critical (≤3 days), Warning (≤7 days), On Track
- **Cost of missing payment** — See estimated interest and lost rewards
- **One-click payment** — Record full balance payment instantly
- **Calendar integration** — Export reminders (coming soon)
- **Pro tips** — GIRO setup and credit score advice

### 💸 Annual Fee Tracker
- **Fee ROI analysis** — Is each card earning more than its annual fee?
- **Renewal alerts** — Know when fees are coming up
- **Actionable suggestions** — Keep, waive, or cancel recommendations
- **Singapore-specific** — Pre-loaded with local bank fee estimates
- **Fee waiver tips** — How to negotiate with banks

### 🎯 Bonus Tracker (NEW!)
- **Card bonus rule tracking** — Track spending requirements and bonus caps
- **DBS Yuu Card support** — Pre-configured with 18% rebate rules and merchant tracking
- **Minimum spend monitoring** — Know how much more to spend to qualify
- **Merchant count tracking** — Track unique qualifying merchants (e.g., 4+ yuu merchants)
- **Real-time progress** — Visual progress bars with status indicators (Below Min, In Zone, Maxed)
- **Smart recommendations** — Tips on optimizing bonus earnings
- **Miles conversion** — See estimated KrisFlyer miles from yuu points
- **More card profiles** — OCBC 365, UOB One pre-configured

### ⚙️ Settings & Data Vault (NEW!)
- **Export to JSON** — Backup all cards, transactions, and bonus rules
- **Import from JSON** — Restore from any CardFlow backup file
- **Privacy stats** — See counts of cards, transactions, and rules
- **Clear all data** — Start fresh with confirmation safety
- **Theme preferences** — Switch between dark and light mode

### 💳 Beautiful Card Management
- **8 stunning gradient themes** — Purple, Blue, Emerald, Rose, Orange, Cyan, Slate, Amber
- **Live card preview** — See changes in real-time as you fill the form
- **Singapore bank presets** — DBS, OCBC, UOB, Citibank, HSBC, Standard Chartered, Maybank, CIMB, Bank of China, AMEX
- **Customizable dates** — Set due date and statement date for each card

### 💰 Transaction Tracking
- **Expense vs Payment** — Toggle between recording spending and payments
- **Pay Full Balance** — One-click to fill the full outstanding amount
- **10 categories** — Food, Transport, Shopping, Entertainment, Utilities, Healthcare, Travel, Education, Subscriptions, Other
- **Modern date picker** — Futuristic calendar with smooth animations
- **Auto-balance updates** — Card balance updates automatically

### 🌓 Dark & Light Theme
- **Animated theme toggle** — Smooth moon/sun transition with spring physics
- **Persistent preference** — Your choice is saved and restored automatically
- **Full theme support** — Every component adapts beautifully to both modes

### 🎨 Premium Design Language
- **Glassmorphism** — Frosted glass effect with subtle blur
- **Gradient mesh backgrounds** — Atmospheric depth with soft color gradients
- **Spring physics animations** — Everything feels alive and responsive
- **Micro-interactions** — Hover states, button feedback, and smooth transitions

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + K` | Open Quick Log Command Bar |
| `⌘/Ctrl + I` | Open Monthly Insights |
| `⌘/Ctrl + S` | Open Smart Card Selector |
| `Esc` | Close any modal |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Then open **http://localhost:3000** in your browser.

## 🛡️ Privacy First

**All data stays on your device.** CardFlow uses browser localStorage for persistence — no servers, no accounts, no tracking. Your financial data never leaves your computer.

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite 5** | Build Tool & Dev Server |
| **Tailwind CSS** | Utility-first Styling |
| **Framer Motion** | Animations |
| **Zustand** | State Management |
| **date-fns** | Date Utilities |
| **Lucide React** | Icons |
| **React Hot Toast** | Notifications |

## 📱 Responsive Design

CardFlow is fully responsive and works beautifully on:
- 🖥️ Desktop (optimized for wide screens)
- 💻 Laptop
- 📱 Mobile (with floating action button for Quick Log)

## 🎯 Use Cases

Perfect for anyone who:
- Has **multiple credit cards** from different banks
- Wants to **never miss a payment** due date
- Wants to **maximize rewards** by using the right card
- Needs a **simple way to track** spending across cards
- Prefers **beautiful tools** over boring spreadsheets
- Values **privacy** and keeping data local

## 📋 Product Roadmap

See [docs/PRODUCT_STRATEGY.md](docs/PRODUCT_STRATEGY.md) for the full product strategy, including:
- Competitive analysis
- Feature prioritization
- Future roadmap (Statement Scanner with AI, etc.)

## 📝 License

MIT © 2025

---

<p align="center">
  <strong>Built with ❤️ for people who appreciate beautiful, functional design.</strong>
</p>
