# Storage System Guide

## 🎯 Overview

peasant-budget uses a **provider-based storage abstraction** that allows users to choose where their data is stored. This aligns with the "free as in freedom" philosophy - **you own your data**.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    peasant-budget                        │
├─────────────────────────────────────────────────────────┤
│  Storage Context (React)                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ useStorage() hook                               │   │
│  │ - transactions, settings, payPeriodConfig      │   │
│  │ - addTransaction, deleteTransaction            │   │
│  │ - switchProvider, exportData, importData       │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Storage Provider Abstraction                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ localStorage│ │Google Drive │ │  OneDrive   │       │
│  │  Provider   │ │  Provider   │ │  Provider   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
src/storage/
├── index.js                    # Main exports
├── StorageProvider.js          # Abstract base class & utilities
├── StorageContext.jsx          # React context & hook
└── providers/
    ├── LocalStorageProvider.js # Browser localStorage
    └── GoogleDriveProvider.js  # Google Drive API
```

## 🔌 Available Providers

### 1. Local Storage (Default)

**ID:** `local`

**Features:**
- ✅ Works offline
- ✅ Instant read/write
- ✅ No authentication required
- ✅ Data persists across browser sessions
- ✅ Cross-tab synchronization

**Limitations:**
- ❌ Data is browser/device specific
- ❌ ~5-10MB storage limit
- ❌ No cross-device sync

**Best for:** Personal use on a single device

---

### 2. Google Drive

**ID:** `google-drive`

**Features:**
- ✅ Data stored in user's Google Drive
- ✅ Cross-device sync
- ✅ User owns their data completely
- ✅ Uses App Data folder (hidden from Drive UI)
- ✅ Automatic backups by Google

**Requirements:**
- Google account
- `VITE_GOOGLE_CLIENT_ID` environment variable

**Best for:** Users who want cross-device sync

---

### 3. OneDrive (Coming Soon)

**ID:** `onedrive`

**Features:**
- ✅ Data stored in user's OneDrive
- ✅ Cross-device sync
- ✅ Integration with Microsoft ecosystem

---

## 🔧 Configuration

### Environment Variables

```bash
# .env file

# Google Drive (optional)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Setting Up Google Drive

1. **Create Google Cloud Project:**
   - Go to https://console.cloud.google.com
   - Create a new project

2. **Enable Drive API:**
   - Go to APIs & Services → Library
   - Search for "Google Drive API"
   - Click Enable

3. **Create OAuth Credentials:**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://budget.peasant.free` (production)
   - Copy the Client ID

4. **Configure OAuth Consent Screen:**
   - Go to OAuth consent screen
   - Fill in app name, support email
   - Add scope: `https://www.googleapis.com/auth/drive.appdata`
   - Add test users (for development)

5. **Add to Environment:**
   ```bash
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

---

## 💾 Data Format

All providers use the same universal JSON format:

```json
{
  "version": "1.0",
  "exportedAt": "2025-12-07T08:00:00.000Z",
  "provider": "local",
  "data": {
    "transactions": [
      {
        "id": "uuid-here",
        "date": "2025-12-07",
        "amount": 50.00,
        "description": "Groceries",
        "category": "Food",
        "type": "expense"
      }
    ],
    "settings": {},
    "payPeriodConfig": {
      "type": "bi-monthly",
      "lastPayday": "2025-12-06T00:00:00.000Z"
    }
  }
}
```

This format ensures:
- ✅ Data portability between providers
- ✅ Easy manual backup/restore
- ✅ Version tracking for migrations
- ✅ Human-readable JSON

---

## 🔄 Switching Providers

Users can switch providers at any time:

1. Click the storage button in the header
2. Select a new provider
3. Authenticate if required
4. Data is automatically migrated

**Data is preserved** when switching providers.

---

## 📤 Import/Export

### Export

1. Click storage settings
2. Click "Export"
3. JSON file downloads to your computer

### Import

1. Click storage settings
2. Click "Import"
3. Select a JSON file
4. Data is loaded and saved to current provider

**Use cases:**
- Backup your data
- Transfer between devices
- Switch from one provider to another
- Share budget templates

---

## 🛠️ Developer Guide

### Using the Storage Hook

```jsx
import { useStorage } from './storage';

