# Environment Setup for GitHub Actions & Pages Deployment

## Required Supabase Environment Variables

Your application requires the following environment variables to connect to Supabase:

```bash
# Your Supabase project URL (found in project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key (found in project settings -> API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Setting up GitHub Secrets

To configure these for GitHub Actions/Pages deployment:

### 1. Go to your GitHub repository
- Navigate to **Settings** → **Secrets and variables** → **Actions**

### 2. Add Repository Secrets
Click **New repository secret** and add:

- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Your Supabase project URL (e.g., `https://nlbpwlgmjcftktehxhyv.supabase.co`)

- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- **Value:** Your Supabase anon key (found in Supabase Dashboard → Settings → API)

### 3. Finding Your Supabase Values

1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project dashboard
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 4. Local Development Setup

For local development, create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit `.env.local` or any file containing your actual keys to version control.

## Verification

After setting up the secrets:
1. Push a commit to trigger the GitHub Action
2. Check the **Actions** tab to see if the build succeeds
3. Once deployed, verify the site loads without Supabase connection errors 