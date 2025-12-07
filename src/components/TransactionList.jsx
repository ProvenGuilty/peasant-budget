import { useState } from 'react'
import { 
  ShoppingCart, 
  Home, 
  Zap, 
  Car, 
  Film, 
  Heart, 
  UtensilsCrossed, 
  ShoppingBag, 
  Repeat, 
  DollarSign, 
  HelpCircle,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
  Trash
} from 'lucide-react'

// Category icon mapping
const CATEGORY_ICONS = {
  'Groceries': ShoppingCart,
  'Rent/Mortgage': Home,
  'Utilities': Zap,
  'Transportation': Car,
  'Entertainment': Film,
  'Healthcare': Heart,
  'Dining Out': UtensilsCrossed,
  'Shopping': ShoppingBag,
  'Subscriptions': Repeat,
  'Income': DollarSign,
  'Other': HelpCircle
}

// Category colors
const CATEGORY_COLORS = {
  'Groceries': 'text-green-400',
  'Rent/Mortgage': 'text-blue-400',
  'Utilities': 'text-yellow-400',
  'Transportation': 'text-purple-400',
  'Entertainment': 'text-pink-400',
  'Healthcare': 'text-red-400',
  'Dining Out': 'text-orange-400',
  'Shopping': 'text-indigo-400',
  'Subscriptions': 'text-cyan-400',
  'Income': 'text-green-400',
  'Other': 'text-gray-400'
}

export default function TransactionList({ transactions, onDelete, onDeleteMultiple }) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectMode, setSelectMode] = useState(false)

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 shadow-xl text-center">
        <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No transactions yet</h3>
        <p className="text-gray-500">Add your first transaction to get started!</p>
      </div>
    )
  }

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(transactions.map(t => t.id)))
    }
  }

  const deleteSelected = () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} transaction(s)?`)) return
    
    if (onDeleteMultiple) {
      onDeleteMultiple(Array.from(selectedIds))
    } else {
      // Fallback to deleting one by one
      selectedIds.forEach(id => onDelete(id))
    }
    setSelectedIds(new Set())
    setSelectMode(false)
  }

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || HelpCircle
    return Icon
  }

  const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || 'text-gray-400'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatAmount = (amount, type) => {
    const formatted = Math.abs(amount).toFixed(2)
    const sign = type === 'income' ? '+' : '-'
    return `${sign}$${formatted}`
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
            <p className="text-sm text-gray-400 mt-1">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectMode ? (
              <>
                <button
                  onClick={selectAll}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  {selectedIds.size === transactions.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  {selectedIds.size === transactions.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={deleteSelected}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                >
                  <Trash className="w-4 h-4" />
                  Delete ({selectedIds.size})
                </button>
                <button
                  onClick={() => { setSelectMode(false); setSelectedIds(new Set()) }}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setSelectMode(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                Select
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-gray-700">
        {transactions.map((transaction) => {
          const Icon = getCategoryIcon(transaction.category)
          const iconColor = getCategoryColor(transaction.category)
          const isIncome = transaction.type === 'income'

          const isSelected = selectedIds.has(transaction.id)

          return (
            <div
              key={transaction.id}
              className={`px-6 py-4 hover:bg-gray-700/50 transition-colors group ${isSelected ? 'bg-blue-500/10' : ''}`}
              onClick={selectMode ? () => toggleSelect(transaction.id) : undefined}
              style={selectMode ? { cursor: 'pointer' } : undefined}
            >
              {/* Mobile Layout (< md) */}
              <div className="md:hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    {selectMode && (
                      <div className="flex items-center">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    )}
                    <div className={`p-2 rounded-lg bg-gray-700 ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-400">{transaction.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="ml-2 p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between ml-11">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(transaction.date)}
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      isIncome ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                </div>
              </div>

              {/* Desktop Layout (>= md) */}
              <div className="hidden md:flex items-center justify-between">
                {/* Left: Checkbox + Icon + Description */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {selectMode && (
                    <div className="flex items-center">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  )}
                  <div className={`p-3 rounded-lg bg-gray-700 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-400">{transaction.category}</p>
                  </div>
                </div>

                {/* Middle: Date */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mx-4">
                  <Calendar className="w-4 h-4" />
                  {formatDate(transaction.date)}
                </div>

                {/* Right: Amount + Delete */}
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xl font-bold min-w-[120px] text-right ${
                      isIncome ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 bg-gray-900 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Balance</span>
          <span className="text-2xl font-bold text-white">
            ${transactions
              .reduce((sum, t) => {
                return sum + (t.type === 'income' ? t.amount : -t.amount)
              }, 0)
              .toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
