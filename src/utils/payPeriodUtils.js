import { 
  startOfMonth, 
  endOfMonth, 
  addDays, 
  subDays,
  startOfWeek,
  endOfWeek,
  isWeekend,
  isFriday,
  format,
  isWithinInterval,
  addWeeks,
  subWeeks,
  getDay,
  isSameDay,
  parseISO
} from 'date-fns'

/**
 * US Federal Holidays (simplified - you can expand this)
 */
const US_HOLIDAYS_2024_2025 = [
  '2024-01-01', // New Year's Day
  '2024-07-04', // Independence Day
  '2024-12-25', // Christmas
  '2025-01-01', // New Year's Day
  '2025-07-04', // Independence Day
  '2025-12-25', // Christmas
  // Add more as needed
]

/**
 * Check if a date is a US federal holiday
 */
export function isHoliday(date) {
  const dateStr = format(date, 'yyyy-MM-dd')
  return US_HOLIDAYS_2024_2025.includes(dateStr)
}

/**
 * Check if date is a weekend or holiday
 */
export function isNonWorkingDay(date) {
  return isWeekend(date) || isHoliday(date)
}

/**
 * Adjust date to previous working day if it falls on weekend/holiday
 */
export function adjustToWorkingDay(date, direction = 'before') {
  let adjustedDate = new Date(date)
  
  if (direction === 'before') {
    // Move backwards to find working day
    while (isNonWorkingDay(adjustedDate)) {
      adjustedDate = subDays(adjustedDate, 1)
    }
  } else {
    // Move forwards to find working day
    while (isNonWorkingDay(adjustedDate)) {
      adjustedDate = addDays(adjustedDate, 1)
    }
  }
  
  return adjustedDate
}

/**
 * Get the most recent Friday (or Thursday if Friday is holiday)
 */
export function getPaydayFriday(referenceDate = new Date()) {
  let friday = referenceDate
  
  // Find most recent Friday
  while (getDay(friday) !== 5) { // 5 = Friday
    friday = subDays(friday, 1)
  }
  
  // Adjust if Friday is holiday/weekend
  return adjustToWorkingDay(friday, 'before')
}

/**
 * Calculate bi-weekly pay periods
 * @param {Date} lastPayday - Last known payday (Friday)
 * @param {Date} referenceDate - Date to calculate period for
 */
export function getBiWeeklyPeriod(lastPayday, referenceDate = new Date()) {
  // Find which bi-weekly period we're in
  let currentPayday = new Date(lastPayday)
  
  // Move forward to find the pay period containing referenceDate
  while (currentPayday < referenceDate) {
    currentPayday = addWeeks(currentPayday, 2)
    currentPayday = adjustToWorkingDay(currentPayday, 'before')
  }
  
  // If we went too far, go back one period
  if (currentPayday > referenceDate) {
    currentPayday = subWeeks(currentPayday, 2)
    currentPayday = adjustToWorkingDay(currentPayday, 'before')
  }
  
  const nextPayday = adjustToWorkingDay(addWeeks(currentPayday, 2), 'before')
  const periodStart = addDays(currentPayday, 1) // Day after last payday
  const periodEnd = currentPayday
  
  return {
    start: periodStart,
    end: periodEnd,
    payday: currentPayday,
    nextPayday: nextPayday,
    label: `${format(periodStart, 'MMM d')} - ${format(periodEnd, 'MMM d')}`
  }
}

/**
 * Calculate weekly pay periods (every Friday)
 */
export function getWeeklyPeriod(referenceDate = new Date()) {
  const payday = getPaydayFriday(referenceDate)
  const periodStart = addDays(payday, -6) // Previous Saturday
  const periodEnd = payday // This Friday
  const nextPayday = adjustToWorkingDay(addWeeks(payday, 1), 'before')
  
  return {
    start: periodStart,
    end: periodEnd,
    payday: payday,
    nextPayday: nextPayday,
    label: `${format(periodStart, 'MMM d')} - ${format(periodEnd, 'MMM d')}`
  }
}

