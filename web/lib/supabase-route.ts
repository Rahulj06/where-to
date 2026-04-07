import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Match `lib/supabase.ts` so route handlers never throw at construction (same as RSC client).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder'

export const createRouteSupabase = (): SupabaseClient =>
  createClient(supabaseUrl, supabaseAnonKey)
