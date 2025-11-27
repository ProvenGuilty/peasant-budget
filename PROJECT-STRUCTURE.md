# peasant-budget Project Structure

## 📁 Folder Organization

```
src/
├── components/       ✅ Reusable UI components
├── pages/            📄 Full page views
├── utils/            🛠️  Helper functions
├── hooks/            🪝 Custom React hooks
├── assets/           🖼️  Images, icons, static files
├── App.jsx           🏠 Main app component
├── main.jsx          🚀 App entry point
└── index.css         🎨 Global styles
```

---

## 📦 What Goes Where

### `components/` - Reusable UI Components
**Purpose:** Self-contained, reusable pieces of UI

**Examples:**
- `TransactionForm.jsx` - Form to add transactions ✅
- `TransactionList.jsx` - Display list of transactions
- `BudgetCard.jsx` - Show budget summary
- `CategoryChart.jsx` - Pie chart of spending
- `PayPeriodToggle.jsx` - Switch between pay periods

**Rules:**
- Accept data via props
- Emit events via callbacks
- No direct API calls or storage
- Keep them generic and reusable

---

### `pages/` - Full Page Views
**Purpose:** Compose components into full pages

**Examples:**
- `Dashboard.jsx` - Main overview (charts, summary, recent transactions)
- `Transactions.jsx` - Full transaction history with filters
- `Budget.jsx` - Budget planning and tracking
- `Insights.jsx` - AI-powered insights and recommendations
- `Settings.jsx` - App preferences and configuration

**Rules:**
- Orchestrate multiple components
- Handle page-level state
- Manage data fetching
- Business logic lives here

---

### `utils/` - Helper Functions
**Purpose:** Pure utility functions used throughout the app

**Examples:**
- `dateUtils.js` - Pay period calculations, date formatting
- `currencyUtils.js` - Money formatting, totals
- `transactionUtils.js` - Filter, sort, categorize
- `aiUtils.js` - OpenAI API integration
- `storageUtils.js` - LocalStorage helpers
- `validationUtils.js` - Form validation

**Rules:**
- Pure functions (no side effects)
- Well-tested
- Clear naming
- Good documentation

---

### `hooks/` - Custom React Hooks
**Purpose:** Reusable stateful logic

**Examples:**
- `useTransactions.js` - Manage transaction CRUD
- `useLocalStorage.js` - Sync state with storage
- `usePayPeriod.js` - Calculate pay periods
- `useAI.js` - AI categorization
- `useBudget.js` - Budget calculations

**Rules:**
- Start with "use" prefix
- Return state + functions
- Single responsibility
- Reusable across components

---

## 🎯 Development Workflow

### Adding a New Feature

1. **Create utilities** (if needed)
   ```bash
   src/utils/newFeatureUtils.js
   ```

2. **Create custom hook** (if needed)
   ```bash
   src/hooks/useNewFeature.js
   ```

3. **Create components**
   ```bash
   src/components/NewFeatureComponent.jsx
   ```

4. **Create page** (if needed)
   ```bash
   src/pages/NewFeaturePage.jsx
   ```

5. **Wire it up in App.jsx**

---

## 📝 Current Status

### ✅ Completed
- [x] Project structure set up
- [x] TransactionForm component
- [x] Basic transaction display
- [x] Tailwind CSS configured

### 🚧 In Progress
- [ ] Transaction persistence (LocalStorage)
- [ ] Pay period filtering
- [ ] AI categorization
- [ ] Budget tracking

### 📋 Planned
- [ ] Charts and visualizations
- [ ] Subscription detection
- [ ] AI insights
- [ ] Mobile responsive design
- [ ] Dark/light theme toggle

---

## 🎨 Design Principles

1. **Component-driven** - Build small, reusable pieces
2. **Separation of concerns** - UI vs logic vs data
3. **Pure functions** - Predictable, testable utilities
4. **Custom hooks** - Reusable stateful logic
5. **Clean code** - Readable, maintainable, documented

---

**peasant-budget: Everything a modern peasant needs** 💰
