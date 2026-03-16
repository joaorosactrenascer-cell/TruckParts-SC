# TRUCKPARTS SC

A production-grade marketplace platform connecting truck drivers with suppliers of truck parts and installation services.

## Architecture

- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Storage, Edge Functions)
- **AI Module:** Visual detection, OCR, and image similarity search for truck parts.

## Project Structure

```
truckparts-platform/
âââ frontend/                # React application (src/)
âââ supabase/
â   âââ migrations/          # SQL database schema
â   âââ functions/           # Edge Functions (Deno)
âââ PROJECT_SPEC.md        # Project specifications
âââ README.md              # Setup instructions
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Supabase CLI installed (`npm install -g supabase`)
- Docker (required for local Supabase development)

### 2. Local Supabase Setup
1. Initialize Supabase:
   ```bash
   supabase init
   ```
2. Start local Supabase instance:
   ```bash
   supabase start
   ```
3. The migrations in `supabase/migrations` will automatically be applied.

### 3. Edge Functions
Deploy the edge functions locally:
```bash
supabase functions serve
```
To deploy to production:
```bash
supabase functions deploy
```

### 4. Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## AI Features
The platform includes mock Edge Functions for AI capabilities. In a production environment, these should be connected to:
- **Image Search:** OpenAI Vision or custom model
- **OCR:** Google Cloud Vision or AWS Textract
- **Embeddings:** OpenAI Embeddings API (`text-embedding-3-small`)

## License
MIT
