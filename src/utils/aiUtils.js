/**
 * AI-powered category suggestion using OpenAI
 */

import { CATEGORIES } from './categories'

/**
 * Suggest a category based on transaction description
 * @param {string} description - Transaction description
 * @returns {Promise<string>} - Suggested category
 */
export async function suggestCategory(description) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('OpenAI API key not configured')
    return 'Other'
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a financial categorization assistant. Given a transaction description, suggest the most appropriate category from this list: ${CATEGORIES.join(', ')}. Respond with ONLY the category name, nothing else.`
          },
          {
            role: 'user',
            content: `Categorize this transaction: "${description}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 20
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return 'Other'
    }

    const data = await response.json()
    const suggestion = data.choices[0]?.message?.content?.trim()
    
    // Validate suggestion is in our category list
    if (CATEGORIES.includes(suggestion)) {
      return suggestion
    }
    
    // Fallback to fuzzy match
    const lowerSuggestion = suggestion?.toLowerCase()
    const match = CATEGORIES.find(cat => 
      cat.toLowerCase() === lowerSuggestion ||
      lowerSuggestion?.includes(cat.toLowerCase())
    )
    
    return match || 'Other'
    
  } catch (error) {
    console.error('Error suggesting category:', error)
    return 'Other'
  }
}

/**
 * Bulk categorize multiple transactions using AI
 * @param {Array} transactions - Array of {description, ...} objects
 * @returns {Promise<Array>} - Array of {description, suggestedCategory}
 */
export async function bulkCategorize(transactions) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('OpenAI API key not configured')
    return transactions.map(t => ({ ...t, suggestedCategory: 'Other' }))
  }

  // Build a list of descriptions
  const descriptions = transactions.map((t, i) => `${i + 1}. ${t.description}`).join('\n')

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a financial categorization assistant. Categorize each transaction into one of these categories: ${CATEGORIES.join(', ')}.

Respond with a JSON array of objects with "index" (1-based) and "category" fields. Example:
[{"index": 1, "category": "Utilities"}, {"index": 2, "category": "Entertainment"}]

Only respond with valid JSON, no markdown or explanation.`
          },
          {
            role: 'user',
            content: `Categorize these transactions:\n${descriptions}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      return transactions.map(t => ({ ...t, suggestedCategory: 'Other' }))
    }

    const data = await response.json()
    let content = data.choices[0]?.message?.content?.trim()
    
    // Strip markdown code blocks if present
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const suggestions = JSON.parse(content)
    
    // Map suggestions back to transactions
    return transactions.map((t, i) => {
      const suggestion = suggestions.find(s => s.index === i + 1)
      const category = suggestion?.category
      const validCategory = CATEGORIES.includes(category) ? category : 'Other'
      return { ...t, suggestedCategory: validCategory }
    })

  } catch (error) {
    console.error('Error bulk categorizing:', error)
    return transactions.map(t => ({ ...t, suggestedCategory: 'Other' }))
  }
}

/**
 * Detect if a transaction is likely a subscription
 * @param {string} description - Transaction description
 * @returns {boolean} - True if likely a subscription
 */
export function isLikelySubscription(description) {
  const subscriptionKeywords = [
    'netflix', 'spotify', 'hulu', 'disney', 'amazon prime',
    'apple music', 'youtube premium', 'subscription', 'monthly',
    'annual', 'membership', 'gym', 'insurance', 'phone plan',
    'internet', 'cable', 'streaming'
  ]
  
  const lowerDesc = description.toLowerCase()
  return subscriptionKeywords.some(keyword => lowerDesc.includes(keyword))
}

/**
 * Get smart suggestions based on description
 * @param {string} description - Transaction description
 * @returns {Promise<Object>} - Suggestions object
 */
export async function getSmartSuggestions(description) {
  if (!description || description.length < 3) {
    return {
      category: '',
      isSubscription: false,
      confidence: 0
    }
  }

  const [category] = await Promise.all([
    suggestCategory(description)
  ])

  return {
    category,
    isSubscription: isLikelySubscription(description),
    confidence: category !== 'Other' ? 0.8 : 0.3
  }
}

/**
 * Detect subscriptions from a list of transactions using AI
 * @param {Array} transactions - List of transactions
 * @returns {Promise<Array>} - Detected subscriptions
 */
export async function detectSubscriptions(transactions) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey || apiKey === 'your-api-key-here' || transactions.length === 0) {
    return []
  }

  // Group transactions by similar descriptions
  const groupedTransactions = groupSimilarTransactions(transactions)
  
  // Filter to only potential subscriptions (recurring patterns)
  const potentialSubscriptions = groupedTransactions.filter(group => 
    group.transactions.length >= 2 || isLikelySubscription(group.description)
  )

  if (potentialSubscriptions.length === 0) {
    return []
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a financial analyst specializing in subscription detection. Analyze transaction patterns and identify recurring subscriptions. For each subscription, provide:
1. Service name (e.g., "Netflix", "Spotify")
2. Monthly cost (average if varies)
3. Billing frequency (monthly, annual, etc.)
4. Confidence level (high, medium, low)

Respond ONLY with valid JSON array format:
[{"service": "Netflix", "monthlyCost": 15.99, "frequency": "monthly", "confidence": "high"}]`
          },
          {
            role: 'user',
            content: `Analyze these transactions and identify subscriptions:\n${JSON.stringify(
              potentialSubscriptions.map(g => ({
                description: g.description,
                amounts: g.transactions.map(t => t.amount),
                dates: g.transactions.map(t => t.date),
                count: g.transactions.length
              }))
            )}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      return fallbackSubscriptionDetection(potentialSubscriptions)
    }

    const data = await response.json()
    let content = data.choices[0]?.message?.content?.trim()
    
    try {
      // Strip markdown code blocks if present (```json ... ```)
      if (content.startsWith('```')) {
        content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      
      const subscriptions = JSON.parse(content)
      return Array.isArray(subscriptions) ? subscriptions : []
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return fallbackSubscriptionDetection(potentialSubscriptions)
    }
    
  } catch (error) {
    console.error('Error detecting subscriptions:', error)
    return fallbackSubscriptionDetection(potentialSubscriptions)
  }
}

