# Vercel Deployment Configuration

## Environment Variables Setup

### Required Client-side Variables (Vercel Dashboard)

Set these variables in your Vercel project dashboard:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://gxvsmnmgrxovbsmdkdqf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dnNtbm1ncnhvdmJzbWRrZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTkyNTcsImV4cCI6MjA2ODA5NTI1N30.F2EPZdwx8Y7XTV1hqb4sas3kiUK77GzHuuqbh-Ah1ik

# Alternative naming (some deployments use this format)
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dnNtbm1ncnhvdmJzbWRrZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTkyNTcsImV4cCI6MjA2ODA5NTI1N30.F2EPZdwx8Y7XTV1hqb4sas3kiUK77GzHuuqbh-Ah1ik

# Application Configuration
VITE_APP_VERSION=1.0.0
NODE_ENV=production

# Optional Services
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### Server-side Configuration (Supabase Secrets)

Server-side API keys are managed through Supabase Secrets, not Vercel environment variables.

1. **Groq API Key**: Already configured in Supabase Secrets
2. **Supabase Service Role**: Already configured in Supabase Secrets

## Deployment Steps

### 1. Vercel Environment Variables
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all `VITE_*` variables listed above
3. Set different values for Preview/Development if needed

### 2. Build Configuration
The project uses Vite with environment validation:
- Environment variables are validated at build time
- Missing required variables will cause build failures
- Clear error messages help identify configuration issues

### 3. Runtime Validation
The application performs runtime validation:
- Validates Supabase URL format
- Checks for required environment variables
- Provides helpful error messages for missing configuration

## Security Notes

### What's Safe for Client-side
- Supabase URL and Anonymous Key (designed to be public)
- Application version and environment type
- Sentry DSN (public by design)

### What Must Stay Server-side
- Service role keys (managed in Supabase Secrets)
- API keys for external services (managed in Supabase Secrets)
- Database connection strings (managed by Supabase)

## Troubleshooting

### Build Failures
If deployment fails due to environment variables:
1. Check Vercel environment variables are set correctly
2. Verify variable names match exactly (including VITE_ prefix)
3. Ensure no extra quotes or spaces in values

### Runtime Errors
If the app loads but shows environment errors:
1. Check browser console for specific missing variables
2. Verify Supabase URL is accessible
3. Confirm environment variable names in Vercel dashboard

### Edge Function Issues
If AI features don't work:
1. Check Supabase Edge Function logs
2. Verify secrets are configured in Supabase dashboard
3. Test edge functions directly in Supabase dashboard