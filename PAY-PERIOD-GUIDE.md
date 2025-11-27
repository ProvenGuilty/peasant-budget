# Pay Period System Guide

## Overview

The peasant-budget app now supports **4 different pay period types** with smart holiday and weekend handling!

---

## 📅 Pay Period Types

### 1. **Bi-Monthly** (Default)
- **Schedule:** 15th and end of month
- **How it works:**
  - **First period:** 1st to 15th
  - **Second period:** 16th to end of month
- **Payday adjustment:**
  - If 15th is weekend/holiday → moves to previous weekday
  - If last day is weekend/holiday → moves to previous weekday

**Example:**
```
December 2024:
- Period 1: Dec 1-15 (Payday: Dec 13 - Friday, since 15th is Sunday)
- Period 2: Dec 16-31 (Payday: Dec 31 - Tuesday)
```

---

### 2. **Bi-Weekly**
- **Schedule:** Every 2 weeks (typically Friday)
- **How it works:**
  - Tracks your last payday
  - Calculates 2-week intervals
  - Adjusts for holidays/weekends
- **Payday adjustment:**
  - If Friday is holiday → Thursday
  - If Friday is weekend → previous Friday

**Example:**
```
If last payday was Dec 6 (Friday):
- Period 1: Nov 23 - Dec 6
- Period 2: Dec 7 - Dec 20
- Period 3: Dec 21 - Jan 3
```

---

### 3. **Weekly**
- **Schedule:** Every Friday
- **How it works:**
  - Saturday to Friday periods
  - Always ends on Friday (or Thursday if Friday is holiday)
- **Payday adjustment:**
  - If Friday is holiday → Thursday
  - Automatically finds previous working day

**Example:**
```
December 2024:
- Week 1: Nov 30 - Dec 6 (Payday: Dec 6 - Friday)
- Week 2: Dec 7 - Dec 13 (Payday: Dec 13 - Friday)
- Week 3: Dec 14 - Dec 20 (Payday: Dec 20 - Friday)
- Week 4: Dec 21 - Dec 27 (Payday: Dec 27 - Friday)
```

---

### 4. **Monthly**
- **Schedule:** Full calendar month
- **How it works:**
  - 1st to last day of month
  - Payday is last working day of month
- **Payday adjustment:**
  - If last day is weekend/holiday → previous weekday

**Example:**
```
December 2024: Dec 1 - Dec 31
Payday: Dec 31 (Tuesday)

January 2025: Jan 1 - Jan 31
Payday: Jan 31 (Friday)
```

---

## 🎯 Smart Holiday/Weekend Handling

### How It Works:

1. **Weekend Detection:**
   - Saturday = weekend
   - Sunday = weekend

2. **Holiday Detection:**
   - US Federal Holidays (configurable)
   - New Year's Day, Independence Day, Christmas, etc.

3. **Payday Adjustment:**
   - If payday falls on weekend/holiday
   - Automatically moves to **previous working day**
   - Example: If payday is Saturday → moves to Friday

### Example Scenarios:

**Scenario 1: 15th falls on Sunday**
```
Normal: Payday Dec 15 (Sunday)
Adjusted: Payday Dec 13 (Friday) ✅
```

**Scenario 2: Last day is Saturday**
```
Normal: Payday Dec 31 (Saturday)
Adjusted: Payday Dec 29 (Thursday) ✅
```

**Scenario 3: Friday is July 4th (holiday)**
```
Normal: Payday July 4 (Friday - Holiday)
Adjusted: Payday July 3 (Thursday) ✅
```

---

## 🔧 How to Use

### 1. **Select Pay Period Type:**
- Click **Settings icon** (⚙️) in Pay Period selector
- Choose your pay schedule:
  - Bi-Monthly
  - Bi-Weekly
  - Weekly
  - Monthly

### 2. **Navigate Periods:**
- Use **← →** arrows to change months
- Click **"Current Period"** to jump to today
- Click any period to select it

### 3. **View Details:**
- See **payday date** for each period
- See **days until next payday**
- See **date range** for period

---

## 💾 Persistence

