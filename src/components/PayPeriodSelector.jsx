import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  startOfMonth, 
  endOfMonth, 
  format, 
  isWithinInterval,
  addMonths,
  subMonths
} from 'date-fns'

export default function PayPeriodSelector({ selectedPeriod, onPeriodChange, currentMonth, onMonthChange }) {
  const getPayPeriods = (date) => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    
    // First period: 1st-15th
    const firstPeriodStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const firstPeriodEnd = new Date(date.getFullYear(), date.getMonth(), 15, 23, 59, 59)
    
    // Second period: 16th-end of month
    const secondPeriodStart = new Date(date.getFullYear(), date.getMonth(), 16)
    const secondPeriodEnd = monthEnd
    
    return {
      first: {
        id: 'first',
        label: '1st - 15th',
        start: firstPeriodStart,
        end: firstPeriodEnd,
        displayRange: `${format(firstPeriodStart, 'MMM d')} - ${format(firstPeriodEnd, 'MMM d')}`
      },
      second: {
        id: 'second',
        label: '16th - End',
        start: secondPeriodStart,
        end: secondPeriodEnd,
        displayRange: `${format(secondPeriodStart, 'MMM d')} - ${format(secondPeriodEnd, 'MMM d')}`
      }
    }
  }

  const periods = getPayPeriods(currentMonth)
  const currentPeriod = periods[selectedPeriod]

  const handlePreviousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    const today = new Date()
    onMonthChange(today)
    
    // Auto-select current period
    const dayOfMonth = today.getDate()
    const newPeriod = dayOfMonth <= 15 ? 'first' : 'second'
    onPeriodChange(newPeriod)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        
        <div className="text-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center">
            <Calendar className="w-5 h-5 text-green-500" />
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {currentPeriod.displayRange}
          </p>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Period Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => onPeriodChange('first')}
          className={`py-4 px-4 rounded-lg font-semibold transition-all ${
            selectedPeriod === 'first'
              ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="text-lg mb-1">{periods.first.label}</div>
          <div className="text-xs opacity-75">
            {format(periods.first.start, 'MMM d')} - {format(periods.first.end, 'd')}
          </div>
        </button>

        <button
          onClick={() => onPeriodChange('second')}
          className={`py-4 px-4 rounded-lg font-semibold transition-all ${
            selectedPeriod === 'second'
              ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="text-lg mb-1">{periods.second.label}</div>
          <div className="text-xs opacity-75">
            {format(periods.second.start, 'MMM d')} - {format(periods.second.end, 'd')}
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleToday}
          className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  )
}

// Helper function to filter transactions by pay period
export function filterTransactionsByPeriod(transactions, period, currentMonth) {
  const getPayPeriods = (date) => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    
    const firstPeriodStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const firstPeriodEnd = new Date(date.getFullYear(), date.getMonth(), 15, 23, 59, 59)
    
    const secondPeriodStart = new Date(date.getFullYear(), date.getMonth(), 16)
    const secondPeriodEnd = monthEnd
    
    return {
      first: { start: firstPeriodStart, end: firstPeriodEnd },
      second: { start: secondPeriodStart, end: secondPeriodEnd }
    }
  }

  const periods = getPayPeriods(currentMonth)
  const selectedPeriod = periods[period]

  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return isWithinInterval(transactionDate, {
      start: selectedPeriod.start,
      end: selectedPeriod.end
    })
  })
}
