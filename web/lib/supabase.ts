import { createClient } from '@supabase/supabase-js'

// Placeholders allow `next build` when env is not injected yet (e.g. Vercel preview without vars).
// Runtime requests still need real `NEXT_PUBLIC_SUPABASE_*` in the deployment environment.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
