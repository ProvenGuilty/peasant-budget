/**
 * Date Utilities
 * 
 * Handles all date operations in LOCAL timezone to avoid UTC conversion issues.
 * All dates are stored as YYYY-MM-DD strings and parsed in local timezone.
 */

/**
 * Parse a date string (YYYY-MM-DD) into a local Date object
 * Avoids the UTC midnight issue that causes off-by-one errors
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date()
  
  // Already a Date object
  if (dateStr instanceof Date) {
    return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate())
  }
  
  // ISO string with time component - extract just the date part
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0]
  }
  
  // Parse YYYY-MM-DD format in local timezone
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day) // month is 0-indexed
  }
  
  // Fallback - try native parsing but normalize to midnight local
  const d = new Date(dateStr)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 */
export function formatLocalDate(date) {
  if (!date) return ''
  
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString() {
  return formatLocalDate(new Date())
}

/**
 * Create a date for a specific day in the current month
 */
export function createDateForDay(day, referenceDate = new Date()) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  return new Date(year, month, day)
}

/**
 * Compare two dates (ignoring time)
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareDates(a, b) {
  const dateA = parseLocalDate(a)
  const dateB = parseLocalDate(b)
  
  if (dateA < dateB) return -1
  if (dateA > dateB) return 1
  return 0
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(date, start, end) {
  const d = parseLocalDate(date)
  const s = parseLocalDate(start)
  const e = parseLocalDate(end)
  
  return d >= s && d <= e
}
