// IMPORTANT: This client is only for server-side use and for public, read-only data.
// It uses the SERVICE_ROLE_KEY, which bypasses RLS.
// Do not use this for user-specific data or mutations unless you are absolutely sure about the security implications.

import { createClient } from '@supabase/supabase-js'

// Note: supabase-js is bugged and asks for the anon key even when the service role key is provided.
// The anon key is not actually used in this case.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!


export const serviceClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    },
    global: {
        headers: {
            Authorization: `Bearer ${supabaseServiceKey}`
        }
    }
});
