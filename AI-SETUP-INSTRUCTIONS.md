# 🤖 AI Category Suggestions - Setup Instructions

## Step 1: Get Your OpenAI API Key

1. **Go to OpenAI**: https://platform.openai.com/signup
2. **Sign up or log in**
3. **Navigate to API Keys**: https://platform.openai.com/api-keys
4. **Create new key**:
   - Click "Create new secret key"
   - Name it: "peasant-budget"
   - **Copy the key immediately!** (You won't see it again)
5. **Add credits** (if needed):
   - New accounts get $5 free
   - Go to: https://platform.openai.com/account/billing

## Step 2: Add API Key to Your Project

1. **Open `.env` file** in your project root
2. **Replace the placeholder** with your actual key:
   ```
   VITE_OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-KEY-HERE
   ```
3. **Save the file**
4. **Restart your dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

## Step 3: Test It Out!

1. **Open your app** at http://localhost:5173
2. **Start typing a description**:
   - Type: "Starbucks coffee"
   - Wait 0.5 seconds
   - See AI suggest: "Dining Out" ✨
3. **Try more examples**:
   - "Netflix" → "Subscriptions"
   - "Walmart groceries" → "Groceries"
   - "Gas station" → "Transportation"
   - "Doctor visit" → "Healthcare"

## How It Works

### 1. **Debouncing**
- Waits 500ms after you stop typing
- Prevents API calls on every keystroke
- Saves money and improves UX

### 2. **AI Suggestion**
- Sends description to GPT-4o-mini
- Gets category suggestion back
- Shows purple suggestion box
- You can accept or ignore it

### 3. **Subscription Detection**
- Checks for subscription keywords
- Shows "📅 Subscription?" badge
- Helps you track recurring charges

### 4. **Cost**
- Each suggestion: ~$0.00006 (basically free!)
- Your $5 free credits: ~80,000 suggestions
- Super affordable!

## Troubleshooting

### "AI thinking..." never finishes
**Problem:** API key not configured or invalid

**Solution:**
1. Check `.env` file has correct key
2. Make sure key starts with `sk-`
3. Restart dev server
4. Check browser console for errors

### "Insufficient credits"
**Problem:** No credits in OpenAI account

**Solution:**
1. Go to: https://platform.openai.com/account/billing
2. Add payment method
3. Add $5-10 credits (will last forever for this app!)

### AI always suggests "Other"
**Problem:** API call failing silently

**Solution:**
1. Open browser console (F12)
2. Look for error messages
3. Check API key is valid
4. Verify you have credits

### Rate limit errors
**Problem:** Too many requests (free tier: 3/minute)

**Solution:**
- Wait a minute
- Or upgrade to paid tier (still super cheap)

## Security Notes

✅ **Safe:**
- `.env` file is in `.gitignore`
- API key never committed to GitHub
- Only used client-side (for now)

⚠️ **Important:**
- Never share your API key
- Never commit `.env` to GitHub
- Regenerate key if exposed

## What's Next?

Future improvements:
- [ ] Move API calls to backend (more secure)
- [ ] Cache common suggestions (save money)
- [ ] Learn from your corrections (improve accuracy)
- [ ] Batch suggestions (faster, cheaper)

---

**peasant-budget: Everything a modern peasant needs** 💰✨
