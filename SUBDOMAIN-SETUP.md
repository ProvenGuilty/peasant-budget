# Subdomain Setup Guide - budget.peasant.free

## 🎯 Your Domain Strategy

**Main Domain:** `peasant.free`
**This App:** `budget.peasant.free`

**Future Apps:**
- `tasks.peasant.free` - Task manager
- `notes.peasant.free` - Note taking
- `time.peasant.free` - Time tracker
- `health.peasant.free` - Health tracker
- etc.

**Philosophy:** "Free as in freedom, not free as in beer" 🗽

---

## 🚀 Quick Setup for budget.peasant.free

### **Step 1: Add Subdomain to Vercel**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select `peasant-budget` project

2. **Add Domain:**
   - Settings → Domains
   - Click "Add Domain"
   - Enter: `budget.peasant.free`
   - Click "Add"

3. **Vercel Shows DNS Records:**
   
   **Option A: Using Vercel Nameservers (Easiest)**
   ```
   Nameservers:
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
   
   **Option B: Using CNAME (If you manage DNS elsewhere)**
   ```
   Type: CNAME
   Name: budget
   Value: cname.vercel-dns.com
   TTL: 600
   ```

---

### **Step 2: Configure DNS at Your Registrar**

#### **Option A: Vercel Nameservers (Recommended for Simplicity)**

1. **At Your Registrar (Porkbun/Namecheap/etc):**
   - Go to `peasant.free` domain settings
   - Nameservers section
   - Change to:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```

2. **This gives Vercel full DNS control:**
   - ✅ Easy to add more subdomains
   - ✅ Automatic SSL for all subdomains
   - ✅ No manual DNS records needed

---

#### **Option B: CNAME Record (If you want to keep your nameservers)**

1. **At Your Registrar:**
   - Go to DNS settings for `peasant.free`
   - Add CNAME record:
     ```
     Type: CNAME
     Name: budget
     Value: cname.vercel-dns.com
     TTL: 600
     ```

2. **Save Changes**

---

### **Step 3: Wait for DNS Propagation**

- **Time:** 5-60 minutes (usually ~10 minutes)
- **Check status:** https://dnschecker.org
- **Search for:** `budget.peasant.free`

---

### **Step 4: SSL Auto-Provisions**

- Vercel automatically provisions SSL certificate
- Takes 1-2 minutes after DNS propagates
- Look for "SSL Certificate: Active" ✅

---

## ✅ Done!

Your app will be live at:
```
✅ https://budget.peasant.free
```

---

## 🎨 Future Subdomain Strategy

### **Easy to Add More Apps:**

When you build your next app:

1. **Deploy to Vercel** (new project)
2. **Add subdomain:** `tasks.peasant.free`
3. **DNS auto-configured** (if using Vercel nameservers)
4. **SSL auto-provisions**
5. **Done!**

---

### **Suggested Subdomain Structure:**

```
peasant.free                    → Landing page / portfolio
├── budget.peasant.free         → Budget app (this one!)
├── tasks.peasant.free          → Task manager
├── notes.peasant.free          → Note taking app
├── time.peasant.free           → Time tracker
├── health.peasant.free         → Health tracker
├── habits.peasant.free         → Habit tracker
├── api.peasant.free            → Shared API
├── docs.peasant.free           → Documentation
└── blog.peasant.free           → Blog
```

---

## 🌐 Root Domain Options

### **Option 1: Landing Page**

Create a simple landing page at `peasant.free`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>peasant.free - Freedom Tools</title>
</head>
<body>
  <h1>peasant.free</h1>
  <p>Free as in freedom, not free as in beer 🗽</p>
  
  <h2>Apps:</h2>
  <ul>
    <li><a href="https://budget.peasant.free">Budget Tracker</a></li>
    <li><a href="https://tasks.peasant.free">Task Manager</a> (coming soon)</li>
    <li><a href="https://notes.peasant.free">Notes</a> (coming soon)</li>
  </ul>
