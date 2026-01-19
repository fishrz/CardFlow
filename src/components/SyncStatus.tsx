import { motion } from 'framer-motion';
import { 
  Cloud, CloudOff, Check, AlertCircle, 
  CloudCog, Loader2 
} from 'lucide-react';
import { useSyncStore } from '../store/useSyncStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusProps {
  onClick?: () => void;
}

export default function SyncStatus({ onClick }: SyncStatusProps) {
  const { 
    isConfigured, 
    isConnected, 
    syncStatus, 
    lastSyncTime, 
    isOnline,
    user,
  } = useSyncStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  // Don't show if Google Drive is not configured
  if (!isConfigured) {
    return null;
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: CloudOff,
        text: 'Offline',
        color: isLight ? 'text-slate-500' : 'text-zinc-500',
        bgColor: isLight ? 'bg-slate-100' : 'bg-white/5',
        animate: false,
      };
    }

    if (!isConnected) {
      return {
        icon: CloudCog,
        text: 'Connect Drive',
        color: isLight ? 'text-blue-600' : 'text-blue-400',
        bgColor: isLight ? 'bg-blue-50 hover:bg-blue-100' : 'bg-blue-500/10 hover:bg-blue-500/20',
        animate: false,
        clickable: true,
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: Loader2,
          text: 'Syncing...',
          color: isLight ? 'text-blue-600' : 'text-blue-400',
          bgColor: isLight ? 'bg-blue-50' : 'bg-blue-500/10',
          animate: true,
        };
      case 'success':
        return {
          icon: Check,
          text: 'Synced',
          color: isLight ? 'text-emerald-600' : 'text-emerald-400',
          bgColor: isLight ? 'bg-emerald-50' : 'bg-emerald-500/10',
          animate: false,
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Sync failed',
          color: isLight ? 'text-red-600' : 'text-red-400',
          bgColor: isLight ? 'bg-red-50' : 'bg-red-500/10',
          animate: false,
        };
      case 'offline':
        return {
          icon: CloudOff,
          text: 'Offline',
          color: isLight ? 'text-slate-500' : 'text-zinc-500',
          bgColor: isLight ? 'bg-slate-100' : 'bg-white/5',
          animate: false,
        };
      default: // idle
        return {
          icon: Cloud,
          text: lastSyncTime 
            ? formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })
            : 'Connected',
          color: isLight ? 'text-slate-600' : 'text-zinc-400',
          bgColor: isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/5 hover:bg-white/10',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${config.bgColor} ${config.color}`}
      title={user ? `Synced to ${user.email}` : 'Click to connect Google Drive'}
    >
      <Icon 
        className={`w-4 h-4 ${config.animate ? 'animate-spin' : ''}`} 
      />
      <span className="hidden sm:inline">{config.text}</span>
      
      {/* User avatar when connected */}
      {isConnected && user?.picture && (
        <img 
          src={user.picture} 
          alt={user.name}
          className="w-5 h-5 rounded-full ml-1"
        />
      )}
    </motion.button>
  );
}
