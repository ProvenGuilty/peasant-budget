# Authentication & Multi-User Roadmap

## 🎯 Current State

**Storage:** localStorage (browser-only, single user)
**Auth:** None (anyone can access)
**Data:** Client-side only

**Perfect for:** Personal use, testing, demos
**Not suitable for:** Multiple users, data sharing, cross-device sync

---

## 🔐 Future: Multi-User Support

### **Phase 1: Add Authentication (No Backend Yet)**

**Option A: Supabase (Recommended)** ⭐
- Free tier: 50,000 monthly active users
- Built-in auth (email, Google, GitHub, etc.)
- PostgreSQL database
- Real-time subscriptions
- Row-level security
- **Cost:** Free tier → $25/month (when you scale)

**Option B: Firebase**
- Google's platform
- Auth + Firestore database
- Real-time sync
- **Cost:** Free tier → Pay as you go

**Option C: Clerk**
- Modern auth UI
- Beautiful pre-built components
- **Cost:** Free tier (10,000 MAU) → $25/month

---

### **Phase 2: Backend Options**

#### **Option A: Supabase (Full Stack)**
```
Auth: ✅ Built-in
Database: ✅ PostgreSQL
API: ✅ Auto-generated REST & GraphQL
Storage: ✅ File uploads
Real-time: ✅ Subscriptions
Cost: ✅ Free tier generous
```

**Architecture:**
```
React App → Supabase Client → Supabase Cloud
                            ├── Auth
                            ├── PostgreSQL
                            └── Storage
```

---

#### **Option B: Vercel + Serverless Functions**
```
Frontend: Vercel (current)
Backend: Vercel Serverless Functions
Database: Vercel Postgres or Neon
Auth: Clerk or NextAuth
```

**Architecture:**
```
React App → Vercel Functions → Database
         → Clerk Auth
```

---

#### **Option C: Self-Hosted (Maximum Freedom)**
```
Frontend: Vercel
Backend: Your own server (Node.js/Express)
Database: PostgreSQL (self-hosted or managed)
Auth: Passport.js or custom
```

**Philosophy:** True freedom (but more work!)

---

## 🚀 Recommended Path: Supabase

### **Why Supabase?**
- ✅ Open source (aligns with "free as in freedom")
- ✅ Can self-host later if needed
- ✅ PostgreSQL (industry standard)
- ✅ Built-in auth
- ✅ Row-level security (users only see their data)
- ✅ Real-time updates
- ✅ Generous free tier
- ✅ Easy migration from localStorage

---

## 📋 Implementation Checklist

### **Step 1: Set Up Supabase**
- [ ] Create Supabase account
- [ ] Create new project
- [ ] Get API keys
- [ ] Add to Vercel env vars

### **Step 2: Database Schema**
```sql
-- Users table (auto-created by Supabase Auth)

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

### **Step 3: Install Supabase Client**
```bash
npm install @supabase/supabase-js
```

### **Step 4: Create Supabase Client**
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### **Step 5: Add Auth Component**
```jsx
// src/components/Auth.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) alert(error.message)
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-700 rounded"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="flex-1 p-2 bg-green-600 rounded hover:bg-green-700"
        >
          Sign In
        </button>
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="flex-1 p-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}
```

### **Step 6: Update App.jsx**
```jsx
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Show auth screen if not logged in
  if (!session) {
    return <Auth />
  }

  // Show app if logged in
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Your existing app */}
    </div>
  )
}
```

### **Step 7: Replace localStorage with Supabase**
```javascript
// Before: localStorage
const [transactions, setTransactions] = useLocalStorage('transactions', [])

// After: Supabase
const [transactions, setTransactions] = useState([])

useEffect(() => {
  fetchTransactions()
}, [])

async function fetchTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) console.error(error)
  else setTransactions(data)
}

async function addTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...transaction, user_id: session.user.id }])
    .select()
  
  if (error) console.error(error)
  else setTransactions([...data, ...transactions])
}

