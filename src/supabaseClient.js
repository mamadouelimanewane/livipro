import { createClient } from '@supabase/supabase-js'

// LiviPro B2B se branche sur LA MÊME base de données Supabase que LiviGo !
// L'URI et la clé viennent du même projet, permettant aux applications 
// d'interagir avec la même table "rides" ou "deliveries".
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_APP_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_APP_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