function MyComponent() {
  const {
    // Data
    transactions,
    settings,
    payPeriodConfig,
    
    // State
    isLoading,
    error,
    syncStatus,
    
    // Actions
    addTransaction,
    deleteTransaction,
    updateSettings,
    
    // Provider management
    providerId,
    availableProviders,
    switchProvider,
    
    // Import/Export
    exportData,
    importData
  } = useStorage();

  // Use the data and actions...
}
```

### Creating a New Provider

1. Create a new file in `src/storage/providers/`:

```javascript
import { StorageProvider, registerProvider } from '../StorageProvider.js';

class MyProvider extends StorageProvider {
  getInfo() {
    return {
      id: 'my-provider',
      name: 'My Provider',
      icon: 'cloud',
      description: 'Store data in My Service',
      requiresAuth: true,
      supportsSync: true
    };
  }

  async isAvailable() { /* ... */ }
  async isAuthenticated() { /* ... */ }
  async authenticate() { /* ... */ }
  async signOut() { /* ... */ }
  async getUserInfo() { /* ... */ }
  async load() { /* ... */ }
  async save(data) { /* ... */ }
  async delete() { /* ... */ }
  getSyncStatus() { /* ... */ }
  onSyncStatusChange(callback) { /* ... */ }
}

// Register the provider
registerProvider('my-provider', new MyProvider());

export default myProvider;
```

2. Import in `StorageContext.jsx`:

```javascript
import './providers/MyProvider.js';
```

3. Export in `index.js`:

```javascript
export { default as myProvider } from './providers/MyProvider.js';
```

---

## 🔒 Security

### Data Privacy

- **Local Storage:** Data never leaves your browser
- **Google Drive:** Data stored in YOUR Google account
- **We never see your data:** No server-side storage

### Authentication

- OAuth 2.0 for cloud providers
- Tokens stored in session storage (cleared on browser close)
- No passwords stored

### Encryption

- Google Drive: Encrypted at rest by Google
- Local Storage: Not encrypted (browser security)
- HTTPS: All API calls encrypted in transit

---

## 🐛 Troubleshooting

### "Google Drive not available"

**Cause:** `VITE_GOOGLE_CLIENT_ID` not set

**Fix:**
1. Create Google Cloud project
2. Get OAuth Client ID
3. Add to `.env` file
4. Restart dev server

---

### "Failed to authenticate"

**Cause:** OAuth configuration issue

**Fix:**
1. Check authorized JavaScript origins in Google Console
2. Ensure you're using the correct Client ID
3. Check browser console for detailed error

---

### "Data not syncing"

**Cause:** Network issue or API error

**Fix:**
1. Check internet connection
2. Click "Sync Now" in storage settings
3. Check browser console for errors

---

### "Import failed"

**Cause:** Invalid JSON format

**Fix:**
1. Ensure file is valid JSON
2. Check that it matches the expected format
3. Try exporting first to see the correct format

---

## 📊 Sync Status

| Status | Icon | Meaning |
|--------|------|---------|
| `idle` | ✓ | Ready, no pending changes |
| `syncing` | ⟳ | Currently saving/loading |
| `synced` | ✓ | All changes saved |
| `error` | ⚠ | Failed to sync |
| `offline` | ⚠ | No internet connection |

---

## 🚀 Future Providers

Planned providers:
- **OneDrive** - Microsoft Graph API
- **Dropbox** - Dropbox API
- **iCloud** - CloudKit JS (requires Apple Developer Program)
- **Self-hosted** - Your own server

---

## 🗽 Philosophy

**"Free as in freedom, not free as in beer"**

- You choose where your data lives
- You can export anytime
- You can switch providers anytime
- We never have access to your data
- Open source, auditable code

---

## 📚 Related Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploying to Vercel
- [AUTH-ROADMAP.md](AUTH-ROADMAP.md) - Future authentication plans
- [README.md](README.md) - Project overview

---

**Your data, your choice, your freedom.** 🗽💰