/**
 * Calculate bi-monthly pay periods (15th and end of month)
 */
export function getBiMonthlyPeriod(referenceDate = new Date(), half = 'first') {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  
  if (half === 'first') {
    // 1st to 15th
    let periodStart = new Date(year, month, 1)
    let periodEnd = new Date(year, month, 15)
    
    // Adjust payday (15th) if weekend/holiday
    const payday = adjustToWorkingDay(periodEnd, 'before')
    
    return {
      start: periodStart,
      end: periodEnd,
      payday: payday,
      nextPayday: adjustToWorkingDay(endOfMonth(referenceDate), 'before'),
      label: `${format(periodStart, 'MMM d')} - ${format(periodEnd, 'MMM d')}`
    }
  } else {
    // 16th to end of month
    let periodStart = new Date(year, month, 16)
    let periodEnd = endOfMonth(referenceDate)
    
    // Adjust payday (last day) if weekend/holiday
    const payday = adjustToWorkingDay(periodEnd, 'before')
    
    return {
      start: periodStart,
      end: periodEnd,
      payday: payday,
      nextPayday: adjustToWorkingDay(new Date(year, month + 1, 15), 'before'),
      label: `${format(periodStart, 'MMM d')} - ${format(periodEnd, 'MMM d')}`
    }
  }
}

/**
 * Calculate monthly pay period
 */
export function getMonthlyPeriod(referenceDate = new Date()) {
  const periodStart = startOfMonth(referenceDate)
  const periodEnd = endOfMonth(referenceDate)
  const payday = adjustToWorkingDay(periodEnd, 'before')
  const nextPayday = adjustToWorkingDay(endOfMonth(addDays(periodEnd, 1)), 'before')
  
  return {
    start: periodStart,
    end: periodEnd,
    payday: payday,
    nextPayday: nextPayday,
    label: format(referenceDate, 'MMMM yyyy')
  }
}

/**
 * Get current pay period based on type
 */
export function getCurrentPayPeriod(type, referenceDate = new Date(), config = {}) {
  switch (type) {
    case 'weekly':
      return getWeeklyPeriod(referenceDate)
    
    case 'bi-weekly':
      // Requires lastPayday in config
      if (!config.lastPayday) {
        // Default to most recent Friday
        config.lastPayday = getPaydayFriday(referenceDate)
      }
      return getBiWeeklyPeriod(config.lastPayday, referenceDate)
    
    case 'bi-monthly':
      // Determine if we're in first or second half
      const day = referenceDate.getDate()
      const half = day <= 15 ? 'first' : 'second'
      return getBiMonthlyPeriod(referenceDate, half)
    
    case 'monthly':
      return getMonthlyPeriod(referenceDate)
    
    default:
      return getBiMonthlyPeriod(referenceDate, 'first')
  }
}

/**
 * Get all available periods for a given type and date range
 */
export function getAvailablePeriods(type, startDate, endDate, config = {}) {
  const periods = []
  let currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const period = getCurrentPayPeriod(type, currentDate, config)
    
    // Avoid duplicates
    const exists = periods.some(p => 
      isSameDay(p.start, period.start) && isSameDay(p.end, period.end)
    )
    
    if (!exists) {
      periods.push(period)
    }
    
    // Move to next period
    if (type === 'weekly') {
      currentDate = addWeeks(currentDate, 1)
    } else if (type === 'bi-weekly') {
      currentDate = addWeeks(currentDate, 2)
    } else if (type === 'bi-monthly') {
      currentDate = addDays(currentDate, 16) // Jump to next half
    } else if (type === 'monthly') {
      currentDate = addDays(endOfMonth(currentDate), 1)
    }
  }
  
  return periods
}

/**
 * Filter transactions by pay period
 */
export function filterTransactionsByPayPeriod(transactions, period) {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return isWithinInterval(transactionDate, {
      start: period.start,
      end: period.end
    })
  })
}

/**
 * Get days until next payday
 */
export function getDaysUntilPayday(period) {
  const today = new Date()
  const payday = period.nextPayday || period.payday
  const diffTime = payday - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
