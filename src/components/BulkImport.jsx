/**
 * Bulk Import Component
 * 
 * Allows users to paste data from Google Sheets or Excel
 * to bulk add transactions.
 * 
 * Expected format (tab-separated):
 * Date | Description | Amount | Category (optional)
 * 
 * Example:
 * 2024-01-15	Grocery Store	45.99	Groceries
 * 2024-01-16	Electric Bill	120.00	Utilities
 */

import { useState } from 'react'
import { ClipboardPaste, X, Upload, AlertCircle, Check, FileSpreadsheet } from 'lucide-react'

const CATEGORIES = [
  'Groceries',
  'Rent/Mortgage',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Dining Out',
  'Shopping',
  'Subscriptions',
  'Income',
  'Other'
]

/**
 * Detect format based on header row or data structure
 */
function detectFormat(lines) {
  const firstLine = lines[0]?.toLowerCase() || ''
  
  // Check for user's bill tracking format (tab-separated with header)
  if (firstLine.includes('institution') || firstLine.includes('due date') || firstLine.includes('minimum')) {
    return 'bills'
  }
  
  // Check for vertical format (4 lines per record: name, day, amount, balance)
  // Detect by checking if line 2 is a small number (day of month) and line 3 is currency
  if (lines.length >= 4) {
    const line2 = lines[1]?.trim()
    const line3 = lines[2]?.trim()
    const isDay = /^\d{1,2}$/.test(line2)
    const isCurrency = /^\$[\d,]+\.?\d*$/.test(line3)
    
    if (isDay && isCurrency) {
      return 'vertical'
    }
  }
  
  return 'standard'
}

/**
 * Parse vertical format (4 lines per record):
 * Line 1: Institution name
 * Line 2: Due day (1-31)
 * Line 3: Payment amount
 * Line 4: Balance or "Monthly"
 */
function parseVerticalFormat(lines) {
  const transactions = []
  const errors = []
  
  // Process in chunks of 4 lines
  for (let i = 0; i < lines.length; i += 4) {
    const institution = lines[i]?.trim()
    const dueDay = lines[i + 1]?.trim()
    const payment = lines[i + 2]?.trim()
    const balance = lines[i + 3]?.trim() // Could be amount or "Monthly"
    
    if (!institution) continue
    
    const amount = parseAmount(payment)
    if (isNaN(amount)) {
      errors.push(`Record "${institution}": Invalid payment "${payment}"`)
      continue
    }
    
    // Allow $0 entries for tracking subscriptions with no current balance
    
    // Build date using due day in current month
    const now = new Date()
    const day = parseInt(dueDay, 10) || 1
    const date = new Date(now.getFullYear(), now.getMonth(), day)
    const dateStr = date.toISOString().split('T')[0]
    
    const category = matchCategory(institution)
    
    transactions.push({
      id: `bulk-${Date.now()}-${i}`,
      date: dateStr,
      description: institution,
      amount,
      type: 'expense',
      category,
      isRecurring: true
    })
  }
  
  return { transactions, errors }
}

/**
 * Parse CSV with proper handling of quoted fields containing commas
 */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  
  return result
}

/**
 * Parse user's bill tracking format (CSV):
 * Institution | Due Date | Account | Minimum | Balance Due | Last used | U | P | SQs | Interest | URL
 * Columns: 0=Institution, 1=Due Date, 2=Account(skip), 3=Minimum(payment), rest=skip
 */
function parseBillsFormat(parts, index) {
  const institution = parts[0]?.trim()
  const dueDay = parts[1]?.trim()
  const minimum = parts[3]?.trim() // Column 4 (0-indexed: 3) - the payment amount
  
  // Skip header row, empty rows, or summary rows
  if (!institution || 
      institution.toLowerCase() === 'institution' || 
      institution.toLowerCase().includes('total') ||
      institution === '') {
    return null
  }
  
  // Parse amount - handle negative values (credits/payments already made)
  let amount = parseAmount(minimum)
  if (isNaN(amount)) {
    return { error: `Line ${index + 1}: Invalid payment "${minimum}"` }
  }
  
  // Negative amounts mean already paid/credit - convert to positive expense
  const alreadyPaid = amount < 0
  amount = Math.abs(amount)
  
  // Build date using due day in current month (local timezone)
  const now = new Date()
  const day = parseInt(dueDay, 10) || 1
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 0-indexed to 1-indexed
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  
  console.log(`[BulkImport] ${institution}: day=${dueDay} -> ${dateStr}, amount=${amount}`)
  
  const category = matchCategory(institution)
  
  return {
    transaction: {
      id: `bulk-${Date.now()}-${index}`,
      date: dateStr,
      description: institution + (alreadyPaid ? ' (paid)' : ''),
      amount,
      type: 'expense',
      category,
      isRecurring: true
    }
  }
}

