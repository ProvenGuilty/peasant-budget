# Google Drive Integration Setup

This guide covers setting up Google Drive as a storage provider for peasant-budget.

## 🎯 Overview

Google Drive integration allows users to:
- Store their budget data in their own Google Drive
- Sync across all their devices
- Keep full ownership of their data
- Access data even if the app goes offline

**Privacy:** The app uses the `drive.appdata` scope, which only allows access to a hidden app-specific folder. The app cannot see or access any other files in the user's Drive.

---

## 🔧 Developer Setup (One-Time)

### Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown (top-left, next to "Google Cloud")
3. Click **"New Project"**
4. Enter:
   - **Project name:** `peasant-budget`
   - **Organization:** Leave as default (or select your org)
5. Click **"Create"**
6. Wait for creation, then **select the new project**

### Step 2: Enable Google Drive API

1. In the left sidebar, go to **APIs & Services → Library**
2. Search for **"Google Drive API"**
3. Click on **"Google Drive API"**
4. Click **"Enable"**
5. Wait for the API to be enabled

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Select **"External"** user type
3. Click **"Create"**

#### App Information
- **App name:** `peasant-budget`
- **User support email:** Your email address
- **App logo:** (Optional) Upload app logo

#### App Domain (Optional for testing)
- **Application home page:** `https://budget.peasant.free`
- **Privacy policy:** `https://budget.peasant.free/privacy` (create later)
- **Terms of service:** `https://budget.peasant.free/terms` (create later)

#### Developer Contact
- **Email addresses:** Your email address

Click **"Save and Continue"**

#### Scopes
1. Click **"Add or Remove Scopes"**
2. In the filter, search for `drive.appdata`
3. Check the box for:
   - `https://www.googleapis.com/auth/drive.appdata`
   - Description: "See, create, and delete its own configuration data in your Google Drive"
4. Click **"Update"**
5. Click **"Save and Continue"**

#### Test Users (Required for External apps)
1. Click **"+ Add Users"**
2. Add email addresses of test users (including yourself)
3. Click **"Add"**
4. Click **"Save and Continue"**

#### Summary
- Review the summary
- Click **"Back to Dashboard"**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **"+ Create Credentials"**
3. Select **"OAuth client ID"**

#### Configure OAuth Client
- **Application type:** Web application
- **Name:** `peasant-budget-web`

#### Authorized JavaScript Origins
Add these URLs (one per line):
```
http://localhost:5173
http://localhost:3000
https://budget.peasant.free
https://peasant-budget.vercel.app
```

#### Authorized Redirect URIs
Leave empty (we use implicit flow)

4. Click **"Create"**

### Step 5: Copy Client ID

After creation, you'll see a dialog with:
- **Client ID:** `123456789012-abcdefg.apps.googleusercontent.com`
- **Client Secret:** (not needed for web apps)

**Copy the Client ID** - you'll need it for the next step.

### Step 6: Add to Environment Variables

#### Local Development

Create or edit `.env` file in project root:

```bash
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

#### Vercel Production

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select the `peasant-budget` project
3. Go to **Settings → Environment Variables**
4. Add:
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** Your Client ID
   - **Environment:** Production, Preview, Development
5. Click **"Save"**
6. **Redeploy** the project for changes to take effect

---

## 🧪 Testing

### Local Testing

1. Start the dev server: `npm run dev`
2. Open http://localhost:5173
3. Click the storage settings button (top right)
4. Click on "Google Drive"
5. Sign in with a test user account
6. Authorize the app
7. Verify data syncs to Google Drive

### Verify in Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. The app data is stored in a hidden folder (not visible in normal Drive view)
3. To verify, go to: https://drive.google.com/drive/appdata
4. You should see `peasant-budget-data.json`

---

## 🚀 Production Deployment

### OAuth Verification (Required for 100+ users)

If you want more than 100 users, you need to verify your app:

1. Go to **OAuth consent screen**
2. Click **"Publish App"**
3. Click **"Prepare for Verification"**
4. You'll need:
   - Privacy Policy URL
   - Terms of Service URL (optional)
   - Explanation of how you use the data
5. Submit for review (takes 1-2 weeks)

### Without Verification

- Limited to 100 test users
- Users see a warning screen ("This app isn't verified")
- Users can still proceed by clicking "Advanced" → "Go to app"

---

## 🔒 Security Considerations

### Scope Justification

We use `drive.appdata` scope because:
- It's the **most restrictive** Drive scope
- Only allows access to app-specific hidden folder
- Cannot read/write user's other files
- User data stays in their own account

### Data Privacy

- **No server-side storage:** Data goes directly to user's Drive
- **No data collection:** We don't see or store user data
- **User control:** Users can revoke access anytime
- **Data portability:** Users can export their data as JSON

### Token Handling

- Access tokens stored in `sessionStorage` (cleared on browser close)
- No refresh tokens stored (user re-authenticates each session)
- Tokens never sent to our servers

---

## 🐛 Troubleshooting

### "Google Drive not available"

**Cause:** `VITE_GOOGLE_CLIENT_ID` not set

**Fix:**
1. Check `.env` file exists with correct Client ID
2. Restart dev server after adding env variable
3. For Vercel, check Environment Variables and redeploy

### "Access blocked: This app's request is invalid"

**Cause:** JavaScript origin not authorized

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Edit the OAuth client
3. Add the exact URL (including port) to Authorized JavaScript Origins
4. Wait 5 minutes for changes to propagate

### "This app isn't verified"

**Cause:** App not verified by Google (normal for development)

**Fix (for testing):**
1. Click "Advanced"
2. Click "Go to peasant-budget (unsafe)"
3. This is safe - it's your own app

**Fix (for production):**
Submit app for OAuth verification (see Production Deployment section)

### "Failed to authenticate"

**Cause:** User denied permission or popup blocked

**Fix:**
1. Check browser popup blocker settings
2. Try again and click "Allow" on the consent screen
3. Ensure user is added as a test user (if app not verified)

---

## 📚 Related Documentation

- [Storage System Guide](../STORAGE-GUIDE.md)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 for Client-side Apps](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)

---

## 📝 Changelog

- **2025-12-07:** Initial documentation created
