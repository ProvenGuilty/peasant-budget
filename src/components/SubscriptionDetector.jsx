import { useState, useEffect } from 'react'
import { Repeat, AlertTriangle, TrendingUp, Sparkles, RefreshCw } from 'lucide-react'
import { detectSubscriptions } from '../utils/aiUtils'

export default function SubscriptionDetector({ transactions }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState(null)

  useEffect(() => {
    analyzeSubscriptions()
  }, [transactions.length]) // Re-analyze when transaction count changes

  const analyzeSubscriptions = async () => {
    if (transactions.length === 0) {
      setSubscriptions([])
      return
    }

    setIsLoading(true)
    try {
      const detected = await detectSubscriptions(transactions)
      setSubscriptions(detected)
      setLastAnalyzed(new Date())
    } catch (error) {
      console.error('Error analyzing subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalMonthlyCost = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0)
  const isHighCost = totalMonthlyCost > 100 // Alert if over $100/month
  const isWarning = totalMonthlyCost > 50 && totalMonthlyCost <= 100

  const getConfidenceBadge = (confidence) => {
    const colors = {
      high: 'bg-green-500/20 text-green-400 border-green-500/50',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      low: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
    return colors[confidence] || colors.low
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Repeat className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">Subscription Detector</h2>
        </div>
        <p className="text-gray-400 text-center py-8">
          Add transactions to detect recurring subscriptions
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg p-6 shadow-xl border-2 ${
      isHighCost 
        ? 'bg-red-900/30 border-red-500/50' 
        : isWarning 
        ? 'bg-yellow-900/30 border-yellow-500/50'
        : 'bg-gray-800 border-gray-700'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Repeat className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">Subscription Detector</h2>
          {isLoading && (
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
          )}
        </div>
        <button
          onClick={analyzeSubscriptions}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {/* Total Cost Summary */}
      <div className={`p-4 rounded-lg mb-6 ${
        isHighCost 
          ? 'bg-red-900/50 border-2 border-red-500' 
          : isWarning
          ? 'bg-yellow-900/50 border-2 border-yellow-500'
          : 'bg-purple-900/30 border-2 border-purple-500/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isHighCost ? (
              <AlertTriangle className="w-6 h-6 text-red-400" />
            ) : (
              <TrendingUp className="w-6 h-6 text-purple-400" />
            )}
            <div>
              <p className="text-sm text-gray-400">Total Monthly Subscriptions</p>
              <p className={`text-3xl font-bold ${
                isHighCost ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-purple-400'
              }`}>
                ${totalMonthlyCost.toFixed(2)}
              </p>
            </div>
          </div>
          {isHighCost && (
            <div className="text-right">
              <p className="text-sm font-semibold text-red-400">⚠️ Subscription Bleed</p>
              <p className="text-xs text-red-300">High monthly cost detected</p>
            </div>
          )}
          {isWarning && (
            <div className="text-right">
              <p className="text-sm font-semibold text-yellow-400">⚠️ Watch Out</p>
              <p className="text-xs text-yellow-300">Subscriptions adding up</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">
            {isLoading ? 'Analyzing transactions...' : 'No recurring subscriptions detected'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Add more transactions or try re-analyzing
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {subscriptions.map((sub, index) => (
              <div
                key={index}
                className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <Repeat className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{sub.service}</p>
                      <p className="text-xs text-gray-400 capitalize">{sub.frequency} billing</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-400">
                      ${sub.monthlyCost.toFixed(2)}/mo
                    </p>
                    <span className={`text-xs px-2 py-1 rounded border ${getConfidenceBadge(sub.confidence)}`}>
                      {sub.confidence}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Subscriptions Found</p>
                <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Annual Cost</p>
                <p className="text-2xl font-bold text-white">
                  ${(totalMonthlyCost * 12).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Last Analyzed */}
          {lastAnalyzed && (
            <p className="text-xs text-gray-500 text-center mt-4">
              Last analyzed: {lastAnalyzed.toLocaleTimeString()}
            </p>
          )}
        </>
      )}

      {/* AI Powered Badge */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-3 h-3" />
          <span>AI-powered pattern detection</span>
        </div>
      </div>
    </div>
  )
}
