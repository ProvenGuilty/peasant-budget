# Custom Domain Quick Start

## 🚀 5-Minute Setup Guide

---

## Step 1: Buy Domain (5 minutes)

**Recommended: Porkbun** → https://porkbun.com

1. Search for domain: `peasant-budget.com`
2. Add to cart
3. Checkout (~$9/year)
4. ✅ Done!

---

## Step 2: Add to Vercel (2 minutes)

1. **Vercel Dashboard** → https://vercel.com/dashboard
2. Select `peasant-budget` project
3. **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter: `peasant-budget.com`
6. Click **"Add"**
7. **Copy the nameservers:**
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

---

## Step 3: Update Nameservers (3 minutes)

1. **Porkbun** → https://porkbun.com/account/domains
2. Click your domain
3. **Nameservers** tab
4. Select **"Use Custom Nameservers"**
5. Paste:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
6. Click **"Update"**

---

## Step 4: Wait (10-60 minutes)

⏱️ **DNS Propagation Time:** Usually 10-30 minutes

Check status: https://dnschecker.org

---

## Step 5: SSL Auto-Provisions (1-2 minutes)

✅ Vercel automatically:
- Provisions SSL certificate (Let's Encrypt)
- Enables HTTPS
- Redirects HTTP → HTTPS

**Nothing to do!** Just wait for "SSL Certificate: Active" ✅

---

## ✅ Done!

Your site is now live at:
- ✅ `https://peasant-budget.com`
- ✅ `https://www.peasant-budget.com`

**Total Cost:** $9/year
**Total Time:** 15 minutes + DNS wait

---

## 🎯 Cheapest Domain Registrars

| Registrar   | .com Price | Link                    |
|-------------|------------|-------------------------|
| **Porkbun** | **$9.13**  | https://porkbun.com     |
| Namecheap   | $8.98      | https://namecheap.com   |
| Cloudflare  | $9.77      | https://cloudflare.com  |

**Recommendation:** Porkbun (best value + free WHOIS privacy)

---

## 🆘 Troubleshooting

**Domain not working?**
- Wait 10-60 minutes for DNS
- Check: https://dnschecker.org
- Hard refresh: Ctrl+Shift+R

**SSL pending?**
- Wait for DNS to propagate first
- SSL auto-provisions after DNS is live

**Need help?**
- See: `CUSTOM-DOMAIN-GUIDE.md` (full guide)
- Vercel Docs: https://vercel.com/docs/concepts/projects/domains

---

**peasant-budget: Professional domain in 15 minutes!** 🌐💰
