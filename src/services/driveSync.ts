/**
 * Google Drive Sync Service
 * Handles saving and loading data from Google Drive
 */

import { getAccessToken, isAuthenticated } from './googleAuth';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const FOLDER_NAME = 'Swipe';
const FILE_NAME = 'swipe-data.json';

// Cache the folder and file IDs
let folderId: string | null = null;
let fileId: string | null = null;

export interface SyncData {
  version: string;
  lastModified: string;
  data: {
    cards: unknown[];
    transactions: unknown[];
    bonusRules: unknown[];
    settings: {
      theme: 'dark' | 'light';
    };
  };
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

/**
 * Initialize sync service
 * Finds or creates the Swipe folder and data file
 */
export async function initSync(): Promise<boolean> {
  if (!isAuthenticated()) {
    return false;
  }

  try {
    // Find or create Swipe folder
    folderId = await findOrCreateFolder();
    
    // Find the data file (don't create yet)
    fileId = await findFile();
    
    return true;
  } catch (error) {
    console.error('Failed to initialize sync:', error);
    return false;
  }
}

/**
 * Save data to Google Drive
 */
export async function saveToCloud(data: SyncData): Promise<boolean> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  if (!navigator.onLine) {
    throw new Error('Offline');
  }

  try {
    // Ensure folder exists
    if (!folderId) {
      folderId = await findOrCreateFolder();
    }

    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });

    if (fileId) {
      // Update existing file
      await updateFile(fileId, blob, token);
    } else {
      // Create new file
      fileId = await createFile(blob, token);
    }

    return true;
  } catch (error) {
    console.error('Failed to save to cloud:', error);
    throw error;
  }
}

/**
 * Load data from Google Drive
 */
export async function loadFromCloud(): Promise<SyncData | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  if (!navigator.onLine) {
    throw new Error('Offline');
  }

  try {
    // Find file if we don't have the ID
    if (!fileId) {
      fileId = await findFile();
    }

    if (!fileId) {
      // No file exists yet
      return null;
    }

    // Download file content
    const response = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 404) {
        fileId = null;
        return null;
      }
      throw new Error(`Failed to load: ${response.statusText}`);
    }

    const data = await response.json();
    return data as SyncData;
  } catch (error) {
    console.error('Failed to load from cloud:', error);
    throw error;
  }
}

/**
 * Get sync status info
 */
export async function getSyncInfo(): Promise<{ lastModified: string | null; fileSize: number | null }> {
  const token = getAccessToken();
  if (!token || !fileId) {
    return { lastModified: null, fileSize: null };
  }

  try {
    const response = await fetch(
      `${DRIVE_API_URL}/files/${fileId}?fields=modifiedTime,size`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      return { lastModified: null, fileSize: null };
    }

    const data = await response.json();
    return {
      lastModified: data.modifiedTime,
      fileSize: parseInt(data.size, 10),
    };
  } catch {
    return { lastModified: null, fileSize: null };
  }
}

// === Helper Functions ===

/**
 * Find or create the Swipe folder in Drive
 */
async function findOrCreateFolder(): Promise<string> {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');

  // Search for existing folder
  const query = `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchResponse = await fetch(
    `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!searchResponse.ok) {
    throw new Error('Failed to search for folder');
  }

  const searchResult = await searchResponse.json();
  
  if (searchResult.files && searchResult.files.length > 0) {
    return searchResult.files[0].id;
  }

  // Create folder
  const createResponse = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createResponse.ok) {
    throw new Error('Failed to create folder');
  }

  const folder = await createResponse.json();
  return folder.id;
}

/**
 * Find the data file in the Swipe folder
 */
async function findFile(): Promise<string | null> {
  const token = getAccessToken();
  if (!token || !folderId) return null;

  const query = `name='${FILE_NAME}' and '${folderId}' in parents and trashed=false`;
  const response = await fetch(
    `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result.files?.[0]?.id || null;
}

/**
 * Create a new file in Drive
 */
async function createFile(content: Blob, token: string): Promise<string> {
  const metadata = {
    name: FILE_NAME,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', content);

  const response = await fetch(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!response.ok) {
    throw new Error('Failed to create file');
  }

  const file = await response.json();
  return file.id;
}

/**
 * Update an existing file in Drive
 */
async function updateFile(id: string, content: Blob, token: string): Promise<void> {
  const response = await fetch(`${DRIVE_UPLOAD_URL}/files/${id}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: content,
  });

  if (!response.ok) {
    throw new Error('Failed to update file');
  }
}

/**
 * Reset cached IDs (useful after sign out)
 */
export function resetSyncCache(): void {
  folderId = null;
  fileId = null;
}
