import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react'
import { generateInsights } from '../utils/aiUtils'

export default function AIInsights({ transactions }) {
  const [insights, setInsights] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastAnalyzed, setLastAnalyzed] = useState(null)

  useEffect(() => {
    analyzeTransactions()
  }, [transactions.length]) // Re-analyze when transaction count changes

  const analyzeTransactions = async () => {
    if (transactions.length === 0) {
      setInsights([])
      return
    }

    setIsLoading(true)
    try {
      const generatedInsights = await generateInsights(transactions)
      setInsights(generatedInsights)
      setLastAnalyzed(new Date())
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return TrendingUp
      case 'warning':
        return AlertCircle
      case 'tip':
        return Lightbulb
      default:
        return Sparkles
    }
  }

  const getInsightStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-900/30',
          border: 'border-green-500/50',
          icon: 'text-green-400',
          text: 'text-green-300'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-900/30',
          border: 'border-yellow-500/50',
          icon: 'text-yellow-400',
          text: 'text-yellow-300'
        }
      case 'tip':
        return {
          bg: 'bg-blue-900/30',
          border: 'border-blue-500/50',
          icon: 'text-blue-400',
          text: 'text-blue-300'
        }
      default:
        return {
          bg: 'bg-purple-900/30',
          border: 'border-purple-500/50',
          icon: 'text-purple-400',
          text: 'text-purple-300'
        }
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">AI Insights</h2>
        </div>
        <div className="text-center py-8">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">Add transactions to get personalized insights</p>
          <p className="text-sm text-gray-500 mt-2">AI will analyze your spending and provide helpful tips</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">AI Insights</h2>
          {isLoading && (
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
          )}
        </div>
        <button
          onClick={analyzeTransactions}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Insights List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No insights available yet</p>
          <p className="text-sm text-gray-500 mt-2">Add more transactions for better analysis</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type)
            const style = getInsightStyle(insight.type)
            
            return (
              <div
                key={index}
                className={`rounded-lg p-4 border-2 ${style.bg} ${style.border} hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.icon}`} />
                  <div className="flex-1">
                    <p className={`font-semibold mb-1 ${style.text}`}>
                      {insight.title}
                    </p>
                    <p className="text-sm text-gray-300">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            <span>Powered by AI</span>
          </div>
          {lastAnalyzed && (
            <span>Updated: {lastAnalyzed.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Insight Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-gray-400">Success</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-yellow-400" />
          <span className="text-gray-400">Warning</span>
        </div>
        <div className="flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-blue-400" />
          <span className="text-gray-400">Tip</span>
        </div>
      </div>
    </div>
  )
}
