/**
 * Shared category definitions
 * 
 * Aligned with credit industry standards for future credit repair app integration.
 * 
 * DEBT TYPES (per credit bureaus):
 * - Revolving: Credit cards, HELOCs, store cards (affects credit utilization)
 * - Installment: Auto loans, student loans, personal loans (fixed payments)
 * - Mortgage: Primary residence, investment properties
 * - Open: Charge cards, utility accounts (paid in full each month)
 * 
 * DTI RATIOS:
 * - Front-end (Housing): Mortgage + taxes + insurance / gross income (target: <28%)
 * - Back-end (Total): All debt payments / gross income (target: <36%)
 */

// Debt type classifications for credit scoring
export const DEBT_TYPES = {
  REVOLVING: 'revolving',      // Credit cards, HELOCs - affects utilization ratio
  INSTALLMENT: 'installment',  // Auto, student, personal loans - fixed payments
  MORTGAGE: 'mortgage',        // Housing debt - front-end DTI
  OPEN: 'open',                // Charge cards, utilities - paid monthly
  NONE: 'none'                 // Not a debt (groceries, entertainment, etc.)
}

// Category to debt type mapping for DTI calculations
export const CATEGORY_DEBT_TYPE = {
  'Rent/Mortgage': DEBT_TYPES.MORTGAGE,
  'Revolving Credit': DEBT_TYPES.REVOLVING,
  'Installment Loan': DEBT_TYPES.INSTALLMENT,
  'Auto Loan': DEBT_TYPES.INSTALLMENT,
  'Student Loan': DEBT_TYPES.INSTALLMENT,
  'Insurance': DEBT_TYPES.NONE,
  'Utilities': DEBT_TYPES.OPEN,
  'Groceries': DEBT_TYPES.NONE,
  'Transportation': DEBT_TYPES.NONE,
  'Entertainment': DEBT_TYPES.NONE,
  'Healthcare': DEBT_TYPES.NONE,
  'Education': DEBT_TYPES.NONE,
  'Dining Out': DEBT_TYPES.NONE,
  'Shopping': DEBT_TYPES.NONE,
  'Subscriptions': DEBT_TYPES.OPEN,
  'Income': DEBT_TYPES.NONE,
  'Other': DEBT_TYPES.NONE
}

export const CATEGORIES = [
  // Living Expenses
  'Groceries',
  'Dining Out',
  'Entertainment',
  'Shopping',
  'Subscriptions',
  
  // Housing (Front-end DTI)
  'Rent/Mortgage',
  'Utilities',
  
  // Debt Payments (Back-end DTI)
  'Revolving Credit',    // Credit cards, store cards, HELOCs
  'Installment Loan',    // Personal loans, auto loans
  'Auto Loan',           // Vehicle financing
  'Student Loan',        // Education debt
  
  // Other Fixed
  'Insurance',
  'Healthcare',
  'Education',
  'Transportation',
  
  // Income
  'Income',
  'Other'
]

export const CATEGORY_ICONS = {
  'Groceries': 'ShoppingCart',
  'Rent/Mortgage': 'Home',
  'Utilities': 'Zap',
  'Transportation': 'Car',
  'Entertainment': 'Film',
  'Healthcare': 'Heart',
  'Education': 'GraduationCap',
  'Dining Out': 'UtensilsCrossed',
  'Shopping': 'ShoppingBag',
  'Subscriptions': 'Repeat',
  'Insurance': 'Shield',
  'Revolving Credit': 'CreditCard',
  'Installment Loan': 'Landmark',
  'Auto Loan': 'Car',
  'Student Loan': 'GraduationCap',
  'Income': 'DollarSign',
  'Other': 'HelpCircle'
}

export const CATEGORY_COLORS = {
  'Groceries': 'text-green-400',
  'Rent/Mortgage': 'text-blue-400',
  'Utilities': 'text-yellow-400',
  'Transportation': 'text-purple-400',
  'Entertainment': 'text-pink-400',
  'Healthcare': 'text-red-400',
  'Education': 'text-cyan-400',
  'Dining Out': 'text-orange-400',
  'Shopping': 'text-indigo-400',
  'Subscriptions': 'text-teal-400',
  'Insurance': 'text-emerald-400',
  'Revolving Credit': 'text-amber-400',
  'Installment Loan': 'text-rose-400',
  'Auto Loan': 'text-violet-400',
  'Student Loan': 'text-sky-400',
  'Income': 'text-green-400',
  'Other': 'text-gray-400'
}
