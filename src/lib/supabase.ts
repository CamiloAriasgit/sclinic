import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Esto saldrá en tu terminal de VS Code, no en el navegador
console.log("--- DEBUG SUPABASE ---")
console.log("URL definida:", !!supabaseUrl) // Saldrá true o false
console.log("Key definida:", !!supabaseAnonKey) // Saldrá true o false
console.log("----------------------")

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan las variables de entorno de Supabase")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)