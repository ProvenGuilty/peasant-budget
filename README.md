# peasant-budget 💰

**Everything a modern peasant needs**

A smart, AI-powered budget tracking app for working-class people. Track expenses, detect subscriptions, get personalized insights, and take control of your finances.

---

## ✨ Features

- 🤖 **AI-Powered Category Suggestions** - Automatically categorizes transactions
- 📊 **Visual Spending Analysis** - Interactive pie charts and breakdowns
- 🔄 **Subscription Detection** - AI identifies recurring charges
- 💡 **Personalized Insights** - Smart financial advice tailored to you
- 📅 **Flexible Pay Periods** - Weekly, bi-weekly, bi-monthly, or monthly
- 🎯 **Budget Tracking** - See income, expenses, and remaining budget
- 💾 **Offline Storage** - Data persists in your browser (localStorage)
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS
- 📱 **Responsive** - Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### **1. Clone & Install:**
```bash
git clone https://github.com/ProvenGuilty/peasant-budget.git
cd peasant-budget
npm install
```

### **2. Set Up Environment:**
```bash
# Copy example env file
cp .env.example .env

# Add your OpenAI API key to .env
# Get key from: https://platform.openai.com/api-keys
```

### **3. Run Development Server:**
```bash
npm run dev
```

Visit: http://localhost:5173

---

## 🔑 OpenAI API Setup

AI features require an OpenAI API key:

1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Add to `.env` file:
   ```
   VITE_OPENAI_API_KEY=sk-proj-your-key-here
   ```

**Note:** App works without API key (uses fallback logic), but AI features are limited.

See [OPENAI-SETUP.md](OPENAI-SETUP.md) for detailed instructions.

---

## 📦 Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Dates:** date-fns
- **AI:** OpenAI GPT-4o-mini
- **Storage:** localStorage

---

## 🏗️ Project Structure

```
peasant-budget/
├── src/
│   ├── components/     # React components
│   │   ├── TransactionForm.jsx
│   │   ├── TransactionList.jsx
│   │   ├── BudgetSummary.jsx
│   │   ├── CategoryChart.jsx
│   │   ├── SubscriptionDetector.jsx
│   │   ├── AIInsights.jsx
│   │   └── PayPeriodSelectorV2.jsx
│   ├── hooks/          # Custom React hooks
│   │   └── useLocalStorage.js
│   ├── utils/          # Utility functions
│   │   ├── aiUtils.js
│   │   └── payPeriodUtils.js
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── docs/               # Documentation
│   ├── DEPLOYMENT.md
│   ├── OPENAI-SETUP.md
│   ├── LOCALSTORAGE-GUIDE.md
│   └── PAY-PERIOD-GUIDE.md
└── package.json
```

See [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) for details.

---

## 🎯 Usage Guide

### **Add Transactions:**
1. Fill in date, amount, description
2. Select income or expense
3. AI suggests category (or choose manually)
4. Click "Add Transaction"

### **View Spending:**
- **Budget Summary** - See totals and remaining budget
- **Category Chart** - Visual breakdown by category
- **Transaction List** - All transactions with details

### **AI Features:**
- **Category Suggestions** - Type description, get AI recommendation
- **Subscription Detection** - Finds recurring charges automatically
- **Financial Insights** - Personalized tips and advice

### **Pay Periods:**
- Click ⚙️ to select pay schedule type
- Choose: Weekly, Bi-weekly, Bi-monthly, or Monthly
- Automatically handles holidays and weekends

---

## 🚀 Deployment

### **Deploy to Vercel (Recommended):**

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variable: `VITE_OPENAI_API_KEY`
5. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### **Build for Production:**
```bash
npm run build
npm run preview
```

---

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to Vercel
- [OPENAI-SETUP.md](OPENAI-SETUP.md) - API key setup
- [LOCALSTORAGE-GUIDE.md](LOCALSTORAGE-GUIDE.md) - Data persistence
- [PAY-PERIOD-GUIDE.md](PAY-PERIOD-GUIDE.md) - Pay period system
- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - Code organization
- [AI-SETUP-INSTRUCTIONS.md](AI-SETUP-INSTRUCTIONS.md) - Testing AI features

---

## 🛠️ Development

### **Available Scripts:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Environment Variables:**
```bash
VITE_OPENAI_API_KEY=sk-proj-...  # OpenAI API key
```

---

## 🎨 Features Breakdown

### **Transaction Management:**
- Add/delete transactions
- Date, amount, description, category
- Income vs expense tracking
- AI-powered categorization

### **Budget Tracking:**
- Total income and expenses
- Remaining budget calculation
- Visual progress bar
- Color-coded status

### **Pay Period Filtering:**
- Weekly (every Friday)
- Bi-weekly (every 2 weeks)
- Bi-monthly (15th & end of month)
- Monthly (full month)
- Smart holiday/weekend handling

### **Data Visualization:**
- Interactive pie chart
- Category breakdown
- Top spending highlights
- Percentage calculations

### **AI Intelligence:**
- Category suggestions (debounced)
- Subscription detection
- Pattern recognition
- Personalized insights
- Encouraging financial advice

### **Data Persistence:**
- localStorage integration
- Survives page refreshes
- Cross-tab synchronization
- No backend required

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - feel free to use for personal or commercial projects.

---

## 🙏 Acknowledgments

- Built with React + Vite
- Styled with Tailwind CSS
- Powered by OpenAI
- Icons by Lucide
- Charts by Recharts

---

## 📧 Contact

Questions? Issues? Suggestions?
- Create an issue on GitHub
- Check documentation files
- Review code comments

---

**peasant-budget: Because even peasants deserve good financial tools** 💰✨

Built with ❤️ for working-class people everywhere.
