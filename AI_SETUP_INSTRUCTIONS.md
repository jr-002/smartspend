# AI Features Setup Instructions

## Overview

Your FinAssist SmartSpend application has AI features that are currently returning fallback responses. All Edge Functions are deployed and active, but they need the GROQ_API_KEY to be configured in Supabase.

## Current Status

✅ **Edge Functions Deployed**: All 4 AI Edge Functions are active
- ai-coach
- ai-insights
- budget-ai
- risk-prediction

⚠️ **GROQ_API_KEY Required**: This environment variable must be set in Supabase

## Quick Setup (3 Steps)

### Step 1: Get Your GROQ API Key

1. Visit https://console.groq.com
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key

### Step 2: Add Key to Supabase

1. Go to https://supabase.com/dashboard/project/gxvsmnmgrxovbsmdkdqf
2. Navigate to: Settings → Edge Functions → Secrets
3. Add new secret:
   - Name: `GROQ_API_KEY`
   - Value: [your copied key]
4. Save

### Step 3: Test

1. Wait 1-2 minutes for changes to propagate
2. Open your app
3. Try AI Financial Coach or Generate Insights
4. You should see AI-powered responses

## How to Verify It's Working

**Before (Fallback Mode):**
- Generic responses like "Track Your Spending"
- Basic budgeting tips

**After (AI Enabled):**
- Personalized financial insights based on your data
- Detailed analysis with specific numbers
- Context-aware recommendations

## Troubleshooting

**Still seeing fallback responses?**
- Verify key is correctly entered (no spaces)
- Wait 2-3 minutes after setting
- Clear browser cache
- Check Groq API key is active

**"Configuration Error"?**
- GROQ_API_KEY is missing or invalid
- Regenerate key from Groq Console
- Ensure key is at least 10 characters

## Rate Limits

- AI Coach: 5 requests/minute
- AI Insights: 3 requests/5 minutes
- Budget AI: 2 requests/5 minutes
- Risk Prediction: 2 requests/5 minutes

## Security

- API key stored server-side only
- Never exposed to frontend
- JWT verification enabled
- Rate limiting active

## Need Help?

Check:
1. Browser console for errors
2. Supabase Edge Functions logs
3. Groq API usage dashboard

---

The app works perfectly without AI - the fallback responses provide helpful tips. AI just makes it smarter!
