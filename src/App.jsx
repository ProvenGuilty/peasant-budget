import { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import PayPeriodSelectorV2, { filterTransactionsByPeriod } from './components/PayPeriodSelectorV2'
import BudgetSummary from './components/BudgetSummary'
import SubscriptionDetector from './components/SubscriptionDetector'
import CategoryChart from './components/CategoryChart'
import AIInsights from './components/AIInsights'
import { useLocalStorage } from './hooks/useLocalStorage'
import { getCurrentPayPeriod } from './utils/payPeriodUtils'

function App() {
  // Use localStorage for transactions - persists across page refreshes
  const [transactions, setTransactions] = useLocalStorage('peasant-budget-transactions', [])
  
  // Pay period settings
  const [payPeriodType, setPayPeriodType] = useLocalStorage('peasant-budget-pay-type', 'bi-monthly')
  const [payPeriodConfig, setPayPeriodConfig] = useLocalStorage('peasant-budget-pay-config', {
    lastPayday: new Date().toISOString() // For bi-weekly tracking
  })
  
  // Current selected period
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    try {
      // Convert lastPayday from ISO string to Date if needed
      const config = {
        ...payPeriodConfig,
        lastPayday: payPeriodConfig.lastPayday 
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

  // Update period when type changes
  useEffect(() => {
    try {
      // Convert lastPayday from ISO string to Date if needed
      const config = {
        ...payPeriodConfig,
        lastPayday: payPeriodConfig.lastPayday 
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
    setTransactions(prev => [transaction, ...prev])
    console.log('Transaction added:', transaction)
  }

  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
    console.log('Transaction deleted:', id)
  }

  // Filter transactions by selected pay period
  const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-10 h-10 text-green-500" />
          <h1 className="text-4xl font-bold">peasant-budget</h1>
        </div>
        <p className="text-gray-400">Everything a modern peasant needs 💰</p>
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
