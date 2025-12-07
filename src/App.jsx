import { useState, useEffect } from 'react'
import { DollarSign, Loader2 } from 'lucide-react'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import PayPeriodSelectorV2, { filterTransactionsByPeriod } from './components/PayPeriodSelectorV2'
import BudgetSummary from './components/BudgetSummary'
import SubscriptionDetector from './components/SubscriptionDetector'
import CategoryChart from './components/CategoryChart'
import AIInsights from './components/AIInsights'
import StorageSettings from './components/StorageSettings'
import { useStorage } from './storage'
import { getCurrentPayPeriod } from './utils/payPeriodUtils'

function App() {
  // Use the storage context for all data
  const {
    transactions,
    payPeriodConfig,
    isLoading,
    error,
    addTransaction,
    deleteTransaction,
    updatePayPeriodConfig
  } = useStorage()

  // Pay period type (stored in payPeriodConfig)
  const payPeriodType = payPeriodConfig?.type || 'bi-monthly'
  
  const setPayPeriodType = (type) => {
    updatePayPeriodConfig({ type })
  }
  
  // Current selected period
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    try {
      // Convert lastPayday from ISO string to Date if needed
      const config = {
        ...payPeriodConfig,
        lastPayday: payPeriodConfig?.lastPayday 
          ? new Date(payPeriodConfig.lastPayday)
          : new Date()
      }
      return getCurrentPayPeriod(payPeriodType, new Date(), config)
    } catch (error) {
      console.error('Error initializing pay period:', error)
      // Fallback to a simple bi-monthly period
      return {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
        payday: new Date(),
        nextPayday: new Date(),
        label: 'Current Period'
      }
    }
  })

  // Update period when type or config changes
  useEffect(() => {
    try {
      // Convert lastPayday from ISO string to Date if needed
      const config = {
        ...payPeriodConfig,
        lastPayday: payPeriodConfig?.lastPayday 
          ? new Date(payPeriodConfig.lastPayday)
          : new Date()
      }
      const newPeriod = getCurrentPayPeriod(payPeriodType, new Date(), config)
      setSelectedPeriod(newPeriod)
    } catch (error) {
      console.error('Error updating pay period:', error)
    }
  }, [payPeriodType, payPeriodConfig])

  const handleAddTransaction = (transaction) => {
    addTransaction(transaction)
    console.log('Transaction added:', transaction)
  }

  const handleDeleteTransaction = (id) => {
    deleteTransaction(id)
    console.log('Transaction deleted:', id)
  }

  // Filter transactions by selected pay period
  const filteredTransactions = filterTransactionsByPeriod(transactions || [], selectedPeriod)

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your budget data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Reload App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-10 h-10 text-green-500" />
            <div>
              <h1 className="text-4xl font-bold">budget.peasant.free</h1>
              <p className="text-sm text-gray-500 mt-1">Free as in freedom 🗽</p>
            </div>
          </div>
          <StorageSettings />
        </div>
        <p className="text-gray-400 mt-2">Everything a modern peasant needs 💰</p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {/* Pay Period Selector */}
        <div className="mb-6">
          <PayPeriodSelectorV2
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            payPeriodType={payPeriodType}
            onTypeChange={setPayPeriodType}
            config={payPeriodConfig}
          />
        </div>

        {/* Budget Summary & Subscription Detector */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <BudgetSummary transactions={filteredTransactions} />
          <SubscriptionDetector transactions={transactions} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <TransactionForm onSubmit={handleAddTransaction} />
            <CategoryChart transactions={filteredTransactions} />
            <AIInsights transactions={filteredTransactions} />
          </div>

          {/* Right Column */}
          <div>
            <TransactionList 
              transactions={filteredTransactions} 
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
