# Custom Domain Setup Guide

## 🌐 Complete Guide to Adding a Custom Domain to Vercel

---

## 💰 Step 1: Buy a Domain (Cheapest Options)

### **Recommended Registrars (Cheapest to Most Expensive):**

#### **1. Porkbun** ⭐ **BEST VALUE**
- **Price:** $3-10/year (.com = $9.13/year)
- **Why:** Cheapest, free WHOIS privacy, great UI
- **Website:** https://porkbun.com
- **Pros:** 
  - No hidden fees
  - Free SSL included
  - Easy DNS management
  - Great support
- **Cons:** Smaller company (but very reliable)

#### **2. Namecheap**
- **Price:** $8-13/year (.com = $8.98 first year, $13.98 renewal)
- **Why:** Popular, reliable, good support
- **Website:** https://www.namecheap.com
- **Pros:**
  - Free WHOIS privacy
  - Good reputation
  - Easy to use
- **Cons:** Renewal prices higher

#### **3. Cloudflare Registrar** ⭐ **AT-COST PRICING**
- **Price:** $9-10/year (.com = $9.77/year)
- **Why:** At-cost pricing (no markup!)
- **Website:** https://www.cloudflare.com/products/registrar/
- **Pros:**
  - Wholesale pricing
  - Free DNS
  - Built-in CDN
  - Best security