/**
 * Parse standard format: Date | Description | Amount | Category
 */
function parseStandardFormat(parts, index) {
  let date, description, amount, category, type

  // Check if first column looks like a date
  const firstIsDate = isValidDate(parts[0])
  
  if (firstIsDate) {
    date = parseDate(parts[0])
    description = parts[1]?.trim() || ''
    amount = parseAmount(parts[2])
    category = parts[3]?.trim() || ''
  } else {
    description = parts[0]?.trim() || ''
    amount = parseAmount(parts[1])
    date = parts[2] ? parseDate(parts[2]) : new Date().toISOString().split('T')[0]
    category = parts[3]?.trim() || ''
  }

  if (isNaN(amount) || amount === 0) {
    return { error: `Line ${index + 1}: Invalid amount` }
  }

  // Determine type based on amount sign or category
  if (amount < 0) {
    amount = Math.abs(amount)
    type = 'expense'
  } else if (category?.toLowerCase() === 'income' || description?.toLowerCase().includes('paycheck') || description?.toLowerCase().includes('salary')) {
    type = 'income'
  } else {
    type = 'expense'
  }

  return {
    transaction: {
      id: `bulk-${Date.now()}-${index}`,
      date,
      description: description || 'Imported transaction',
      amount,
      type,
      category: matchCategory(category || description)
    }
  }
}

/**
 * Parse pasted data from Google Sheets/Excel
 * Handles tab-separated and comma-separated values
 * Supports multiple formats: standard, bills tracking, and vertical
 */
function parseClipboardData(text, forcedFormat = 'auto') {
  const lines = text.trim().split('\n').filter(l => l.trim())
  const transactions = []
  const errors = []

  // Use forced format or auto-detect
  const format = forcedFormat === 'auto' ? detectFormat(lines) : forcedFormat
  console.log('[BulkImport] Using format:', format, forcedFormat === 'auto' ? '(auto-detected)' : '(manual)')

  // Vertical format is handled differently (multi-line per record)
  if (format === 'vertical') {
    return parseVerticalFormat(lines)
  }

  // Tab/comma separated formats
  lines.forEach((line, index) => {
    if (!line.trim()) return

    let parts
    
    // For bills format, use proper CSV parsing (handles quoted fields with commas)
    if (format === 'bills') {
      parts = parseCSVLine(line)
    } else {
      // Try tab-separated first (Google Sheets default), then comma
      parts = line.split('\t')
      if (parts.length < 2) {
        parts = line.split(',').map(p => p.trim())
      }
    }

    if (parts.length < 2) {
      errors.push(`Line ${index + 1}: Not enough columns`)
      return
    }

    let result
    if (format === 'bills') {
      result = parseBillsFormat(parts, index)
    } else {
      result = parseStandardFormat(parts, index)
    }

    if (!result) return // Skip (e.g., header row)
    
    if (result.error) {
      errors.push(result.error)
      return
    }

    if (result.transaction) {
      transactions.push(result.transaction)
    }
  })

  return { transactions, errors }
}

function isValidDate(str) {
  if (!str) return false
  // Check common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,  // 2024-01-15
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,  // 1/15/24 or 01/15/2024
    /^\d{1,2}-\d{1,2}-\d{2,4}$/,  // 1-15-24
  ]
  return datePatterns.some(p => p.test(str.trim()))
}

function parseDate(str) {
  if (!str) return new Date().toISOString().split('T')[0]
  
  const trimmed = str.trim()
  
  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }
  
  // MM/DD/YYYY or M/D/YY
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (slashMatch) {
    let [, month, day, year] = slashMatch
    if (year.length === 2) year = '20' + year
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  // Try native parsing as fallback
  const parsed = new Date(trimmed)
  if (!isNaN(parsed)) {
    return parsed.toISOString().split('T')[0]
  }
  
  return new Date().toISOString().split('T')[0]
}

function parseAmount(str) {
  if (!str) return NaN
  // Remove currency symbols, commas, spaces
  const cleaned = str.toString().replace(/[$€£,\s]/g, '').trim()
  // Handle parentheses as negative (accounting format)
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    return -parseFloat(cleaned.slice(1, -1))
  }
  return parseFloat(cleaned)
}

