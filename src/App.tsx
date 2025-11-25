import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import CardModal from './components/CardModal';
import TransactionModal from './components/TransactionModal';
import CardDetailModal from './components/CardDetailModal';
import { CreditCard } from './types';
import { useThemeStore } from './store/useThemeStore';

export default function App() {
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [preselectedCardId, setPreselectedCardId] = useState<string | null>(null);
  
  const { theme, setTheme } = useThemeStore();
  const isLight = theme === 'light';

  // Initialize theme on mount
  useEffect(() => {
    // Get stored theme or default to dark
    const storedTheme = localStorage.getItem('cardflow-theme');
    if (storedTheme) {
      const parsed = JSON.parse(storedTheme);
      setTheme(parsed.state?.theme || 'dark');
    } else {
      setTheme('dark');
    }
  }, [setTheme]);

  const handleAddCard = () => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleAddTransaction = (cardId?: string) => {
    setPreselectedCardId(cardId || null);
    setIsTransactionModalOpen(true);
  };

  const handleViewCard = (card: CreditCard) => {
    setSelectedCard(card);
  };

  return (
    <div className="min-h-screen bg-mesh transition-colors duration-300">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 30, 40, 0.95)',
            color: isLight ? '#0f172a' : '#fff',
            backdropFilter: 'blur(20px)',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px 24px',
            boxShadow: isLight 
              ? '0 10px 40px rgba(0, 0, 0, 0.1)' 
              : '0 10px 40px rgba(0, 0, 0, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Dashboard
        onAddCard={handleAddCard}
        onEditCard={handleEditCard}
        onAddTransaction={handleAddTransaction}
        onViewCard={handleViewCard}
      />

      <AnimatePresence mode="wait">
        {isCardModalOpen && (
          <CardModal
            card={editingCard}
            onClose={() => {
              setIsCardModalOpen(false);
              setEditingCard(null);
            }}
          />
        )}

        {isTransactionModalOpen && (
          <TransactionModal
            preselectedCardId={preselectedCardId}
            onClose={() => {
              setIsTransactionModalOpen(false);
              setPreselectedCardId(null);
            }}
          />
        )}

        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            onEdit={() => {
              setSelectedCard(null);
              handleEditCard(selectedCard);
            }}
            onAddTransaction={() => {
              handleAddTransaction(selectedCard.id);
              setSelectedCard(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
