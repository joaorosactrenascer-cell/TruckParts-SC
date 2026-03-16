# 🚀 TruckParts SC - Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Service Role Key (for admin operations)
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services (Optional)
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key

# External Services (Optional)
VITE_GOOGLE_CLOUD_VISION_KEY=your-gcp-vision-key
VITE_AWS_TEXTRACT_ACCESS_KEY=your-aws-access-key
VITE_AWS_TEXTRACT_SECRET_KEY=your-aws-secret-key

# Development
VITE_DEV_MODE=true
VITE_DEBUG_AI=false
```

## How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project or create a new one
3. Go to Settings → API
4. Copy the **Project URL** and **anon public** key

## Setup Commands

```bash
# Create the environment file
cp ENV_SETUP.md .env.local.example

# Edit with your credentials
# Add your actual Supabase URL and keys

# Run validation
node scripts/validate-evolution.js
```

## Next Steps

After setting up environment variables:

1. **Apply migrations:**
   ```bash
   supabase db push
   ```

2. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## Troubleshooting

### Common Issues

1. **"Supabase URL not configured"**
   - Make sure `.env.local` exists in project root
   - Check that `VITE_SUPABASE_URL` is set correctly

2. **"Function not found" errors**
   - Run `supabase functions deploy` first
   - Check function names match exactly

3. **RLS permission errors**
   - Ensure migrations are applied: `supabase db push`
   - Check user authentication state

### Validation Commands

```bash
# Run full validation
node scripts/validate-evolution.js

# Run specific tests
npm test tests/evolution.test.js

# Check database connection
node scripts/validate-supabase.js
```

## Security Notes

- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly in production
- Enable Row Level Security (RLS) on all tables
