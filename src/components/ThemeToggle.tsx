import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full p-1 transition-colors duration-300 glass-theme"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background track */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: isDark 
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' 
            : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Sliding circle with icon */}
      <motion.div
        className="relative w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
        animate={{
          x: isDark ? 0 : 24,
          background: isDark ? '#312e81' : '#fbbf24',
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          animate={{ rotate: isDark ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-indigo-200" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-700" />
          )}
        </motion.div>
      </motion.div>

      {/* Stars for dark mode */}
      {isDark && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-1.5 right-2 w-1 h-1 bg-white rounded-full"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: 0.1 }}
            className="absolute top-3 right-4 w-0.5 h-0.5 bg-white rounded-full"
          />
        </>
      )}
    </motion.button>
  );
}

