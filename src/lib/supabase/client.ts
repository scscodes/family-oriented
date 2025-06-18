import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import { logger } from '@/utils/logger'

/**
 * Client-side Supabase client for use in React components, context, and hooks
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}