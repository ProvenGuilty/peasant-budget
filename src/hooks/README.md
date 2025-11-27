# Hooks

Custom React hooks for reusable stateful logic.

## What Goes Here

- **Data hooks** - useTransactions, useBudget, usePayPeriod
- **Storage hooks** - useLocalStorage, usePersist
- **API hooks** - useAI, useFetch
- **UI hooks** - useModal, useToast, useDebounce

## Examples

- `useTransactions.js` - Manage transaction state and CRUD operations
- `useLocalStorage.js` - Sync state with LocalStorage
- `usePayPeriod.js` - Calculate and manage pay period state
- `useAI.js` - Call OpenAI API for categorization
- `useBudget.js` - Calculate budget vs actual, track spending

## Guidelines

- Start with "use" prefix
- Return state and functions
- Keep them focused and single-purpose
- Make them reusable across components

## Example Hook

```jsx
// useTransactions.js
import { useState, useEffect } from 'react'
import { loadFromStorage, saveToStorage } from '../utils/storageUtils'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const saved = loadFromStorage('transactions')
    if (saved) setTransactions(saved)
  }, [])

  const addTransaction = (transaction) => {
    const updated = [transaction, ...transactions]
    setTransactions(updated)
    saveToStorage('transactions', updated)
  }

  return { transactions, addTransaction }
}
```
