import { useState, useEffect } from 'react'
import { DollarSign, Loader2, Lock, Eye, EyeOff, FileSpreadsheet } from 'lucide-react'
import TransactionForm from './components/TransactionForm'
import BulkImport from './components/BulkImport'
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
    addTransactions,
    updateTransaction,
    deleteTransaction,
    deleteTransactions,
    updatePayPeriodConfig,
    provider
  } = useStorage()

  // Passphrase unlock state (must be before any conditional returns)
  const [passphrase, setPassphrase] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  
  // Bulk import modal state
  const [showBulkImport, setShowBulkImport] = useState(false)

  // Pay period type (stored in payPeriodConfig)
  const payPeriodType = payPeriodConfig?.type || 'monthly'
  
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

  // Handle bulk import
  const handleBulkImport = (importedTransactions) => {
    addTransactions(importedTransactions)
    console.log(`Bulk imported ${importedTransactions.length} transactions`)
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

  // Check if error is encryption-related
  const isEncryptionError = error?.toLowerCase().includes('passphrase') || 
                            error?.toLowerCase().includes('decrypt')

  // Handle passphrase unlock
  const handleUnlock = async () => {
    if (!passphrase) return
    setUnlockError('')
    
    try {
      if (provider?.setPassphrase) {
        await provider.setPassphrase(passphrase)
        window.location.reload()
      }
    } catch (err) {
      setUnlockError('Invalid passphrase. Please try again.')
    }
  }

  // Error state - with passphrase input for encryption errors
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          {isEncryptionError ? (
            <>
              <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Data is Encrypted</h1>
              <p className="text-gray-400 mb-6">Enter your passphrase to unlock your budget data.</p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    placeholder="Enter passphrase"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 pr-12"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {unlockError && (
                  <p className="text-red-400 text-sm">{unlockError}</p>
                )}
                
                <button 
                  onClick={handleUnlock}
                  disabled={!passphrase}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
                >
                  Unlock
                </button>
                
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-gray-500 text-sm mb-3">Or start fresh:</p>
                  <button 
                    onClick={() => {
                      if (confirm('This will delete all local data. Are you sure?')) {
                        localStorage.clear()
                        window.location.reload()
                      }
                    }}
                    className="text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Clear all data and start over
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-gray-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Reload App
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImport 
          onImport={handleBulkImport} 
          onClose={() => setShowBulkImport(false)}
          existingTransactions={transactions}
        />
      )}

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkImport(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-300"
              title="Import from Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <StorageSettings />
          </div>
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
              onDeleteMultiple={deleteTransactions}
              onUpdate={updateTransaction}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
