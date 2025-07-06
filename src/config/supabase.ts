import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
// Estas variables deben ser configuradas en tu proyecto de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zspeoizdglawqvduxhbg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcGVvaXpkZ2xhd3F2ZHV4aGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzIwMDgsImV4cCI6MjA2NzQwODAwOH0.xHLLmuhuZWxmd4Q1MYWKfw_Y2SPm8U9HKgd7bQY6_x4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Verificar conexión
export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('programs').select('count').limit(1)
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no existe
      console.error('Error conectando a Supabase:', error)
      return false
    }
    console.log('✅ Conexión a Supabase exitosa')
    return true
  } catch (error) {
    console.error('Error de conexión:', error)
    return false
  }
} 