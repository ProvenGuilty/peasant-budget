# localStorage Persistence Guide

## What is localStorage?

**localStorage** is a browser API that lets you store data permanently on the user's device.

### Key Features:
- ✅ **Persistent** - Data survives page refreshes and browser restarts
- ✅ **Simple** - Key-value storage (like a dictionary)
- ✅ **Fast** - Synchronous, instant read/write
- ✅ **Large** - 5-10MB storage limit (plenty for our app)
- ✅ **Secure** - Data isolated per domain (can't be accessed by other sites)

### Limitations:
- ⚠️ **Strings only** - Must convert objects to JSON
- ⚠️ **Synchronous** - Blocks main thread (but very fast)
- ⚠️ **No expiration** - Data stays until manually cleared
- ⚠️ **Per browser** - Not synced across devices

---

## How It Works

### Basic API:

```javascript
// Save data
localStorage.setItem('key', 'value')

// Load data
const value = localStorage.getItem('key')

// Remove data
localStorage.removeItem('key')

// Clear everything
localStorage.clear()
```

### With Objects (JSON):

```javascript
// Save object
const user = { name: 'John', age: 30 }
localStorage.setItem('user', JSON.stringify(user))

// Load object
const savedUser = JSON.parse(localStorage.getItem('user'))
```

---

## Our Implementation

### 1. Custom Hook: `useLocalStorage`

Located in: `src/hooks/useLocalStorage.js`

**Purpose:** Makes localStorage work like React state

**Features:**
- ✅ Automatic JSON serialization
- ✅ Loads data on mount
- ✅ Saves data on change
- ✅ Syncs across browser tabs
- ✅ Error handling
- ✅ Console logging for debugging

**Usage:**

```javascript
// Instead of useState:
const [transactions, setTransactions] = useState([])

// Use useLocalStorage:
const [transactions, setTransactions] = useLocalStorage('my-key', [])
```

**That's it!** Everything else works exactly like `useState`.

---

## How Our App Uses It

### In `App.jsx`:

```javascript
// Before (no persistence):
const [transactions, setTransactions] = useState([])

// After (with persistence):
const [transactions, setTransactions] = useLocalStorage('peasant-budget-transactions', [])
```

### What Happens:

1. **On First Load:**
   - Checks localStorage for `'peasant-budget-transactions'`
   - If not found, uses `[]` (empty array)
   - Console: `📦 No data in localStorage, using initial value`

2. **When You Add a Transaction:**
   - Updates React state
   - Automatically saves to localStorage
   - Console: `💾 Saved to localStorage: [...]`

3. **On Page Refresh:**
   - Loads transactions from localStorage
   - Console: `📦 Loaded from localStorage: [...]`
   - Your data is back! ✨

4. **When You Delete a Transaction:**
   - Updates React state
   - Automatically saves updated array
   - Console: `💾 Saved to localStorage: [...]`

---

## Data Structure

### What's Stored:

**Key:** `peasant-budget-transactions`

**Value:** JSON array of transaction objects

```json
[
  {
    "id": 1701234567890,
    "date": "2024-12-05",
    "amount": 50.00,
    "description": "Groceries",
    "type": "expense",
    "category": "Groceries",
    "timestamp": "2024-12-05T10:30:00.000Z"
  },
  {
    "id": 1701234567891,
    "date": "2024-12-01",
    "amount": 2000.00,
    "description": "Paycheck",
    "type": "income",
    "category": "Income",
    "timestamp": "2024-12-01T08:00:00.000Z"
  }
]
```

---

## Testing localStorage

### View in Browser DevTools:

1. **Open DevTools** (F12)
2. **Go to "Application" tab** (Chrome) or "Storage" tab (Firefox)
3. **Click "Local Storage"** → Your domain
4. **See your data!**

### Console Logs:

Our hook logs everything:
```
📦 Loaded from localStorage [peasant-budget-transactions]: [...]
💾 Saved to localStorage [peasant-budget-transactions]: [...]
🔄 localStorage changed in another tab [peasant-budget-transactions]: [...]
```

### Test It:

1. **Add transactions** → Check DevTools → See data saved
2. **Refresh page** → Transactions still there! ✅
3. **Close browser** → Reopen → Still there! ✅
4. **Open in new tab** → Same data! ✅

---

## Advanced Features

### Cross-Tab Sync:

Our hook listens for changes in other tabs:

```javascript
// Open app in 2 tabs
// Add transaction in Tab 1
// Tab 2 automatically updates! 🔄
```

### Clear Data:

```javascript
import { clearLocalStorage } from './hooks/useLocalStorage'

// Clear transactions
clearLocalStorage('peasant-budget-transactions')

// Clear everything
clearAllLocalStorage()
```

---

## Error Handling

### What Could Go Wrong?

1. **Storage Full** (rare - 5MB is a lot)
   - Hook catches error
   - Falls back to in-memory state
   - Console: `❌ Error saving to localStorage`

2. **Corrupted Data**
   - Hook catches parse error
   - Uses initial value
   - Console: `❌ Error loading from localStorage`

3. **Private Browsing**
   - Some browsers disable localStorage
   - Hook handles gracefully
   - App still works (just no persistence)

---

## Best Practices

### ✅ DO:
- Use descriptive keys: `'peasant-budget-transactions'`
- Store structured data (arrays, objects)
- Handle errors gracefully
- Log for debugging

### ❌ DON'T:
- Store sensitive data (passwords, API keys)
- Store huge amounts of data (> 1MB)
- Assume localStorage always works
- Store functions (they don't serialize)

---

## Future Enhancements

### Could Add:
- **Versioning** - Handle data structure changes
- **Compression** - Store more data
- **Encryption** - Protect sensitive info
- **Cloud Sync** - Sync across devices
- **Export/Import** - Backup data

---

## Debugging Tips

### Data Not Saving?

1. Check console for errors
2. Check DevTools → Application → Local Storage
3. Try clearing and re-adding
4. Check browser privacy settings

### Data Not Loading?

1. Check console for parse errors
2. Inspect raw localStorage value
3. Try clearing corrupted data
4. Check key name matches

### Data Disappearing?

1. Check if in private/incognito mode
2. Check browser storage settings
3. Check if another script is clearing it
4. Check storage quota

---

## Summary

**localStorage** is perfect for our budget app because:
- ✅ Transactions persist across sessions
- ✅ No backend needed (yet!)
- ✅ Fast and simple
- ✅ Works offline
- ✅ Free and built-in

**Our `useLocalStorage` hook** makes it:
- ✅ Easy to use (just like `useState`)
- ✅ Automatic (saves on every change)
- ✅ Reliable (error handling)
- ✅ Debuggable (console logs)

---

**peasant-budget: Everything a modern peasant needs** 💰💾
