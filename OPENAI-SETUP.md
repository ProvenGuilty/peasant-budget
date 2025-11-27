# OpenAI API Setup Guide

## Get Your API Key

1. **Go to OpenAI Platform**
   - Visit: https://platform.openai.com/signup
   - Sign up or log in

2. **Navigate to API Keys**
   - Click your profile (top right)
   - Select "API keys"
   - Or go directly to: https://platform.openai.com/api-keys

3. **Create New Key**
   - Click "Create new secret key"
   - Name it: "peasant-budget"
   - Copy the key immediately (you won't see it again!)
   - Format: `sk-proj-...` (starts with sk-proj or sk-)

4. **Add Credits**
   - New accounts get $5 free credits
   - Go to: https://platform.openai.com/account/billing
   - Add payment method if needed
   - Check your credit balance

## Pricing (Very Cheap!)

**GPT-4o-mini** (what we'll use):
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

**For peasant-budget:**
- Each category suggestion: ~100 tokens
- Cost per suggestion: ~$0.00006 (basically free!)
- 1000 suggestions: ~$0.06

**Your $5 free credits = ~80,000 category suggestions!** 💰

## Security Notes

- ⚠️ Never commit API keys to GitHub
- ⚠️ Use environment variables
- ⚠️ Add `.env` to `.gitignore`
- ✅ Keys are safe in `.env` files locally

## Troubleshooting

**"Insufficient credits"**
- Add payment method at platform.openai.com/account/billing

**"Invalid API key"**
- Make sure you copied the full key
- Check for extra spaces
- Key should start with `sk-`

**"Rate limit exceeded"**
- Free tier: 3 requests per minute
- Wait a minute and try again
- Or upgrade to paid tier (still super cheap)