function matchCategory(text) {
  if (!text) return 'Other'
  
  const lower = text.toLowerCase()
  
  // Direct match
  const direct = CATEGORIES.find(c => c.toLowerCase() === lower)
  if (direct) return direct
  
  // Keyword matching
  const keywords = {
    'Groceries': ['grocery', 'food', 'supermarket', 'walmart', 'costco', 'trader'],
    'Rent/Mortgage': ['rent', 'mortgage', 'housing', 'apartment'],
    'Utilities': ['electric', 'gas', 'water', 'utility', 'power', 'internet', 'phone'],
    'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'transit', 'car', 'auto'],
    'Entertainment': ['netflix', 'spotify', 'movie', 'game', 'entertainment'],
    'Healthcare': ['doctor', 'medical', 'pharmacy', 'health', 'dental'],
    'Dining Out': ['restaurant', 'dining', 'takeout', 'doordash', 'grubhub'],
    'Shopping': ['amazon', 'target', 'shopping', 'clothes', 'store'],
    'Subscriptions': ['subscription', 'monthly', 'membership'],
    'Income': ['income', 'salary', 'paycheck', 'deposit', 'payment received']
  }
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w))) {
      return category
    }
  }
  
  return 'Other'
}

const FORMAT_OPTIONS = [
  { id: 'auto', label: 'Auto-detect' },
  { id: 'standard', label: 'Standard (Date | Description | Amount | Category)' },
  { id: 'vertical', label: 'Vertical (4 lines per record)' },
  { id: 'bills', label: 'Bills (Institution | Due Date | Account | Payment | ...)' }
]

export default function BulkImport({ onImport, onClose }) {
  const [pastedText, setPastedText] = useState('')
  const [preview, setPreview] = useState(null)
  const [parseErrors, setParseErrors] = useState([])
  const [selectedFormat, setSelectedFormat] = useState('auto')

  const parseWithFormat = (text, format) => {
    if (!text.trim()) {
      setPreview(null)
      setParseErrors([])
      return
    }
    const { transactions, errors } = parseClipboardData(text, format)
    setPreview(transactions)
    setParseErrors(errors)
  }

  const handlePaste = (e) => {
    const text = e.clipboardData?.getData('text') || ''
    setPastedText(text)
    parseWithFormat(text, selectedFormat)
  }

  const handleTextChange = (e) => {
    const text = e.target.value
    setPastedText(text)
    parseWithFormat(text, selectedFormat)
  }

  const handleFormatChange = (e) => {
    const format = e.target.value
    setSelectedFormat(format)
    parseWithFormat(pastedText, format)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === 'string') {
        setPastedText(text)
        parseWithFormat(text, selectedFormat)
      }
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-white">Bulk Import from Spreadsheet</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Format Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Data Format</label>
            <select
              value={selectedFormat}
              onChange={handleFormatChange}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              {FORMAT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Instructions */}
          <div className="mb-4 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300">
            <p className="font-medium mb-2">Copy rows from Google Sheets and paste below:</p>
            {selectedFormat === 'bills' ? (
              <p className="text-gray-400">
                Expected: <span className="text-green-400">Institution | Due Date | Account | Payment | ...</span>
              </p>
            ) : selectedFormat === 'vertical' ? (
              <p className="text-gray-400">
                Expected: <span className="text-green-400">4 lines per record (Name, Day, Amount, Balance)</span>
              </p>
            ) : (
              <p className="text-gray-400">
                Expected: <span className="text-green-400">Date | Description | Amount | Category</span>
              </p>
            )}
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 border-dashed rounded-lg cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">Choose CSV file...</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Or Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="text-gray-500 text-sm">or paste below</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Paste Area */}
          <textarea
            value={pastedText}
            onChange={handleTextChange}
            onPaste={handlePaste}
            placeholder="Paste your spreadsheet data here (Ctrl+V / Cmd+V)..."
            className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono text-sm resize-none"
          />

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                <AlertCircle className="w-4 h-4" />
                Some rows couldn't be parsed:
              </div>
              <ul className="text-xs text-red-300 space-y-1">
                {parseErrors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {parseErrors.length > 5 && (
                  <li>...and {parseErrors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
                <Check className="w-4 h-4" />
                {preview.length} transaction{preview.length !== 1 ? 's' : ''} ready to import:
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700 sticky top-0">
                    <tr>
                      <th className="text-left p-2 text-gray-300">Date</th>
                      <th className="text-left p-2 text-gray-300">Description</th>
                      <th className="text-right p-2 text-gray-300">Amount</th>
                      <th className="text-left p-2 text-gray-300">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((t, i) => (
                      <tr key={i} className="border-t border-gray-700">
                        <td className="p-2 text-gray-400">{t.date}</td>
                        <td className="p-2 text-white">{t.description}</td>
                        <td className={`p-2 text-right ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                        </td>
                        <td className="p-2 text-gray-400">{t.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!preview || preview.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import {preview?.length || 0} Transaction{preview?.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
