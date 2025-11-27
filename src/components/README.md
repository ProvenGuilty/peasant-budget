# Components

Reusable UI components that can be used throughout the app.

## What Goes Here

- **Form components** - TransactionForm, BudgetForm, etc.
- **Display components** - TransactionList, BudgetCard, Chart, etc.
- **Layout components** - Header, Footer, Sidebar, etc.
- **UI elements** - Button, Input, Modal, etc.

## Examples

- `TransactionForm.jsx` - Form to add transactions ✅
- `TransactionList.jsx` - Display list of transactions
- `BudgetSummary.jsx` - Show budget vs actual
- `PayPeriodToggle.jsx` - Switch between pay periods
- `CategoryChart.jsx` - Pie chart of spending by category

## Guidelines

- Each component should be self-contained
- Accept data via props
- Emit events via callbacks (onSubmit, onClick, etc.)
- Keep them reusable and generic
