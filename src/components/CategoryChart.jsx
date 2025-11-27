import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { TrendingDown, DollarSign } from 'lucide-react'

// Category colors matching TransactionList
const CATEGORY_COLORS = {
  'Groceries': '#4ade80',
  'Rent/Mortgage': '#60a5fa',
  'Utilities': '#facc15',
  'Transportation': '#a78bfa',
  'Entertainment': '#f472b6',
  'Healthcare': '#f87171',
  'Dining Out': '#fb923c',
  'Shopping': '#818cf8',
  'Subscriptions': '#22d3ee',
  'Income': '#4ade80',
  'Other': '#9ca3af'
}

export default function CategoryChart({ transactions }) {
  // Filter only expenses
  const expenses = transactions.filter(t => t.type === 'expense')

  if (expenses.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Spending by Category</h2>
        </div>
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No expenses to display</p>
          <p className="text-sm text-gray-500 mt-2">Add some transactions to see your spending breakdown</p>
        </div>
      </div>
    )
  }

  // Group by category and calculate totals
  const categoryData = expenses.reduce((acc, transaction) => {
    const category = transaction.category || 'Other'
    if (!acc[category]) {
      acc[category] = {
        name: category,
        value: 0,
        count: 0,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']
      }
    }
    acc[category].value += transaction.amount
    acc[category].count += 1
    return acc
  }, {})

  // Convert to array and sort by value
  const chartData = Object.values(categoryData)
    .sort((a, b) => b.value - a.value)

  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0)

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null // Hide labels for small slices

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalSpending) * 100).toFixed(1)
      
      return (
        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-white mb-1">{data.name}</p>
          <p className="text-sm text-gray-300">
            Amount: <span className="font-bold text-red-400">${data.value.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-300">
            Percentage: <span className="font-bold">{percentage}%</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.count} transaction{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Spending by Category</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-red-400">${totalSpending.toFixed(2)}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown List */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-400 mb-3">Category Breakdown</p>
        {chartData.map((category, index) => {
          const percentage = ((category.value / totalSpending) * 100).toFixed(1)
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{category.name}</p>
                  <p className="text-xs text-gray-400">{category.count} transaction{category.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">${category.value.toFixed(2)}</p>
                <p className="text-xs text-gray-400">{percentage}%</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Top Spending Category */}
      {chartData.length > 0 && (
        <div className="mt-6 p-4 bg-red-900/30 border-2 border-red-500/50 rounded-lg">
          <p className="text-sm text-red-300 mb-1">Top Spending Category</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-white">{chartData[0].name}</p>
            <p className="text-xl font-bold text-red-400">
              ${chartData[0].value.toFixed(2)}
            </p>
          </div>
          <p className="text-xs text-red-300 mt-1">
            {((chartData[0].value / totalSpending) * 100).toFixed(1)}% of total spending
          </p>
        </div>
      )}
    </div>
  )
}
