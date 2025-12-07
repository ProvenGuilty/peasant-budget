import { describe, it, expect } from 'vitest'
import {
  parseLocalDate,
  formatLocalDate,
  getTodayString,
  createDateForDay,
  compareDates,
  isDateInRange
} from './dateUtils'

describe('dateUtils', () => {
  describe('parseLocalDate', () => {
    it('parses YYYY-MM-DD string correctly in local timezone', () => {
      const date = parseLocalDate('2025-12-01')
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(11) // December is 11 (0-indexed)
      expect(date.getDate()).toBe(1)
    })

    it('handles Date objects', () => {
      const input = new Date(2025, 11, 15) // Dec 15, 2025
      const date = parseLocalDate(input)
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(11)
      expect(date.getDate()).toBe(15)
    })

    it('strips time from ISO strings with time component', () => {
      const date = parseLocalDate('2025-12-25T14:30:00.000Z')
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(11)
      expect(date.getDate()).toBe(25)
    })

    it('returns today for null/undefined', () => {
      const today = new Date()
      const date = parseLocalDate(null)
      expect(date.getDate()).toBe(today.getDate())
    })
  })

  describe('formatLocalDate', () => {
    it('formats Date to YYYY-MM-DD', () => {
      const date = new Date(2025, 11, 7) // Dec 7, 2025
      expect(formatLocalDate(date)).toBe('2025-12-07')
    })

    it('pads single digit months and days', () => {
      const date = new Date(2025, 0, 5) // Jan 5, 2025
      expect(formatLocalDate(date)).toBe('2025-01-05')
    })

    it('returns empty string for null', () => {
      expect(formatLocalDate(null)).toBe('')
    })
  })

  describe('getTodayString', () => {
    it('returns today in YYYY-MM-DD format', () => {
      const today = new Date()
      const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      expect(getTodayString()).toBe(expected)
    })
  })

  describe('createDateForDay', () => {
    it('creates date for specific day in current month', () => {
      const refDate = new Date(2025, 11, 15) // Dec 15, 2025
      const date = createDateForDay(25, refDate)
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(11)
      expect(date.getDate()).toBe(25)
    })

    it('uses current month if no reference provided', () => {
      const today = new Date()
      const date = createDateForDay(10)
      expect(date.getMonth()).toBe(today.getMonth())
      expect(date.getDate()).toBe(10)
    })
  })

  describe('compareDates', () => {
    it('returns -1 when first date is earlier', () => {
      expect(compareDates('2025-12-01', '2025-12-15')).toBe(-1)
    })

    it('returns 1 when first date is later', () => {
      expect(compareDates('2025-12-15', '2025-12-01')).toBe(1)
    })

    it('returns 0 when dates are equal', () => {
      expect(compareDates('2025-12-07', '2025-12-07')).toBe(0)
    })
  })

  describe('isDateInRange', () => {
    it('returns true for date within range', () => {
      expect(isDateInRange('2025-12-15', '2025-12-01', '2025-12-31')).toBe(true)
    })

    it('returns true for date on start boundary', () => {
      expect(isDateInRange('2025-12-01', '2025-12-01', '2025-12-31')).toBe(true)
    })

    it('returns true for date on end boundary', () => {
      expect(isDateInRange('2025-12-31', '2025-12-01', '2025-12-31')).toBe(true)
    })

    it('returns false for date before range', () => {
      expect(isDateInRange('2025-11-30', '2025-12-01', '2025-12-31')).toBe(false)
    })

    it('returns false for date after range', () => {
      expect(isDateInRange('2026-01-01', '2025-12-01', '2025-12-31')).toBe(false)
    })

    it('handles Date objects mixed with strings', () => {
      const start = new Date(2025, 11, 1)
      const end = new Date(2025, 11, 31)
      expect(isDateInRange('2025-12-15', start, end)).toBe(true)
    })
  })
})
