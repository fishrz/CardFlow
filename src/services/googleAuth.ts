/**
 * Google Authentication Service
 * Handles OAuth 2.0 flow with Google Identity Services
 */

// Google API configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Token storage (in memory for security)
let accessToken: string | null = null;
let tokenExpiry: number | null = null;
let userInfo: GoogleUserInfo | null = null;

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}

// Auth state change listeners
type AuthCallback = (isAuthenticated: boolean, user: GoogleUserInfo | null) => void;
const authListeners: Set<AuthCallback> = new Set();

/**
 * Initialize Google Identity Services
 * Must be called once when app loads
 */
export async function initGoogleAuth(): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured. Cloud sync disabled.');
    return;
  }

  // Load the Google Identity Services script
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-gsi-script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Check for existing session
      checkExistingSession();
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

/**
 * Check for existing session from localStorage
 */
function checkExistingSession(): void {
  const stored = localStorage.getItem('cardflow-google-auth');
  if (stored) {
    try {
      const { token, expiry, user } = JSON.parse(stored);
      if (expiry && Date.now() < expiry) {
        accessToken = token;
        tokenExpiry = expiry;
        userInfo = user;
        notifyListeners(true, user);
      } else {
        // Token expired, clear it
        localStorage.removeItem('cardflow-google-auth');
      }
    } catch {
      localStorage.removeItem('cardflow-google-auth');
    }
  }
}

/**
 * Sign in with Google
 * Opens OAuth popup and requests Drive access
 */
export function signIn(): Promise<GoogleUserInfo> {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('Google Client ID not configured'));
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        accessToken = response.access_token || null;
        // Token expires in 1 hour typically
        tokenExpiry = Date.now() + (response.expires_in || 3600) * 1000;

        // Get user info
        try {
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const userData = await userResponse.json();
          userInfo = {
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
          };

          // Store session
          localStorage.setItem('cardflow-google-auth', JSON.stringify({
            token: accessToken,
            expiry: tokenExpiry,
            user: userInfo,
          }));

          notifyListeners(true, userInfo);
          resolve(userInfo);
        } catch (error) {
          reject(error);
        }
      },
    });

    client.requestAccessToken();
  });
}

/**
 * Sign out and revoke access
 */
export function signOut(): void {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      console.log('Google access revoked');
    });
  }

  accessToken = null;
  tokenExpiry = null;
  userInfo = null;
  localStorage.removeItem('cardflow-google-auth');
  notifyListeners(false, null);
}

/**
 * Get the current access token
 * Returns null if not authenticated
 */
export function getAccessToken(): string | null {
  // Check if token is expired
  if (tokenExpiry && Date.now() >= tokenExpiry) {
    signOut();
    return null;
  }
  return accessToken;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Get current user info
 */
export function getUserInfo(): GoogleUserInfo | null {
  return userInfo;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: AuthCallback): () => void {
  authListeners.add(callback);
  // Immediately call with current state
  callback(isAuthenticated(), userInfo);
  
  // Return unsubscribe function
  return () => {
    authListeners.delete(callback);
  };
}

/**
 * Notify all listeners of auth state change
 */
function notifyListeners(isAuth: boolean, user: GoogleUserInfo | null): void {
  authListeners.forEach(callback => callback(isAuth, user));
}

/**
 * Check if Google Auth is configured
 */
export function isConfigured(): boolean {
  return !!GOOGLE_CLIENT_ID;
}

// Type declaration for Google Identity Services
declare global {
  interface Window {
    google: typeof google;
  }
  const google: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: {
            access_token?: string;
            expires_in?: number;
            error?: string;
          }) => void;
        }) => {
          requestAccessToken: () => void;
        };
        revoke: (token: string, callback: () => void) => void;
      };
    };
  };
}
