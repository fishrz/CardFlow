import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export const ViewToggle: React.FC = () => {
  const { isDesktopMode, toggleViewMode } = useStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleViewMode}
      className="fixed top-4 right-4 z-[200] p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-full border border-white/20 text-text-secondary hover:text-brand-blue transition-colors"
      title={isDesktopMode ? "Switch to Mobile View" : "Switch to Desktop View"}
    >
      {isDesktopMode ? <Smartphone size={20} /> : <Monitor size={20} />}
    </motion.button>
  );
};

