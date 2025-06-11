import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './database.types'

// Client-side Supabase client for use in React components, context, and hooks
export const createClient = () => createClientComponentClient<Database>()