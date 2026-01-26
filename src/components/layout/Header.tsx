import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

export const Header: React.FC = () => {
  const { layoutMode } = useStore();
  const isDesktop = layoutMode === 'desktop';

  return (
    <header className={`pt-8 pb-4 ${isDesktop ? 'px-6 lg:px-8' : 'px-6'}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <p className="text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider">My Wallet</p>
          <h1 className={`font-bold text-text-primary tracking-tight ${isDesktop ? 'text-4xl' : 'text-3xl'}`}>
            Credit<span className="text-brand-blue">Flow</span>
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-xs">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
        </div>
      </motion.div>
    </header>
  );
};
