import { create } from 'zustand';
import { 
  initGoogleAuth, 
  signIn as googleSignIn, 
  signOut as googleSignOut,
  onAuthStateChange,
  isConfigured,
  GoogleUserInfo,
} from '../services/googleAuth';
import { 
  initSync, 
  saveToCloud, 
  loadFromCloud, 
  resetSyncCache,
  SyncData,
  SyncStatus,
} from '../services/driveSync';
import { useStore } from './useStore';
import { useBonusStore } from './useBonusStore';
import { useThemeStore } from './useThemeStore';

const SYNC_VERSION = '2.0';
const DEBOUNCE_MS = 2000;

interface SyncState {
  // Connection state
  isConfigured: boolean;
  isConnected: boolean;
  user: GoogleUserInfo | null;
  
  // Sync state
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  error: string | null;
  
  // Online status
  isOnline: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  syncNow: () => Promise<void>;
  
  // Internal
  _scheduleSync: () => void;
  _performSync: () => Promise<void>;
}

// Debounce timer
let syncTimer: ReturnType<typeof setTimeout> | null = null;

export const useSyncStore = create<SyncState>((set, get) => ({
  isConfigured: false,
  isConnected: false,
  user: null,
  syncStatus: 'idle',
  lastSyncTime: localStorage.getItem('cardflow-last-sync'),
  error: null,
  isOnline: navigator.onLine,
  
  /**
   * Initialize the sync system
   * Should be called once when app starts
   */
  initialize: async () => {
    // Check if Google Auth is configured
    const configured = isConfigured();
    set({ isConfigured: configured });
    
    if (!configured) {
      console.log('Google Drive sync not configured (missing VITE_GOOGLE_CLIENT_ID)');
      return;
    }
    
    try {
      // Initialize Google Auth
      await initGoogleAuth();
      
      // Listen for auth changes
      onAuthStateChange(async (isAuth, user) => {
        set({ isConnected: isAuth, user });
        
        if (isAuth) {
          // Initialize Drive sync
          const initialized = await initSync();
          if (initialized) {
            // Load cloud data on connect
            await get().syncNow();
          }
        } else {
          resetSyncCache();
        }
      });
      
      // Listen for online/offline
      window.addEventListener('online', () => {
        set({ isOnline: true });
        // Sync when back online
        if (get().isConnected) {
          get()._scheduleSync();
        }
      });
      
      window.addEventListener('offline', () => {
        set({ isOnline: false, syncStatus: 'offline' });
      });
      
      // Subscribe to store changes for auto-sync
      useStore.subscribe(() => {
        if (get().isConnected && get().isOnline) {
          get()._scheduleSync();
        }
      });
      
      useBonusStore.subscribe(() => {
        if (get().isConnected && get().isOnline) {
          get()._scheduleSync();
        }
      });
      
      useThemeStore.subscribe(() => {
        if (get().isConnected && get().isOnline) {
          get()._scheduleSync();
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize sync:', error);
      set({ error: 'Failed to initialize Google Auth' });
    }
  },
  
  /**
   * Connect to Google Drive
   */
  connect: async () => {
    set({ syncStatus: 'syncing', error: null });
    
    try {
      const user = await googleSignIn();
      set({ isConnected: true, user });
      
      // Initialize and sync
      await initSync();
      await get().syncNow();
      
    } catch (error) {
      console.error('Failed to connect:', error);
      set({ 
        syncStatus: 'error', 
        error: error instanceof Error ? error.message : 'Failed to connect' 
      });
    }
  },
  
  /**
   * Disconnect from Google Drive
   */
  disconnect: () => {
    googleSignOut();
    resetSyncCache();
    set({ 
      isConnected: false, 
      user: null, 
      syncStatus: 'idle',
      lastSyncTime: null,
      error: null,
    });
    localStorage.removeItem('cardflow-last-sync');
  },
  
  /**
   * Perform sync immediately
   */
  syncNow: async () => {
    if (!get().isConnected) return;
    if (!get().isOnline) {
      set({ syncStatus: 'offline' });
      return;
    }
    
    set({ syncStatus: 'syncing', error: null });
    
    try {
      // Load from cloud
      const cloudData = await loadFromCloud();
      
      // Get local data
      const localData = getLocalData();
      
      // Merge strategy: use cloud if newer, otherwise use local
      if (cloudData) {
        const cloudTime = new Date(cloudData.lastModified).getTime();
        const localTime = new Date(localData.lastModified).getTime();
        
        if (cloudTime > localTime) {
          // Cloud is newer, update local
          applyCloudData(cloudData);
        } else if (localTime > cloudTime) {
          // Local is newer, update cloud
          await saveToCloud(localData);
        }
        // If same, no action needed
      } else {
        // No cloud data, upload local
        await saveToCloud(localData);
      }
      
      const now = new Date().toISOString();
      set({ syncStatus: 'success', lastSyncTime: now });
      localStorage.setItem('cardflow-last-sync', now);
      
      // Reset to idle after a moment
      setTimeout(() => {
        if (get().syncStatus === 'success') {
          set({ syncStatus: 'idle' });
        }
      }, 2000);
      
    } catch (error) {
      console.error('Sync failed:', error);
      const message = error instanceof Error ? error.message : 'Sync failed';
      
      if (message === 'Offline') {
        set({ syncStatus: 'offline' });
      } else {
        set({ syncStatus: 'error', error: message });
      }
    }
  },
  
  /**
   * Schedule a debounced sync
   */
  _scheduleSync: () => {
    if (syncTimer) {
      clearTimeout(syncTimer);
    }
    
    syncTimer = setTimeout(() => {
      get()._performSync();
    }, DEBOUNCE_MS);
  },
  
  /**
   * Perform the actual sync (internal)
   */
  _performSync: async () => {
    if (!get().isConnected || !get().isOnline) return;
    
    set({ syncStatus: 'syncing' });
    
    try {
      const localData = getLocalData();
      await saveToCloud(localData);
      
      const now = new Date().toISOString();
      set({ syncStatus: 'success', lastSyncTime: now });
      localStorage.setItem('cardflow-last-sync', now);
      
      setTimeout(() => {
        if (get().syncStatus === 'success') {
          set({ syncStatus: 'idle' });
        }
      }, 2000);
      
    } catch (error) {
      console.error('Auto-sync failed:', error);
      set({ 
        syncStatus: 'error', 
        error: error instanceof Error ? error.message : 'Sync failed' 
      });
    }
  },
}));

/**
 * Get current local data in sync format
 */
function getLocalData(): SyncData {
  const { cards, transactions } = useStore.getState();
  const { bonusRules } = useBonusStore.getState();
  const { theme } = useThemeStore.getState();
  
  return {
    version: SYNC_VERSION,
    lastModified: new Date().toISOString(),
    data: {
      cards,
      transactions,
      bonusRules,
      settings: { theme },
    },
  };
}

/**
 * Apply cloud data to local stores
 */
function applyCloudData(cloudData: SyncData): void {
  const { cards, transactions, bonusRules, settings } = cloudData.data;
  
  // Clear and repopulate cards using Zustand's setState
  useStore.setState({ 
    cards: cards as any[], 
    transactions: transactions as any[] 
  });
  
  useBonusStore.setState({ 
    bonusRules: bonusRules as any[] 
  });
  
  if (settings?.theme) {
    useThemeStore.getState().setTheme(settings.theme);
  }
}
