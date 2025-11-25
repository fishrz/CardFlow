import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useThemeStore } from '../store/useThemeStore';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  color: 'purple' | 'emerald' | 'cyan' | 'rose' | 'amber';
  showProgress?: boolean;
  progress?: number;
}

const colorClasses = {
  purple: {
    icon: 'bg-violet-500/20 text-violet-400',
    iconLight: 'bg-violet-100 text-violet-600',
    glow: 'shadow-violet-500/10',
    progress: 'from-violet-500 to-purple-500',
  },
  emerald: {
    icon: 'bg-emerald-500/20 text-emerald-400',
    iconLight: 'bg-emerald-100 text-emerald-600',
    glow: 'shadow-emerald-500/10',
    progress: 'from-emerald-500 to-teal-500',
  },
  cyan: {
    icon: 'bg-cyan-500/20 text-cyan-400',
    iconLight: 'bg-cyan-100 text-cyan-600',
    glow: 'shadow-cyan-500/10',
    progress: 'from-cyan-500 to-blue-500',
  },
  rose: {
    icon: 'bg-rose-500/20 text-rose-400',
    iconLight: 'bg-rose-100 text-rose-600',
    glow: 'shadow-rose-500/10',
    progress: 'from-rose-500 to-pink-500',
  },
  amber: {
    icon: 'bg-amber-500/20 text-amber-400',
    iconLight: 'bg-amber-100 text-amber-600',
    glow: 'shadow-amber-500/10',
    progress: 'from-amber-500 to-orange-500',
  },
};

export default function StatsCard({ title, value, subtitle, icon, color, showProgress, progress = 0 }: StatsCardProps) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass-card rounded-3xl p-6 hover:shadow-lg ${colors.glow} transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLight ? colors.iconLight : colors.icon}`}>
          {icon}
        </div>
      </div>
      
      <div>
        <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{title}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{subtitle}</p>
      </div>

      {showProgress && (
        <div className="mt-4">
          <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/5'}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${colors.progress} rounded-full`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
