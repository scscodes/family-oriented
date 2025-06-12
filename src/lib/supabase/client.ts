import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './database.types'

/**
 * Client-side Supabase client for use in React components, context, and hooks
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key
 */
export const createClient = () => {
  // Check if required environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '⚠️ Supabase environment variables are missing!\n' +
      'Required variables:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
      'For GitHub Actions/Pages deployment, add these as repository secrets.\n' +
      'For local development, add them to .env.local file.\n' +
      'See docs/environment-setup.md for detailed instructions.'
    );
  }

  return createClientComponentClient<Database>();
}