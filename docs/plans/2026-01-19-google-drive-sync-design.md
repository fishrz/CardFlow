# Google Drive Sync Design

> **Date:** 2026-01-19  
> **Status:** Approved  
> **Goal:** Enable automatic data sync to Google Drive for backup and cross-device access

---

## Overview

Add Google Drive integration to Swipe so users can:
1. Never lose data (auto-backup to their own Drive)
2. Access data from any device (phone, other computers)
3. Continue using offline (sync when back online)

---

## Architecture

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│   Zustand Store │────▶│  localStorage   │
│   (UI Layer)    │     │   (State Mgmt)  │     │  (Local Cache)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼ (debounced 2s)
                        ┌─────────────────┐
                        │  Google Drive   │
                        │  Sync Service   │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Google Drive   │
                        │  (Cloud File)   │
                        └─────────────────┘
```

### File Structure in Google Drive

```
My Drive/
└── Swipe/
    └── cardflow-data.json
```

### Data Format (swipe-data.json)

```json
{
  "version": "2.0",
  "lastModified": "2026-01-19T12:00:00.000Z",
  "data": {
    "cards": [...],
    "transactions": [...],
    "bonusRules": [...],
    "settings": { "theme": "dark" }
  }
}
```

---

## Implementation Plan

### Phase 1: Google OAuth Setup
1. Create Google Cloud project
2. Enable Drive API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add environment variables to project

### Phase 2: Auth Service
- `src/services/googleAuth.ts`
  - `signIn()` - Trigger Google OAuth flow
  - `signOut()` - Revoke access
  - `getAccessToken()` - Get current token
  - `isAuthenticated()` - Check auth status
  - `onAuthStateChange(callback)` - Listen for auth changes

### Phase 3: Drive Sync Service  
- `src/services/driveSync.ts`
  - `initSync()` - Initialize sync on app start
  - `saveToCloud(data)` - Upload data to Drive
  - `loadFromCloud()` - Download data from Drive
  - `getSyncStatus()` - Get last sync time, status

### Phase 4: Sync Store
- `src/store/useSyncStore.ts`
  - Track: `isConnected`, `lastSyncTime`, `syncStatus`, `error`
  - Auto-sync on data changes (debounced)
  - Handle offline/online transitions

### Phase 5: UI Components
- `src/components/GoogleSignIn.tsx` - Sign in button
- `src/components/SyncStatus.tsx` - Sync indicator in header
- Update `SettingsPanel.tsx` - Add Google Drive section

---

## Sync Strategy

### On App Start
1. Check if user is authenticated with Google
2. If yes: Load from Drive, merge with localStorage (newest wins)
3. If no: Use localStorage only, show "Connect Google Drive" prompt

### On Data Change
1. Save to localStorage immediately
2. Debounce 2 seconds, then save to Drive
3. Update `lastSyncTime` on success

### Conflict Resolution
- Simple strategy: **Last-write-wins** based on `lastModified` timestamp
- Future enhancement: Per-record merging (not needed for MVP)

### Offline Support
1. Detect offline status with `navigator.onLine`
2. Queue changes in localStorage
3. When back online, sync to Drive
4. Show "Offline" indicator in UI

---

## Security Considerations

1. **OAuth Scopes**: Request only `drive.appdata` or `drive.file` (minimal access)
2. **Token Storage**: Store in memory only, refresh as needed
3. **Data Privacy**: File stored in user's own Drive, we never see it
4. **HTTPS Only**: Vercel provides automatic HTTPS

---

## Dependencies

```json
{
  "@react-oauth/google": "^0.12.1",
  "gapi-script": "^1.2.0"
}
```

Alternative (simpler): Use Google Identity Services directly without extra packages.

---

## Environment Variables

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key (optional, for public API access)
```

---

## UI/UX Design

### Header Sync Indicator
```
[Cloud icon] Synced • 2 min ago    (when synced)
[Cloud icon] Syncing...           (when syncing)
[Cloud icon] Offline              (when offline)
[Cloud icon] Connect Drive        (when not connected)
```

### Settings Panel - New Section
```
┌─────────────────────────────────────┐
│ ☁️ CLOUD SYNC                       │
├─────────────────────────────────────┤
│ Google Drive    [Connected ✓]      │
│ user@gmail.com                      │
│ Last synced: 2 minutes ago          │
│                                     │
│ [Sync Now]  [Disconnect]            │
└─────────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Sign in with Google
- [ ] First sync creates file in Drive
- [ ] Adding card syncs to Drive
- [ ] Refresh page loads from Drive
- [ ] Offline mode works
- [ ] Coming back online syncs
- [ ] Sign out clears connection
- [ ] Works on mobile browser

---

## Rollout Plan

1. Implement locally and test
2. Deploy to Vercel (staging)
3. Test on phone
4. Add to production

---

## Future Enhancements (Not in MVP)

- Auto-backup versioning (keep last 5 versions)
- Sync conflict UI (show diff, let user choose)
- Shared household access
- PWA with push notifications
