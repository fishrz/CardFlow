import { addDays, getDate, setDate, startOfDay } from 'date-fns';
import { CreditCard, Transaction } from '@/types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Get the current statement period for a card
export const getCardStatus = (card: CreditCard) => {
  const today = startOfDay(new Date());
  const currentDay = getDate(today);

  // Determine current statement date
  // If today is before statement date, the current statement started last month
  // If today is after statement date, the current statement started this month
  let lastStatementDate = setDate(today, card.statementDate);
  if (currentDay < card.statementDate) {
    // Go back to previous month
    lastStatementDate = setDate(new Date(today.getFullYear(), today.getMonth() - 1, 1), card.statementDate);
  }

  const dueDate = addDays(lastStatementDate, card.paymentDueDays || 20);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status: 'good' | 'warning' | 'danger' = 'good';
  if (daysUntilDue < 0) status = 'danger';
  else if (daysUntilDue <= 5) status = 'warning';

  return {
    lastStatementDate,
    dueDate,
    daysUntilDue,
    status
  };
};

export const getCardBalance = (cardId: string, transactions: Transaction[]) => {
  // Simple calculation: Sum of all unpaid transactions for this card
  return transactions
    .filter(t => t.cardId === cardId && !t.isPaid)
    .reduce((sum, t) => sum + t.amount, 0);
};

