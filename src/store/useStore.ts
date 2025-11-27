import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CreditCard, Transaction, CardStats, UpcomingPayment } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { differenceInDays, setDate, addMonths, isBefore, startOfDay } from 'date-fns';

interface AppState {
  cards: CreditCard[];
  transactions: Transaction[];
  
  // Card actions
  addCard: (card: Omit<CreditCard, 'id' | 'createdAt'>) => void;
  updateCard: (id: string, updates: Partial<CreditCard>) => void;
  deleteCard: (id: string) => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Computed values
  getCardStats: () => CardStats;
  getCardById: (id: string) => CreditCard | undefined;
  getTransactionsByCard: (cardId: string) => Transaction[];
  getUpcomingPayments: () => UpcomingPayment[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cards: [],
      transactions: [],
      
      addCard: (cardData) => {
        const newCard: CreditCard = {
          ...cardData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
      },
      
      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updates } : card
          ),
        }));
      },
      
      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
          transactions: state.transactions.filter((t) => t.cardId !== id),
        }));
      },
      
      addTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          // Update card balance
          const card = state.cards.find((c) => c.id === transactionData.cardId);
          if (card) {
            const balanceChange = transactionData.isPayment 
              ? -transactionData.amount 
              : transactionData.amount;
            
            return {
              transactions: [...state.transactions, newTransaction],
              cards: state.cards.map((c) =>
                c.id === transactionData.cardId
                  ? { ...c, currentBalance: Math.max(0, c.currentBalance + balanceChange) }
                  : c
              ),
            };
          }
          return { transactions: [...state.transactions, newTransaction] };
        });
      },
      
      updateTransaction: (id, updates) => {
        const oldTransaction = get().transactions.find((t) => t.id === id);
        if (!oldTransaction) return;
        
        set((state) => {
          const newTransaction = { ...oldTransaction, ...updates };
          
          // Calculate balance change: reverse old, apply new
          // If amount or isPayment status changed, we need to adjust the balance
          const oldBalanceEffect = oldTransaction.isPayment ? -oldTransaction.amount : oldTransaction.amount;
          const newBalanceEffect = newTransaction.isPayment ? -newTransaction.amount : newTransaction.amount;
          const balanceAdjustment = newBalanceEffect - oldBalanceEffect;
          
          // Handle card change: if cardId changed, update both cards
          const oldCardId = oldTransaction.cardId;
          const newCardId = updates.cardId || oldCardId;
          const cardChanged = oldCardId !== newCardId;
          
          return {
            transactions: state.transactions.map((t) =>
              t.id === id ? newTransaction : t
            ),
            cards: state.cards.map((c) => {
              if (cardChanged) {
                // Remove effect from old card
                if (c.id === oldCardId) {
                  return { ...c, currentBalance: Math.max(0, c.currentBalance - oldBalanceEffect) };
                }
                // Add effect to new card
                if (c.id === newCardId) {
                  return { ...c, currentBalance: Math.max(0, c.currentBalance + newBalanceEffect) };
                }
              } else if (c.id === oldCardId) {
                // Same card, just adjust the balance
                return { ...c, currentBalance: Math.max(0, c.currentBalance + balanceAdjustment) };
              }
              return c;
            }),
          };
        });
      },
      
      deleteTransaction: (id) => {
        const transaction = get().transactions.find((t) => t.id === id);
        if (!transaction) return;
        
        set((state) => {
          // Reverse the balance change
          const balanceChange = transaction.isPayment 
            ? transaction.amount 
            : -transaction.amount;
          
          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            cards: state.cards.map((c) =>
              c.id === transaction.cardId
                ? { ...c, currentBalance: Math.max(0, c.currentBalance + balanceChange) }
                : c
            ),
          };
        });
      },
      
      getCardStats: () => {
        const { cards } = get();
        const totalBalance = cards.reduce((sum, card) => sum + card.currentBalance, 0);
        const totalLimit = cards.reduce((sum, card) => sum + card.creditLimit, 0);
        const utilizationRate = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
        
        return {
          totalBalance,
          totalLimit,
          utilizationRate,
          upcomingPayments: get().getUpcomingPayments(),
        };
      },
      
      getCardById: (id) => {
        return get().cards.find((card) => card.id === id);
      },
      
      getTransactionsByCard: (cardId) => {
        return get().transactions
          .filter((t) => t.cardId === cardId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      getUpcomingPayments: () => {
        const { cards } = get();
        const today = startOfDay(new Date());
        
        return cards
          .map((card) => {
            let dueDate = setDate(today, card.dueDate);
            
            // If due date has passed this month, get next month's due date
            if (isBefore(dueDate, today)) {
              dueDate = addMonths(dueDate, 1);
            }
            
            const daysUntilDue = differenceInDays(dueDate, today);
            
            return {
              card,
              daysUntilDue,
              dueDate,
            };
          })
          .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
      },
    }),
    {
      name: 'cardflow-storage',
    }
  )
);