</body>
</html>
```

---

### **Option 2: Redirect to Main App**

Redirect `peasant.free` → `budget.peasant.free`

**In Vercel:**
1. Create new project for root domain
2. Add `peasant.free` domain
3. Use `vercel.json`:
   ```json
   {
     "redirects": [
       {
         "source": "/:path*",
         "destination": "https://budget.peasant.free/:path*",
         "permanent": true
       }
     ]
   }
   ```

---

### **Option 3: App Directory**

Show all your apps at `peasant.free`:

```
peasant.free
├── /budget  → budget.peasant.free
├── /tasks   → tasks.peasant.free
├── /notes   → notes.peasant.free
```

---

## 🔧 DNS Management Tips

### **If Using Vercel Nameservers:**

**Pros:**
- ✅ Easy to add subdomains (just add in Vercel)
- ✅ Automatic SSL for all subdomains
- ✅ No manual DNS records
- ✅ Fast propagation

**Cons:**
- ❌ Vercel controls DNS
- ❌ Must use Vercel for all subdomains

---

### **If Using Your Own Nameservers:**

**Pros:**
- ✅ Full control of DNS
- ✅ Can point subdomains anywhere
- ✅ Use other services (email, etc.)

**Cons:**
- ❌ Manual CNAME for each subdomain
- ❌ Manual SSL management (though Vercel handles it)

---

## 📊 Subdomain Limits

**Vercel Free Tier:**
- ✅ Unlimited subdomains
- ✅ Unlimited projects
- ✅ Free SSL for all
- ✅ 100GB bandwidth/month (total across all projects)

**No limits on creativity!** 🎨

---

## 🎯 Branding Consistency

### **Update App Title:**

Let's update the app to reflect the subdomain:

**In `index.html`:**
```html
<title>Budget - peasant.free</title>
```

**In `App.jsx` header:**
```jsx
<h1 className="text-4xl font-bold">budget.peasant.free</h1>
<p className="text-gray-400">Free as in freedom 🗽</p>
```

Want me to make these changes?

---

## 🚀 Next Steps

1. **Add `budget.peasant.free` to Vercel**
   - Dashboard → Settings → Domains → Add

2. **Configure DNS**
   - Use Vercel nameservers (easiest)
   - Or add CNAME record

3. **Wait for DNS** (10-60 min)

4. **SSL auto-provisions** (1-2 min)

5. **Update branding** (optional)
   - Change title to reflect subdomain
   - Add "peasant.free" branding

6. **Build more apps!** 🎉
   - Each gets its own subdomain
   - All under `peasant.free` umbrella

---

## 💡 Future App Ideas

**Productivity Suite:**
- `budget.peasant.free` ✅ (this one!)
- `tasks.peasant.free` - GTD task manager
- `time.peasant.free` - Pomodoro timer
- `focus.peasant.free` - Distraction blocker

**Personal Tools:**
- `journal.peasant.free` - Daily journal
- `habits.peasant.free` - Habit tracker
- `goals.peasant.free` - Goal setting
- `health.peasant.free` - Health metrics

**Utilities:**
- `calc.peasant.free` - Calculator tools
- `convert.peasant.free` - Unit converter
- `tools.peasant.free` - Dev tools

**Meta:**
- `api.peasant.free` - Shared backend
- `docs.peasant.free` - Documentation
- `blog.peasant.free` - Blog/updates

---

## 🎨 Consistent Branding

### **Across All Apps:**

**Header Pattern:**
```
[app-name].peasant.free
Free as in freedom 🗽
```

**Color Scheme:**
- Primary: Green (freedom, growth)
- Dark mode by default
- Consistent UI components

**Philosophy:**
- Open source
- Privacy-focused
- No tracking
- User-owned data (localStorage)
- Free as in freedom

---

## 📝 Domain Summary

**Main Domain:** `peasant.free`
**This App:** `budget.peasant.free`
**Cost:** ~$9-15/year (depending on registrar)
**SSL:** Free (Vercel)
**Subdomains:** Unlimited
**Philosophy:** Freedom tools for everyone 🗽

---

**Ready to set up `budget.peasant.free`?** 

Let me know if you want me to:
1. Update the app branding
2. Create a landing page template
3. Help with DNS configuration

**peasant.free: Building freedom, one app at a time!** 🗽💰
