import { useState, useEffect } from 'react'

/**
 * Custom hook for syncing state with localStorage
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if nothing in localStorage
 * @returns {[value, setValue]} - State value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // Get from localStorage by key
      const item = window.localStorage.getItem(key)
      
      // Parse stored json or if none return initialValue
      if (item) {
        const parsed = JSON.parse(item)
        console.log(`📦 Loaded from localStorage [${key}]:`, parsed)
        return parsed
      } else {
        console.log(`📦 No data in localStorage [${key}], using initial value`)
        return initialValue
      }
    } catch (error) {
      // If error also return initialValue
      console.error(`❌ Error loading from localStorage [${key}]:`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        console.log(`💾 Saved to localStorage [${key}]:`, valueToStore)
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`❌ Error saving to localStorage [${key}]:`, error)
    }
  }

  // Optional: Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue)
          console.log(`🔄 localStorage changed in another tab [${key}]:`, newValue)
          setStoredValue(newValue)
        } catch (error) {
          console.error(`❌ Error parsing storage event [${key}]:`, error)
        }
      }
    }

    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', handleStorageChange)

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue]
}

/**
 * Clear a specific key from localStorage
 * @param {string} key - localStorage key to clear
 */
export function clearLocalStorage(key) {
  try {
    window.localStorage.removeItem(key)
    console.log(`🗑️ Cleared localStorage [${key}]`)
  } catch (error) {
    console.error(`❌ Error clearing localStorage [${key}]:`, error)
  }
}

/**
 * Clear all localStorage (use with caution!)
 */
export function clearAllLocalStorage() {
  try {
    window.localStorage.clear()
    console.log('🗑️ Cleared all localStorage')
  } catch (error) {
    console.error('❌ Error clearing all localStorage:', error)
  }
}
