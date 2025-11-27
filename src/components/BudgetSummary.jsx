import { TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

export default function BudgetSummary({ transactions }) {
  // Calculate totals
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const remaining = income - expenses
  const spentPercentage = income > 0 ? (expenses / income) * 100 : 0

  // Determine status
  const isOverBudget = remaining < 0
  const isWarning = !isOverBudget && spentPercentage > 80
  const isGood = !isOverBudget && spentPercentage <= 80

  // Color schemes
  const getStatusColor = () => {
    if (isOverBudget) return {
      bg: 'bg-red-900/30',
      border: 'border-red-500/50',
      text: 'text-red-400',
      icon: 'text-red-400',
      progress: 'bg-red-500'
    }
    if (isWarning) return {
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      icon: 'text-yellow-400',
      progress: 'bg-yellow-500'
    }
    return {
      bg: 'bg-green-900/30',
      border: 'border-green-500/50',
      text: 'text-green-400',
      icon: 'text-green-400',
      progress: 'bg-green-500'
    }
  }

  const colors = getStatusColor()

  const getStatusMessage = () => {
    if (isOverBudget) {
      return {
        icon: AlertCircle,
        message: 'Over Budget',
        detail: `You've spent $${Math.abs(remaining).toFixed(2)} more than your income`
      }
    }
    if (isWarning) {
      return {
        icon: AlertCircle,
        message: 'Budget Warning',
        detail: `You've used ${spentPercentage.toFixed(0)}% of your income`
      }
    }
    return {
      icon: CheckCircle,
      message: 'On Track',
      detail: `You have ${(100 - spentPercentage).toFixed(0)}% of your income remaining`
    }
  }

  const status = getStatusMessage()
  const StatusIcon = status.icon

  return (
    <div className={`rounded-lg p-6 shadow-xl border-2 ${colors.bg} ${colors.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <DollarSign className="text-green-500" />
          Budget Summary
        </h2>
        <div className={`flex items-center gap-2 ${colors.text}`}>
          <StatusIcon className="w-5 h-5" />
          <span className="font-semibold">{status.message}</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Income */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Income</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${income.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {transactions.filter(t => t.type === 'income').length} transaction(s)
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-400">Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            ${expenses.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {transactions.filter(t => t.type === 'expense').length} transaction(s)
          </p>
        </div>

        {/* Remaining */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Remaining</span>
          </div>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(remaining).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {remaining >= 0 ? 'Available' : 'Over budget'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Budget Usage</span>
          <span className={`text-sm font-semibold ${colors.text}`}>
            {Math.min(spentPercentage, 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full ${colors.progress} transition-all duration-500 ease-out relative`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          >
            {spentPercentage > 100 && (
              <div className="absolute inset-0 bg-red-600 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
        <p className={`text-sm ${colors.text} font-medium`}>
          {status.detail}
        </p>
      </div>

      {/* Quick Stats */}
      {transactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Avg Transaction</p>
              <p className="text-lg font-semibold text-white">
                ${(expenses / Math.max(transactions.filter(t => t.type === 'expense').length, 1)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Transactions</p>
              <p className="text-lg font-semibold text-white">
                {transactions.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
