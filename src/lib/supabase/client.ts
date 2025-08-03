
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // The middleware ensures these variables are present before this code is ever called.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
