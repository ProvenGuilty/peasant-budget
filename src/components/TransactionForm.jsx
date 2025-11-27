import { useState, useEffect } from 'react'
import { DollarSign, Calendar, FileText, Tag, Sparkles } from 'lucide-react'
import { getSmartSuggestions } from '../utils/aiUtils'

const CATEGORIES = [
  'Groceries',
  'Rent/Mortgage',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Dining Out',
  'Shopping',
  'Subscriptions',
  'Income',
  'Other'
]

export default function TransactionForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    type: 'expense',
    category: ''
  })

  const [errors, setErrors] = useState({})
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)

  // AI suggestion effect - triggers when description changes
  useEffect(() => {
    const getSuggestion = async () => {
      if (formData.description.length >= 3) {
        setIsLoadingSuggestion(true)
        try {
          const suggestion = await getSmartSuggestions(formData.description)
          setAiSuggestion(suggestion)
        } catch (error) {
          console.error('Error getting AI suggestion:', error)
        } finally {
          setIsLoadingSuggestion(false)
        }
      } else {
        setAiSuggestion(null)
      }
    }

    // Debounce: wait 500ms after user stops typing
    const timer = setTimeout(getSuggestion, 500)
    return () => clearTimeout(timer)
  }, [formData.description])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const acceptSuggestion = () => {
    if (aiSuggestion?.category) {
      setFormData(prev => ({
        ...prev,
        category: aiSuggestion.category
      }))
      setAiSuggestion(null)
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validate()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        id: Date.now(),
        timestamp: new Date().toISOString()
      })
      
      // Clear form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        type: 'expense',
        category: ''
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <DollarSign className="text-green-500" />
        Add Transaction
      </h2>

      {/* Type Toggle */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              formData.type === 'income'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            💰 Income
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              formData.type === 'expense'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            💸 Expense
          </button>
        </div>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description
          {isLoadingSuggestion && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              AI thinking...
            </span>
          )}
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What was this for?"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
        
        {/* AI Suggestion */}
        {aiSuggestion && aiSuggestion.category && aiSuggestion.category !== formData.category && (
          <div className="mt-2 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">
                  AI suggests: <strong>{aiSuggestion.category}</strong>
                </span>
                {aiSuggestion.isSubscription && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                    📅 Subscription?
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={acceptSuggestion}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
      >
        Add Transaction
      </button>
    </form>
  )
}
