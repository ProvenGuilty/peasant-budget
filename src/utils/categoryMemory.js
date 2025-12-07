/**
 * Category Memory
 * 
 * Learns and remembers category assignments for transaction descriptions.
 * Stored in localStorage for persistence.
 */

const STORAGE_KEY = 'peasant-budget-category-memory'

/**
 * Get the stored category mappings
 */
export function getCategoryMemory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error loading category memory:', error)
    return {}
  }
}

/**
 * Save category mappings
 */
function saveCategoryMemory(memory) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
  } catch (error) {
    console.error('Error saving category memory:', error)
  }
}

/**
 * Normalize a description for matching
 * Removes case sensitivity and common variations
 */
function normalizeDescription(description) {
  return description
    .toLowerCase()
    .replace(/\s*\(paid\)\s*/g, '')  // Remove (paid) suffix
    .replace(/\s*-\s*\d+\s*$/g, '')  // Remove trailing account numbers like "- 1234"
    .replace(/\s+/g, ' ')            // Normalize whitespace
    .trim()
}

/**
 * Learn a category assignment
 * @param {string} description - Transaction description
 * @param {string} category - Assigned category
 */
export function learnCategory(description, category) {
  if (!description || !category) return
  
  const memory = getCategoryMemory()
  const key = normalizeDescription(description)
  
  memory[key] = {
    category,
    lastUsed: new Date().toISOString(),
    count: (memory[key]?.count || 0) + 1
  }
  
  saveCategoryMemory(memory)
  console.log(`[CategoryMemory] Learned: "${key}" → ${category}`)
}

/**
 * Learn multiple category assignments at once
 * @param {Array} transactions - Array of {description, category}
 */
export function learnCategories(transactions) {
  if (!transactions?.length) return
  
  const memory = getCategoryMemory()
  const now = new Date().toISOString()
  
  transactions.forEach(t => {
    if (!t.description || !t.category) return
    
    const key = normalizeDescription(t.description)
    memory[key] = {
      category: t.category,
      lastUsed: now,
      count: (memory[key]?.count || 0) + 1
    }
  })
  
  saveCategoryMemory(memory)
  console.log(`[CategoryMemory] Learned ${transactions.length} categories`)
}

/**
 * Recall a category for a description
 * @param {string} description - Transaction description
 * @returns {string|null} - Remembered category or null
 */
export function recallCategory(description) {
  if (!description) return null
  
  const memory = getCategoryMemory()
  const key = normalizeDescription(description)
  
  return memory[key]?.category || null
}

/**
 * Apply remembered categories to transactions
 * @param {Array} transactions - Array of transactions
 * @returns {Array} - Transactions with remembered categories applied
 */
export function applyRememberedCategories(transactions) {
  if (!transactions?.length) return transactions
  
  const memory = getCategoryMemory()
  let appliedCount = 0
  
  const result = transactions.map(t => {
    const key = normalizeDescription(t.description)
    const remembered = memory[key]
    
    if (remembered?.category) {
      appliedCount++
      return { ...t, category: remembered.category, wasRemembered: true }
    }
    
    return t
  })
  
  if (appliedCount > 0) {
    console.log(`[CategoryMemory] Applied ${appliedCount} remembered categories`)
  }
  
  return result
}

/**
 * Get memory stats
 */
export function getCategoryMemoryStats() {
  const memory = getCategoryMemory()
  const entries = Object.entries(memory)
  
  return {
    totalMappings: entries.length,
    categories: [...new Set(entries.map(([, v]) => v.category))],
    mostUsed: entries
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([desc, data]) => ({ description: desc, ...data }))
  }
}

/**
 * Clear all category memory
 */
export function clearCategoryMemory() {
  localStorage.removeItem(STORAGE_KEY)
  console.log('[CategoryMemory] Cleared all memory')
}