Your pay period settings are saved to localStorage:
- **Pay type** - Remembers your selection
- **Last payday** - For bi-weekly tracking
- **Survives page refresh** - Settings persist

---

## 🎨 Visual Features

### Pay Period Card:
```
┌─────────────────────────────────┐
│ 📅 Pay Period          ⚙️      │
├─────────────────────────────────┤
│        December 2024            │
│        Dec 1 - Dec 15           │
├─────────────────────────────────┤
│ [  Dec 1 - Dec 15  ]  ← Active │
│ Payday: Dec 13, 2024            │
│ 5 days until payday             │
├─────────────────────────────────┤
│ [  Dec 16 - Dec 31  ]           │
│ Payday: Dec 31, 2024            │
└─────────────────────────────────┘
```

### Settings Panel:
```
┌─────────────────────────────────┐
│ Pay Schedule Type               │
├─────────────────────────────────┤
│ [Bi-Monthly]  [Bi-Weekly]      │
│ 15th & End    Every 2 Weeks     │
│                                 │
│ [Weekly]      [Monthly]         │
│ Every Friday  Full Month        │
└─────────────────────────────────┘
```

---

## 📊 Transaction Filtering

Transactions are automatically filtered by selected period:
- **Budget Summary** - Shows period totals
- **Category Chart** - Shows period spending
- **Transaction List** - Shows period transactions
- **AI Insights** - Analyzes period data

---

## 🔍 Technical Details

### Date Calculations:

**Bi-Monthly:**
```javascript
// First half: 1st to 15th
start: Dec 1
end: Dec 15
payday: Dec 13 (adjusted from 15th)

// Second half: 16th to end
start: Dec 16
end: Dec 31
payday: Dec 31
```

**Bi-Weekly:**
```javascript
// Based on last payday
lastPayday: Dec 6
nextPayday: Dec 20 (2 weeks later)
period: Dec 7 - Dec 20
```

**Weekly:**
```javascript
// Saturday to Friday
start: Dec 7 (Saturday)
end: Dec 13 (Friday)
payday: Dec 13
```

**Monthly:**
```javascript
// Full month
start: Dec 1
end: Dec 31
payday: Dec 31
```

---

## 🛠️ Customization

### Add More Holidays:

Edit `src/utils/payPeriodUtils.js`:

```javascript
const US_HOLIDAYS_2024_2025 = [
  '2024-01-01', // New Year's Day
  '2024-07-04', // Independence Day
  '2024-12-25', // Christmas
  // Add your holidays here:
  '2024-11-28', // Thanksgiving
  '2024-12-24', // Christmas Eve
]
```

### Change Payday Logic:

Modify `adjustToWorkingDay()` function:

```javascript
// Move forward instead of backward
adjustToWorkingDay(date, 'after')

// Or custom logic
if (isFriday(date) && isHoliday(date)) {
  return subDays(date, 1) // Thursday
}
```

---

## 🎯 Use Cases

### **Scenario 1: Paid bi-weekly on Fridays**
- Select: **Bi-Weekly**
- App tracks every 2 weeks
- Adjusts if Friday is holiday

### **Scenario 2: Paid 15th and end of month**
- Select: **Bi-Monthly**
- App shows two periods per month
- Adjusts if dates are weekends

### **Scenario 3: Paid every Friday**
- Select: **Weekly**
- App shows weekly periods
- Always ends on Friday (or Thursday if holiday)

### **Scenario 4: Paid last day of month**
- Select: **Monthly**
- App shows full month
- Adjusts if last day is weekend

---

## 📝 Tips

1. **Set it once** - Your preference is saved
2. **Switch anytime** - Try different types
3. **Check payday** - See adjusted dates
4. **Track countdown** - Days until payday
5. **Filter automatically** - All views update

---

## 🚀 Future Enhancements

Possible additions:
- [ ] Custom pay schedules
- [ ] Multiple jobs/income sources
- [ ] Payday reminders
- [ ] Historical pay period comparison
- [ ] Export pay period reports

---

**peasant-budget: Everything a modern peasant needs** 💰📅