/**
 * Group similar transactions together
 * @param {Array} transactions - List of transactions
 * @returns {Array} - Grouped transactions
 */
function groupSimilarTransactions(transactions) {
  const groups = {}
  
  transactions.forEach(transaction => {
    // Normalize description for grouping
    const normalized = transaction.description
      .toLowerCase()
      .replace(/[0-9]/g, '') // Remove numbers
      .replace(/[^a-z\s]/g, '') // Remove special chars
      .trim()
    
    if (!groups[normalized]) {
      groups[normalized] = {
        description: transaction.description,
        transactions: []
      }
    }
    
    groups[normalized].transactions.push(transaction)
  })
  
  return Object.values(groups)
}

/**
 * Fallback subscription detection without AI
 * @param {Array} groups - Grouped transactions
 * @returns {Array} - Detected subscriptions
 */
function fallbackSubscriptionDetection(groups) {
  return groups
    .filter(group => group.transactions.length >= 2)
    .map(group => {
      const avgAmount = group.transactions.reduce((sum, t) => sum + t.amount, 0) / group.transactions.length
      
      return {
        service: group.description,
        monthlyCost: avgAmount,
        frequency: 'monthly',
        confidence: isLikelySubscription(group.description) ? 'high' : 'medium'
      }
    })
}

/**
 * Generate AI-powered financial insights
 * @param {Array} transactions - Current period transactions
 * @param {Array} allTransactions - All transactions for comparison
 * @returns {Promise<Array>} - Array of insights
 */
export async function generateInsights(transactions, allTransactions = []) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey || apiKey === 'your-api-key-here' || transactions.length === 0) {
    return getFallbackInsights(transactions)
  }

  // Calculate key metrics
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const remaining = income - expenses
  
  // Category breakdown
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a friendly, encouraging financial advisor for working-class people. Analyze spending data and provide 3-5 actionable, personalized insights. Be supportive and helpful, never judgmental. Focus on:
- Spending patterns and trends
- Savings opportunities
- Budget health
- Subscription optimization
- Positive reinforcement

Respond ONLY with valid JSON array:
[{"type": "success|warning|tip", "title": "Short title", "message": "Helpful insight"}]

Types:
- success: Positive achievements
- warning: Areas needing attention (gentle)
- tip: Actionable suggestions`
          },
          {
            role: 'user',
            content: `Analyze this pay period:
Income: $${income}
Expenses: $${expenses}
Remaining: $${remaining}
Top spending: ${topCategories.map(([cat, amt]) => `${cat}: $${amt}`).join(', ')}
Transaction count: ${transactions.length}
Subscriptions detected: ${transactions.filter(t => t.category === 'Subscriptions').length}`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      return getFallbackInsights(transactions)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content?.trim()
    
    try {
      const insights = JSON.parse(content)
      return Array.isArray(insights) ? insights : getFallbackInsights(transactions)
    } catch (parseError) {
      console.error('Failed to parse AI insights:', parseError)
      return getFallbackInsights(transactions)
    }
    
  } catch (error) {
    console.error('Error generating insights:', error)
    return getFallbackInsights(transactions)
  }
}

/**
 * Generate fallback insights without AI
 * @param {Array} transactions - Transactions to analyze
 * @returns {Array} - Basic insights
 */
function getFallbackInsights(transactions) {
  const insights = []
  
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const remaining = income - expenses
  
  // Budget health
  if (remaining > 0) {
    const savingsRate = ((remaining / income) * 100).toFixed(0)
    insights.push({
      type: 'success',
      title: '💰 Staying on Track',
      message: `You have $${remaining.toFixed(2)} remaining this period. That's ${savingsRate}% of your income!`
    })
  } else if (remaining < 0) {
    insights.push({
      type: 'warning',
      title: '⚠️ Over Budget',
      message: `You've spent $${Math.abs(remaining).toFixed(2)} more than your income. Consider reviewing your expenses.`
    })
  }
  
  // Category analysis
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
  
  const topCategory = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])[0]
  
  if (topCategory) {
    const percentage = ((topCategory[1] / expenses) * 100).toFixed(0)
    insights.push({
      type: 'tip',
      title: `📊 Top Spending: ${topCategory[0]}`,
      message: `${topCategory[0]} accounts for ${percentage}% of your spending ($${topCategory[1].toFixed(2)}). Look for savings opportunities here.`
    })
  }
  
  // Subscription check
  const subscriptions = transactions.filter(t => isLikelySubscription(t.description))
  if (subscriptions.length > 0) {
    const subTotal = subscriptions.reduce((sum, t) => sum + t.amount, 0)
    insights.push({
      type: 'tip',
      title: '🔄 Subscription Check',
      message: `Found ${subscriptions.length} potential subscription(s) totaling $${subTotal.toFixed(2)}. Make sure you're using all of them!`
    })
  }
  
  // Transaction count
  if (transactions.length > 20) {
    insights.push({
      type: 'tip',
      title: '📝 Lots of Transactions',
      message: `You have ${transactions.length} transactions this period. Consider consolidating purchases to reduce fees and improve tracking.`
    })
  }
  
  return insights.slice(0, 5)
}