async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
  
  if (error) console.error(error)
  else setTransactions(transactions.filter(t => t.id !== id))
}
```

### **Step 8: Add Real-time Sync (Optional)**
```javascript
useEffect(() => {
  // Subscribe to changes
  const channel = supabase
    .channel('transactions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${session.user.id}`,
      },
      (payload) => {
        console.log('Change received!', payload)
        fetchTransactions() // Refresh data
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [session])
```

---

## 🎨 Migration Strategy

### **Option A: Hard Cutover**
1. Deploy new version with auth
2. Users lose localStorage data
3. Start fresh with accounts

**Pros:** Clean, simple
**Cons:** Data loss

---

### **Option B: Migration Tool**
1. Add "Import from localStorage" button
2. Let users migrate their data
3. One-time import on first login

**Pros:** No data loss
**Cons:** More complex

---

### **Option C: Dual Mode**
1. Keep localStorage mode
2. Add "Sign Up" button
3. Users choose when to migrate

**Pros:** Flexible, no pressure
**Cons:** Maintain two code paths

---

## 💰 Cost Estimates

### **Supabase Free Tier:**
```
Users: 50,000 MAU
Database: 500 MB
Storage: 1 GB
Bandwidth: 2 GB
API Requests: Unlimited
```

**When you outgrow free tier:**
```
Pro Plan: $25/month
- 100,000 MAU
- 8 GB database
- 100 GB storage
- 50 GB bandwidth
```

**For peasant-budget:**
- Free tier is plenty for personal use
- Could support hundreds of users
- Only pay when you scale

---

## 🔒 Security Features

### **Row Level Security (RLS):**
```sql
-- Users can ONLY see their own data
-- Enforced at database level
-- Even if your app has a bug, data is safe
```

### **Auth Features:**
- ✅ Email/password
- ✅ Magic links (passwordless)
- ✅ OAuth (Google, GitHub, etc.)
- ✅ Phone auth (SMS)
- ✅ MFA (multi-factor)

### **Data Privacy:**
- ✅ Each user's data isolated
- ✅ No cross-user data leaks
- ✅ Encrypted at rest
- ✅ Encrypted in transit (HTTPS)

---

## 🌐 Multi-Device Sync

**With Supabase:**
- ✅ Data syncs across devices automatically
- ✅ Use on phone, tablet, desktop
- ✅ Real-time updates (optional)
- ✅ Offline support (with local cache)

**Example:**
```
Add transaction on phone → Instantly appears on desktop
```

---

## 🎯 Recommended Timeline

### **Phase 1: Keep it Simple (Current)**
- ✅ localStorage
- ✅ Single user
- ✅ No backend
- ✅ Deploy and test

### **Phase 2: Add Auth (When Ready)**
- [ ] Set up Supabase
- [ ] Add auth UI
- [ ] Migrate to database
- [ ] Deploy with auth

### **Phase 3: Advanced Features**
- [ ] Real-time sync
- [ ] Shared budgets (family mode)
- [ ] Export/import
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

## 📚 Resources for Tomorrow

**Supabase:**
- Docs: https://supabase.com/docs
- Auth Guide: https://supabase.com/docs/guides/auth
- React Guide: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs

**Alternatives:**
- Firebase: https://firebase.google.com/docs/auth
- Clerk: https://clerk.com/docs
- NextAuth: https://next-auth.js.org

**Videos:**
- Supabase Crash Course: YouTube
- Building with Supabase + React: YouTube

---

## 🗽 Philosophy: Free as in Freedom

**Supabase Aligns:**
- ✅ Open source (can self-host)
- ✅ PostgreSQL (open standard)
- ✅ No vendor lock-in
- ✅ Export your data anytime
- ✅ Can migrate to self-hosted

**If you want MAXIMUM freedom:**
- Self-host Supabase
- Or build custom backend
- Full control, more work

---

## ✅ Summary

**Current:** localStorage, single user, no auth
**Next:** Supabase auth, multi-user, cloud sync
**Timeline:** When you're ready (no rush!)
**Cost:** Free for personal use
**Effort:** ~2-4 hours to implement

**For now:** Sleep well! Your app is deployed and working! 🎉

**Tomorrow:** Check if `budget.peasant.free` is live, then decide if you want to add auth.

---

**peasant.free: Building freedom, one feature at a time!** 🗽💰

Sweet dreams! 😴
