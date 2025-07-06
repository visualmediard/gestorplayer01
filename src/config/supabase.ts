import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = 'https://zspeoizdglawqvduxhbg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcGVvaXpkZ2xhd3F2ZHV4aGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzIwMDgsImV4cCI6MjA2NzQwODAwOH0.xHLLmuhuZWxmd4Q1MYWKfw_Y2SPm8U9HKgd7bQY6_x4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Verificar conexión
export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('programs').select('count').limit(1)
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no existe
      return false
    }
    return true
  } catch (error) {
    return false
  }
} 