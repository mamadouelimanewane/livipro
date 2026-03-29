import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.STOCKAGE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.STOCKAGE_ANON_KEY || 'placeholder-key'
if (!supabaseUrl.includes('placeholder')) {
  console.log('✅ Supabase connecté')
} else {
  console.warn('⚠️ Mode démonstration - données locales utilisées')
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
