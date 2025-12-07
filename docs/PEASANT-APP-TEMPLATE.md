# Peasant App Plugin Template

This template documents the setup process for new plugins in the Peasant ecosystem. Use this for rapid deployment of future apps.

## 🏗️ Architecture Overview

```
peasant.app@gmail.com (Master Account)
├── Google Cloud Projects
│   ├── peasant-budget (this app)
│   ├── peasant-fitness (future)
│   └── peasant-[plugin] (future)
│
├── Email Aliases (for filtering)
│   ├── peasant.app+budget@gmail.com
│   ├── peasant.app+fitness@gmail.com
│   └── peasant.app+[plugin]@gmail.com
│
└── Domains
    ├── budget.peasant.free
    ├── fitness.peasant.free
    └── [plugin].peasant.free
```

---

## 📋 New Plugin Checklist

### Phase 1: Project Setup (15 min)

- [ ] Create GitHub repo: `peasant-[plugin]`
- [ ] Clone template or scaffold new Vite + React project
- [ ] Set up Vercel project linked to repo
- [ ] Configure custom domain: `[plugin].peasant.free`

### Phase 2: Google Cloud Setup (10 min)

- [ ] Create Google Cloud project: `peasant-[plugin]`
- [ ] Enable required APIs (Drive API, etc.)
- [ ] Configure Google Auth Platform (see below)
- [ ] Create OAuth credentials
- [ ] Add Client ID to Vercel environment variables

### Phase 3: Legal & Branding (5 min)

- [ ] Copy and customize `privacy.html`
- [ ] Copy and customize `terms.html`
- [ ] Generate logo variant (reuse base design)
- [ ] Update branding in Google Cloud

### Phase 4: Storage Integration (5 min)

- [ ] Copy `src/storage/` directory from peasant-budget
- [ ] Update storage keys (e.g., `peasant-[plugin]-data`)
- [ ] Update Google Drive filename
- [ ] Test local storage + encryption

---

## 🔧 Google Cloud Quick Setup

### 1. Create Project

```
URL: https://console.cloud.google.com/projectcreate
Project name: peasant-[plugin]
```

### 2. Enable APIs

```
URL: https://console.cloud.google.com/apis/library
Enable: Google Drive API
```

### 3. Google Auth Platform

```
URL: https://console.cloud.google.com/auth/branding

App name: peasant-[plugin]
User support email: peasant.app@gmail.com
Developer contact: peasant.app+[plugin]@gmail.com

Audience: External
Test users: Add your test emails

Scopes: https://www.googleapis.com/auth/drive.appdata
```

### 4. OAuth Credentials

```
URL: https://console.cloud.google.com/apis/credentials

Type: Web application
Name: peasant-[plugin]-web

Authorized JavaScript origins:
- http://localhost:5173
- http://localhost:3000
- https://[plugin].peasant.free
- https://peasant-[plugin].vercel.app
```

### 5. Environment Variables

```bash
# Local (.env)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# Vercel (Settings → Environment Variables)
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## 📄 Legal Document Templates

### Privacy Policy Customization

Update these sections in `privacy.html`:

```html
<!-- Title -->
<title>Privacy Policy - Peasant [Plugin]</title>

<!-- App name references -->
Peasant [Plugin] ("we," "our," or "the app")

<!-- Description -->
Peasant [Plugin] is a personal [description] application.

<!-- GitHub link -->
<a href="https://github.com/ProvenGuilty/peasant-[plugin]">GitHub Repository</a>
```

### Terms of Service Customization

Update these sections in `terms.html`:

```html
<!-- Title -->
<title>Terms of Service - Peasant [Plugin]</title>

<!-- Description -->
Peasant [Plugin] is a [description] application that helps you [purpose].

<!-- Specific disclaimers based on plugin type -->
<!-- e.g., for fitness: "not medical advice" -->
<!-- e.g., for budget: "not financial advice" -->
```

---

## 🎨 Logo Generation

Base logo design uses:
- **Background:** `#1a1a2e` (dark blue-gray)
- **Accent:** `#22c55e` (green)
- **Secondary:** `#4ade80` (light green)

