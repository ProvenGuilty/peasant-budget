# Deployment Guide - Vercel

## 🚀 Quick Deploy to Vercel

### Prerequisites:
- ✅ GitHub account
- ✅ Vercel account (free tier works great!)
- ✅ OpenAI API key

---

## 📋 Pre-Deployment Checklist

### 1. **Code is Ready:**
- ✅ All features working locally
- ✅ No console errors
- ✅ Build succeeds: `npm run build`
- ✅ Preview works: `npm run preview`
- ✅ All commits pushed to GitHub

### 2. **Environment Variables:**
- ✅ `.env` is in `.gitignore` (never commit API keys!)
- ✅ `.env.example` created for reference
- ✅ OpenAI API key ready

### 3. **Configuration Files:**
- ✅ `vercel.json` configured
- ✅ `package.json` has correct build scripts
- ✅ All dependencies in `package.json`

---

## 🎯 Deployment Steps

### **Option 1: Deploy via Vercel Dashboard (Easiest)**

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `peasant-budget`
   - Click "Import"

3. **Configure Project:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add variable:
     ```
     Name: VITE_OPENAI_API_KEY
     Value: sk-proj-... (your actual API key)
     ```
   - Select: Production, Preview, Development
   - Click "Add"

5. **Deploy:**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your app is live! 🎉

---

### **Option 2: Deploy via Vercel CLI**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add Environment Variable:**
   ```bash
   vercel env add VITE_OPENAI_API_KEY
   ```
   - Paste your API key
   - Select: Production, Preview, Development

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

## 🔐 Environment Variables Setup

### **In Vercel Dashboard:**

1. Go to your project
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add:
   ```
   VITE_OPENAI_API_KEY = sk-proj-your-key-here
   ```
5. Check all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### **Important Notes:**
- ⚠️ **Never commit `.env` to git**
- ⚠️ **Vite requires `VITE_` prefix** for client-side variables
- ⚠️ After adding env vars, **redeploy** for changes to take effect

---

## 🧪 Testing Your Deployment

### **1. Test Build Locally:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# Preview production build
npm run preview
```

Visit: http://localhost:4173

### **2. Check for Issues:**
- ✅ No console errors
- ✅ AI features work (category suggestions, subscriptions, insights)
- ✅ localStorage persists data
- ✅ All components render correctly
- ✅ Pay period selector works
- ✅ Charts display properly

---

## 🔍 Common Issues & Fixes

### **Issue 1: "API Key Not Found"**
**Cause:** Environment variable not set in Vercel

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `VITE_OPENAI_API_KEY`
3. Redeploy

---

### **Issue 2: "404 on Page Refresh"**
**Cause:** SPA routing not configured

**Fix:** Already handled in `vercel.json`:
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

---

### **Issue 3: "Build Failed"**
**Cause:** Missing dependencies or build errors

**Fix:**
```bash
# Test build locally
npm run build

# Check for errors
npm run lint

# Fix any issues, commit, push
git add .
git commit -m "fix: resolve build errors"
git push
```

---

### **Issue 4: "Blank Page After Deploy"**
**Cause:** Usually console errors or missing assets

**Fix:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify all imports are correct

---

### **Issue 5: "AI Features Not Working"**
**Cause:** API key not set or incorrect

**Fix:**
1. Check Vercel env vars
2. Verify key starts with `sk-proj-` or `sk-`
3. Test key locally first
4. Redeploy after adding key

---

## 📊 Vercel Features You Get

### **Automatic:**
- ✅ **HTTPS** - Free SSL certificate
- ✅ **CDN** - Global edge network
- ✅ **Auto-deploys** - Every git push
- ✅ **Preview URLs** - For every PR
- ✅ **Analytics** - Traffic insights
- ✅ **Rollbacks** - Instant rollback to previous version

### **Performance:**
- ✅ Asset optimization
- ✅ Image optimization
- ✅ Compression (gzip/brotli)
- ✅ HTTP/2 & HTTP/3
- ✅ Edge caching

---

## 🎨 Custom Domain (Optional)

### **Add Your Own Domain:**

1. **In Vercel Dashboard:**
   - Go to Settings → Domains
   - Add your domain: `peasant-budget.com`

2. **Update DNS:**
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation (5-60 minutes)

3. **SSL Certificate:**
   - Automatically provisioned by Vercel
   - Usually ready in 1-2 minutes

---

## 🔄 Continuous Deployment

### **How It Works:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

2. **Vercel Auto-Deploys:**
   - Detects push
   - Runs build
   - Deploys to production
   - Updates live site

3. **Preview Deployments:**
   - Every branch gets a preview URL
   - Test before merging to main
   - Share with team for review

---

## 📈 Monitoring Your App

### **Vercel Analytics:**
- View traffic stats
- See popular pages
- Monitor performance
- Track errors

### **Check Deployment Logs:**
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Click on a deployment
4. View build logs and runtime logs

---

## 🛠️ Advanced Configuration

### **Custom Build Settings:**

Edit `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "NODE_ENV": "production"
  }
}
```

### **Headers & Caching:**

Already configured in `vercel.json`:
```json
"headers": [
  {
    "source": "/assets/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
]
```

---

## 🎯 Production Optimization Tips

### **1. Code Splitting:**
Already handled by Vite automatically!

### **2. Tree Shaking:**
Vite removes unused code in production build.

### **3. Minification:**
All JS/CSS automatically minified.

### **4. Asset Optimization:**
Images and assets optimized by Vercel.

### **5. Lazy Loading:**
Consider lazy loading heavy components:
```javascript
const CategoryChart = lazy(() => import('./components/CategoryChart'))
```

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Test build locally: `npm run build`
- [ ] Test preview: `npm run preview`
- [ ] Check for console errors
- [ ] Verify all features work
- [ ] Push all commits to GitHub
- [ ] Have OpenAI API key ready
- [ ] Create Vercel account
- [ ] Import project to Vercel
- [ ] Add environment variables
- [ ] Deploy!
- [ ] Test live site
- [ ] Check AI features work
- [ ] Verify localStorage works
- [ ] Test on mobile

---

## 🎉 You're Live!

Your app will be available at:
```
https://peasant-budget.vercel.app
```

Or your custom domain:
```
https://your-domain.com
```

---

## 🆘 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev/guide/
- **GitHub Issues:** Create an issue in your repo

---

**peasant-budget: Now serving peasants worldwide!** 🌍💰
