# Google Drive Sync Setup Guide

This guide will help you set up Google Drive sync for Swipe.

## Prerequisites

- A Google account
- 10 minutes of your time

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it something like "Swipe" and click **Create**
4. Wait for the project to be created, then select it

## Step 2: Enable Google Drive API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** and click **Create**
3. Fill in the required fields:
   - **App name**: Swipe
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**
5. On Scopes page, click **Add or Remove Scopes**
6. Search and add: `https://www.googleapis.com/auth/drive.file`
7. Click **Update** → **Save and Continue**
8. On Test users page, click **Add Users**
9. Add your email address
10. Click **Save and Continue** → **Back to Dashboard**

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name it "Swipe Web Client"
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development)
   - `https://your-app.vercel.app` (replace with your Vercel URL after deployment)
6. Click **Create**
7. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
643265591078-nr1k0tf5u7us9vf1nlgfljruho4tnb3k.apps.googleusercontent.com
## Step 5: Configure Swipe

### For Local Development

Create a file called `.env.local` in the project root:

```bash
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Then restart the dev server:

```bash
npm run dev
```

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Your Client ID from Step 4
4. Redeploy your app

## Step 6: Test the Connection

1. Open Swipe in your browser
2. Go to **Settings** (gear icon)
3. You should see a "Cloud Sync" section
4. Click **Connect Google Drive**
5. Sign in with your Google account
6. Grant permissions
7. Done! Your data will now sync automatically.

## Troubleshooting

### "Access Blocked" Error
- Make sure you added your email to Test Users (Step 3.9)
- The app is in "Testing" mode, which only allows whitelisted users

### "Origin not allowed" Error
- Check that your URL is listed in Authorized JavaScript origins (Step 4.5)
- Make sure there's no trailing slash in the URL

### Sync Not Working
- Check browser console for errors
- Make sure you're online
- Try clicking "Sync Now" in Settings

## Security Notes

- Your data is stored in **your own** Google Drive
- Swipe never sees or stores your data on any server
- The `drive.file` scope only allows access to files created by Swipe
- You can revoke access anytime at https://myaccount.google.com/permissions