For new plugins, modify the center icon while keeping the circular frame:

```svg
<!-- Base template -->
<svg viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="95" fill="#1a1a2e" stroke="#22c55e" stroke-width="3"/>
  
  <!-- Replace this group with plugin-specific icon -->
  <g transform="translate(100, 100)">
    <!-- Plugin icon here -->
  </g>
  
  <circle cx="100" cy="100" r="90" fill="none" stroke="#22c55e" stroke-width="1" opacity="0.3"/>
</svg>
```

---

## 📁 Reusable Code Modules

### Storage System (Copy Entire Directory)

```
src/storage/
├── index.js                    # Exports
├── StorageProvider.js          # Base class
├── StorageContext.jsx          # React context
├── encryption.js               # AES-256-GCM encryption
└── providers/
    ├── LocalStorageProvider.js
    └── GoogleDriveProvider.js
```

**Required changes:**
1. Update `STORAGE_KEY` in LocalStorageProvider.js
2. Update `FILE_NAME` in GoogleDriveProvider.js
3. Update data structure in `createBudgetData()` function

### Components (Copy & Customize)

```
src/components/
├── StorageSettings.jsx         # Provider selection UI
└── EncryptionSettings.jsx      # Encryption toggle UI
```

---

## 🌐 Domain Setup (Vercel)

1. Go to Vercel project → Settings → Domains
2. Add: `[plugin].peasant.free`
3. Add DNS record at registrar:
   ```
   Type: CNAME
   Name: [plugin]
   Value: cname.vercel-dns.com
   ```

---

## 📧 Email Alias Setup (Gmail)

No setup needed - Gmail automatically routes `+` aliases.

To filter in Gmail:
1. Settings → Filters → Create new filter
2. To: `peasant.app+[plugin]@gmail.com`
3. Apply label: `[Plugin] App`

---

## 🚀 Deployment Checklist

```bash
# 1. Build and test locally
npm run build
npm run preview

# 2. Commit and push
git add -A
git commit -m "feat: initial [plugin] release"
git push origin main

# 3. Verify Vercel deployment
# Check: https://[plugin].peasant.free

# 4. Test Google Drive integration
# - Sign in with test user
# - Verify data saves to Drive
# - Verify data loads on refresh

# 5. Test encryption
# - Enable encryption
# - Verify data is encrypted in localStorage
# - Verify unlock works
```

---

## 📊 Shared Infrastructure

| Resource | Shared? | Notes |
|----------|---------|-------|
| Gmail account | ✅ Yes | `peasant.app@gmail.com` |
| Google Cloud billing | ✅ Yes | One billing account |
| Vercel team | ✅ Yes | One team, multiple projects |
| Domain | ✅ Yes | `peasant.free` with subdomains |
| Storage code | ✅ Yes | Copy from peasant-budget |
| Legal templates | ✅ Yes | Customize per plugin |

| Resource | Separate | Notes |
|----------|----------|-------|
| Google Cloud project | ❌ No | One per plugin |
| OAuth Client ID | ❌ No | One per plugin |
| GitHub repo | ❌ No | One per plugin |
| Vercel project | ❌ No | One per plugin |

---

## 🔮 Future Plugin Ideas

| Plugin | Description | Unique APIs |
|--------|-------------|-------------|
| peasant-fitness | Workout/health tracking | None (local only) |
| peasant-meals | Meal planning | None (local only) |
| peasant-tasks | Todo/task management | None (local only) |
| peasant-journal | Daily journaling | None (local only) |
| peasant-habits | Habit tracking | None (local only) |

All plugins share:
- Same storage architecture
- Same encryption
- Same "free as in freedom" philosophy
- Same legal framework

---

## 📝 Changelog

- **2025-12-07:** Initial template created from peasant-budget setup