- **Cons:** 
  - Must transfer existing domain (can't register new)
  - Requires Cloudflare account

#### **4. Google Domains (Now Squarespace)**
- **Price:** $12-20/year (.com = $12/year)
- **Why:** Simple, integrated with Google
- **Website:** https://domains.google (redirects to Squarespace)
- **Note:** Google sold to Squarespace in 2023

#### **5. GoDaddy** ❌ **NOT RECOMMENDED**
- **Price:** $0.99 first year, $19.99+ renewal
- **Why:** Expensive renewals, pushy upsells
- **Avoid unless you have a coupon**

---

### **Domain Extension Pricing:**

| Extension | Porkbun | Namecheap | Cloudflare |
|-----------|---------|-----------|------------|
| .com      | $9.13   | $8.98     | $9.77      |
| .net      | $9.13   | $12.98    | $10.88     |
| .org      | $9.13   | $12.98    | $10.88     |
| .io       | $39.00  | $39.98    | $42.00     |
| .dev      | $12.50  | $12.98    | $13.50     |
| .app      | $14.50  | $14.98    | $15.50     |
| .xyz      | $1.50   | $1.98     | $2.00      |
| .co       | $27.00  | $29.98    | $30.00     |

**Recommendation:** Stick with **.com** for credibility, or **.dev** for tech projects.

---

## 🛒 Step 2: How to Buy a Domain

### **Using Porkbun (Recommended):**

1. **Go to Porkbun:**
   - Visit: https://porkbun.com

2. **Search for Your Domain:**
   - Type: `peasant-budget.com` (or your preferred name)
   - Click "Search"

3. **Check Availability:**
   - ✅ Available → Add to cart
   - ❌ Taken → Try variations:
     - `peasantbudget.com`
     - `peasant-budget.app`
     - `mybudget.app`
     - `budgetpeasant.com`

4. **Add to Cart:**
   - Click "Add to Cart"
   - Select registration period: **1 year** (cheapest)
   - **Auto-renew:** ✅ Enable (so you don't lose it)

5. **Checkout:**
   - Create account (free)
   - Enter payment info
   - **Total:** ~$9-10 for .com

6. **Included Free:**
   - ✅ WHOIS privacy (hides your personal info)
   - ✅ SSL certificate
   - ✅ DNS management
   - ✅ Email forwarding

---

## 🔗 Step 3: Connect Domain to Vercel

### **Option A: Using Vercel Nameservers (Easiest)**

#### **1. Add Domain in Vercel:**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your `peasant-budget` project

2. **Go to Settings:**
   - Click "Settings" tab
   - Click "Domains" in sidebar

3. **Add Domain:**
   - Click "Add Domain"
   - Enter: `peasant-budget.com` (your domain)
   - Click "Add"

4. **Vercel Shows Nameservers:**
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
   - **Copy these!** You'll need them next.

#### **2. Update Nameservers at Porkbun:**

1. **Login to Porkbun:**
   - Go to: https://porkbun.com/account/domains

2. **Select Your Domain:**
   - Click on your domain name

3. **Change Nameservers:**
   - Click "Nameservers" tab
   - Select "Use Custom Nameservers"
   - Enter Vercel nameservers:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - Click "Update"

4. **Wait for Propagation:**
   - Takes **5-60 minutes** (usually ~10 minutes)
   - DNS changes need to spread globally

#### **3. Verify in Vercel:**

1. **Back to Vercel Dashboard:**
   - Refresh the page
   - You should see: "Domain is now active" ✅

2. **SSL Certificate:**
   - Vercel automatically provisions SSL
   - Takes 1-2 minutes
   - You'll see: "SSL Certificate: Active" ✅

---

### **Option B: Using CNAME Records (Alternative)**

If you want to keep your existing nameservers:

#### **1. Add Domain in Vercel:**
- Same as Option A steps 1-3

#### **2. Get CNAME Target:**
- Vercel shows: `cname.vercel-dns.com`

#### **3. Add CNAME at Porkbun:**

1. **Go to DNS Settings:**
   - Porkbun → Your Domain → DNS

2. **Add CNAME Record:**
   ```
   Type: CNAME
   Host: www
   Answer: cname.vercel-dns.com
   TTL: 600
   ```

3. **Add A Record for Root Domain:**
   ```
   Type: A
   Host: @
   Answer: 76.76.21.21 (Vercel's IP)
   TTL: 600
   ```

4. **Save Changes**

---

## 🔒 Step 4: SSL Certificate (Automatic!)

### **Vercel Handles SSL Automatically:**

1. **Certificate Provisioning:**
   - Vercel uses Let's Encrypt
   - Automatically provisions SSL
   - Takes 1-2 minutes after DNS is configured

2. **Check SSL Status:**
   - Vercel Dashboard → Domains
   - Look for: "SSL Certificate: Active" ✅

3. **HTTPS Redirect:**
   - Vercel automatically redirects HTTP → HTTPS
   - No configuration needed!

4. **Certificate Renewal:**
   - Auto-renews every 90 days
   - You don't need to do anything

---

## ✅ Step 5: Verify Everything Works

### **1. Test Your Domain:**

```bash
# Check DNS propagation
nslookup peasant-budget.com

# Check if it resolves to Vercel
dig peasant-budget.com

# Test HTTPS
curl -I https://peasant-budget.com
```

### **2. Visit Your Site:**
- https://peasant-budget.com ✅
- https://www.peasant-budget.com ✅
- Both should work!

### **3. Check SSL:**
- Click the padlock 🔒 in browser
- Should show: "Connection is secure"
- Certificate issued by: Let's Encrypt

---

## 🎯 Complete Setup Checklist

- [ ] Domain purchased from registrar
- [ ] Nameservers updated to Vercel
- [ ] Domain added in Vercel dashboard
- [ ] DNS propagated (wait 10-60 minutes)
- [ ] SSL certificate active
- [ ] HTTPS working
- [ ] www subdomain working
- [ ] HTTP redirects to HTTPS

---

## 🌐 Add www Subdomain

### **In Vercel Dashboard:**

1. **Add Another Domain:**
   - Settings → Domains → Add Domain
   - Enter: `www.peasant-budget.com`
   - Click "Add"

2. **Redirect www to Root:**
   - Vercel asks: "Redirect www to root?"
   - Select: ✅ Yes
   - Now both work!

---

## 💡 Domain Suggestions for peasant-budget

### **Available Options:**

**Professional:**
- `peasant-budget.com` ⭐
- `peasantbudget.com`
- `mybudget.app`
- `budgetapp.dev`

**Creative:**
- `peasant.money`
- `peasant.finance`
- `budget-peasant.com`
- `thepeasantbudget.com`

**Cheap/Fun:**
- `peasant-budget.xyz` ($1.50/year)
- `peasant-budget.site` ($2/year)
- `peasantbudget.online` ($3/year)

---

## 🔧 Troubleshooting

### **Issue 1: "Domain not found"**
**Cause:** DNS not propagated yet

**Fix:**
- Wait 10-60 minutes
- Check propagation: https://dnschecker.org
- Clear browser cache

---

### **Issue 2: "SSL Certificate Pending"**
**Cause:** Waiting for DNS to propagate

**Fix:**
- Wait for DNS to fully propagate
- Vercel will auto-provision once DNS is ready
- Usually takes 1-2 minutes after DNS is live

---

### **Issue 3: "Invalid Configuration"**
**Cause:** Nameservers not updated correctly

**Fix:**
- Double-check nameservers at registrar
- Make sure you copied them exactly:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ```
- No trailing dots or spaces

---

### **Issue 4: "www not working"**
**Cause:** www subdomain not added

**Fix:**
- Add `www.your-domain.com` in Vercel
- Enable redirect to root domain

---

## 📊 Cost Breakdown

### **One-Time Setup:**
```
Domain registration: $9/year (Porkbun .com)
SSL certificate: $0 (Vercel provides free)
DNS hosting: $0 (Included with domain)
Vercel hosting: $0 (Free tier)
─────────────────────────────────────
Total first year: $9
```

### **Annual Renewal:**
```
Domain renewal: $9/year
Everything else: $0
─────────────────────────────────────
Total per year: $9
```

**That's less than $1/month!** 💰

---

## 🎨 Email Setup (Optional)

### **Free Email Forwarding:**

Most registrars offer free email forwarding:

**Porkbun:**
1. Go to your domain → Email Forwarding
2. Add forward:
   ```
   contact@peasant-budget.com → your-email@gmail.com
   ```
3. Now you can receive emails!

**For Sending:**
- Use Gmail with custom domain (Google Workspace - $6/month)
- Or use free: Zoho Mail (1 user free)

---

## 🚀 Advanced: Multiple Domains

### **Point Multiple Domains to Same Site:**

1. **Buy Additional Domains:**
   - `peasantbudget.com`
   - `peasant.money`

2. **Add All to Vercel:**
   - Settings → Domains → Add each one

3. **Set Primary Domain:**
   - Select one as primary
   - Others redirect to primary

**Use Case:** Protect your brand, catch typos

---

## 📝 Domain Management Best Practices

### **Security:**
- ✅ Enable domain lock (prevents unauthorized transfers)
- ✅ Use strong password for registrar
- ✅ Enable 2FA on registrar account
- ✅ Keep WHOIS privacy enabled

### **Renewals:**
- ✅ Enable auto-renew (never lose your domain!)
- ✅ Set calendar reminder 1 month before expiration
- ✅ Keep payment method up to date

### **DNS:**
- ✅ Use Vercel nameservers (simplest)
- ✅ Or use Cloudflare for advanced features
- ✅ Keep TTL low (600) for easier changes

---

## 🎯 Quick Start Summary

**Total Time:** 15 minutes + DNS propagation (10-60 min)

1. **Buy domain at Porkbun:** 5 minutes, $9
2. **Add to Vercel:** 2 minutes
3. **Update nameservers:** 3 minutes
4. **Wait for DNS:** 10-60 minutes
5. **SSL auto-provisions:** 1-2 minutes
6. **Done!** ✅

---

## 🆘 Need Help?

- **Vercel Docs:** https://vercel.com/docs/concepts/projects/domains
- **Porkbun Support:** https://porkbun.com/support
- **DNS Checker:** https://dnschecker.org
- **SSL Checker:** https://www.ssllabs.com/ssltest/

---

## 🎉 Your Domain is Live!

Once setup is complete, your app will be available at:

```
✅ https://peasant-budget.com
✅ https://www.peasant-budget.com
✅ https://peasant-budget.vercel.app (still works!)
```

**All with free SSL and automatic HTTPS redirect!** 🔒

---

**peasant-budget: Now with a professional domain!** 🌐💰

Built with ❤️ for working-class people everywhere.
