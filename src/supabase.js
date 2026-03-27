import { createClient } from '@supabase/supabase-js'

// Vite récupérera ces variables via le préfixe STOCKAGE_ configuré dans vite.config.js
// Injectées automatiquement lors du déploiement Vercel
const supabaseUrl = import.meta.env.STOCKAGE_URL
const supabaseAnonKey = import.meta.env.STOCKAGE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Attention: Les variables STOCKAGE_URL et STOCKAGE_ANON_KEY ne sont pas définies ! L'interface utilisera des données locales en attendant la connexion Vercel/Supabase.")
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)
