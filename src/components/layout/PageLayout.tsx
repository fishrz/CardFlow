import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Smartphone, Monitor } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
  const { layoutMode, setLayoutMode } = useStore();

  // Phone Mode Layout
  if (layoutMode === 'phone') {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 md:p-8">
        {/* Layout Toggle - Fixed Top Right */}
        <LayoutToggle mode={layoutMode} onToggle={setLayoutMode} />

        {/* Desktop Frame/Container */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "w-full max-w-md h-screen md:h-[850px] bg-surface-ground relative overflow-hidden md:rounded-[3rem] md:shadow-2xl md:border-8 md:border-gray-900",
                "flex flex-col",
                className
            )}
        >
             {/* Dynamic Island / Notch for desktop feel */}
             <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-50 pointer-events-none" />

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
                {children}
            </div>

            {/* Bottom fade for scrolling */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-ground to-transparent pointer-events-none z-10 md:rounded-b-[2.5rem]" />
        </motion.div>
      </div>
    );
  }

  // Desktop Mode Layout (Full Width)
  return (
    <div className="min-h-screen w-full bg-surface-ground">
      {/* Layout Toggle - Fixed Top Right */}
      <LayoutToggle mode={layoutMode} onToggle={setLayoutMode} />

      <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
              "w-full max-w-6xl mx-auto min-h-screen relative",
              "flex flex-col",
              className
          )}
      >
          {/* Scrollable Content Area */}
          <div className="flex-1 pb-24">
              {children}
          </div>
      </motion.div>
    </div>
  );
};

// Layout Toggle Component
const LayoutToggle: React.FC<{ mode: 'phone' | 'desktop', onToggle: (mode: 'phone' | 'desktop') => void }> = ({ mode, onToggle }) => {
  return (
    <div className="fixed top-4 right-4 z-[200] flex items-center gap-1 bg-white/80 backdrop-blur-lg rounded-full p-1 shadow-lg border border-gray-200">
      <button
        onClick={() => onToggle('desktop')}
        className={cn(
          "p-2 rounded-full transition-all",
          mode === 'desktop' ? "bg-brand-blue text-white" : "text-gray-500 hover:bg-gray-100"
        )}
        title="Desktop Mode"
      >
        <Monitor size={18} />
      </button>
      <button
        onClick={() => onToggle('phone')}
        className={cn(
          "p-2 rounded-full transition-all",
          mode === 'phone' ? "bg-brand-blue text-white" : "text-gray-500 hover:bg-gray-100"
        )}
        title="Phone Preview Mode"
      >
        <Smartphone size={18} />
      </button>
    </div>
  );
};
