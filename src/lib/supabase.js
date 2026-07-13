import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only the browser-safe Supabase URL and anon key belong in this client.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
