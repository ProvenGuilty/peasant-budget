import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Settings, Clock } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { 
  getCurrentPayPeriod, 
  getAvailablePeriods,
  getDaysUntilPayday 
} from '../utils/payPeriodUtils'
import { parseLocalDate, isDateInRange } from '../utils/dateUtils'

const PAY_PERIOD_TYPES = [
  { id: 'bi-monthly', label: 'Bi-Monthly', desc: '15th & End of Month' },
  { id: 'bi-weekly', label: 'Bi-Weekly', desc: 'Every 2 Weeks' },
  { id: 'weekly', label: 'Weekly', desc: 'Every Friday' },
  { id: 'monthly', label: 'Monthly', desc: 'Full Month' }
]

export default function PayPeriodSelectorV2({ 
  selectedPeriod, 
  onPeriodChange, 
  payPeriodType,
  onTypeChange,
  config 
}) {
  const [showSettings, setShowSettings] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get available periods for current month
  const periods = getAvailablePeriods(
    payPeriodType,
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
    config
  )

  const currentPeriod = selectedPeriod || periods[0]
  const daysUntilPayday = currentPeriod ? getDaysUntilPayday(currentPeriod) : 0

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    const todayPeriod = getCurrentPayPeriod(payPeriodType, today, config)
    onPeriodChange(todayPeriod)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      {/* Header with Settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-bold text-white">Pay Period</h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${
            showSettings ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <p className="text-sm font-semibold text-gray-300 mb-3">Pay Schedule Type</p>
          <div className="grid grid-cols-2 gap-2">
            {PAY_PERIOD_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => {
                  onTypeChange(type.id)
                  const newPeriod = getCurrentPayPeriod(type.id, currentMonth, config)
                  onPeriodChange(newPeriod)
                }}
                className={`p-3 rounded-lg text-left transition-all ${
                  payPeriodType === type.id
                    ? 'bg-green-600 text-white ring-2 ring-green-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-semibold text-sm">{type.label}</div>
                <div className="text-xs opacity-75">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        
        <div className="text-center">
          <p className="text-xl font-bold text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </p>
          {currentPeriod && (
            <p className="text-sm text-gray-400 mt-1">
              {currentPeriod.label}
            </p>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Period Selection */}
      <div className="space-y-2 mb-4">
        {periods.map((period, index) => {
          // Compare dates by day only (ignore time component)
          const periodStartDay = period.start.toDateString()
          const periodEndDay = period.end.toDateString()
          const selectedStartDay = currentPeriod?.start?.toDateString()
          const selectedEndDay = currentPeriod?.end?.toDateString()
          
          const isSelected = currentPeriod && 
            periodStartDay === selectedStartDay &&
            periodEndDay === selectedEndDay
          
          return (
            <button
              key={index}
              onClick={() => onPeriodChange(period)}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                isSelected
                  ? 'bg-green-600 text-white ring-2 ring-green-500'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{period.label}</p>
                  <p className="text-xs opacity-75 mt-1">
                    Payday: {format(period.payday, 'MMM d, yyyy')}
                  </p>
                </div>
                {isSelected && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{daysUntilPayday} days</span>
                    </div>
                    <p className="text-xs opacity-75">until payday</p>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleToday}
          className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          Current Period
        </button>
      </div>

      {/* Info */}
      {currentPeriod && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Next payday: {format(currentPeriod.nextPayday, 'MMM d')}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysUntilPayday} days away
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to filter transactions
export function filterTransactionsByPeriod(transactions, period) {
  if (!period) return transactions
  
  return transactions.filter(transaction => 
    isDateInRange(transaction.date, period.start, period.end)
  )
}
