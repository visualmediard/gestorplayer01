import { supabase } from '../config/supabase'

// SQL para crear la tabla de programas (versión limpia)
export const CREATE_TABLE_SQL = `
-- Crear tabla de programas desde cero
CREATE TABLE public.programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    zones JSONB DEFAULT '[]'::jsonb,
    content INTEGER DEFAULT 0,
    last_modified TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones
CREATE POLICY "Allow all operations" ON public.programs
    FOR ALL USING (true);

-- Crear índice para mejorar rendimiento
CREATE INDEX idx_programs_created_at ON public.programs(created_at);

-- Verificar que la tabla se creó correctamente
SELECT * FROM public.programs;
`

// SQL para limpiar todo (eliminar tabla actual)
export const RESET_SUPABASE_SQL = `
-- Eliminar la tabla programs si existe
DROP TABLE IF EXISTS public.programs CASCADE;

-- Eliminar políticas RLS si existen  
DROP POLICY IF EXISTS "Allow all operations" ON public.programs;
`

export async function setupSupabase() {
  console.log('🔧 Verificando configuración de Supabase...')
  
  try {
    // Verificar conexión básica
    const { error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.warn('⚠️  Problema de autenticación:', authError)
    }
    
    // Intentar acceder a la tabla programs
    const { error: tableError } = await supabase
      .from('programs')
      .select('count')
      .limit(1)
    
    if (tableError) {
      if (tableError.code === 'PGRST116') {
        // Tabla no existe
        console.warn('⚠️  La tabla "programs" no existe')
        console.log('📋 Necesitas crear la tabla manualmente en tu dashboard de Supabase')
        console.log('🔗 Ve a: https://supabase.com/dashboard/project/YOUR_PROJECT/sql')
        console.log('💡 Ejecuta este SQL:')
        console.log(CREATE_TABLE_SQL)
        
        return {
          success: false,
          error: 'La tabla "programs" no existe. Créala manualmente.',
          sql: CREATE_TABLE_SQL,
          needsManualSetup: true
        }
      } else {
        console.error('❌ Error accediendo a la tabla:', tableError)
        return {
          success: false,
          error: `Error de base de datos: ${tableError.message}`,
          code: tableError.code
        }
      }
    }
    
    console.log('✅ Conexión a Supabase exitosa')
    console.log('✅ Tabla "programs" existe y es accesible')
    
    // Verificar que podemos insertar datos (permisos)
    const testId = 'test-connection-' + Date.now()
    const { error: insertError } = await supabase
      .from('programs')
      .insert([{
        id: testId,
        name: 'Test Connection',
        width: 1920,
        height: 1080,
        zones: [],
        content: 0,
        last_modified: new Date().toISOString(),
        description: 'Test program',
        created_at: new Date().toISOString()
      }])
    
    if (insertError) {
      console.warn('⚠️  No se pueden insertar datos:', insertError)
      
      // Intentar eliminar el registro de prueba si se creó
      await supabase.from('programs').delete().eq('id', testId)
      
      return {
        success: false,
        error: 'Sin permisos de escritura. Verifica las políticas RLS.',
        permissions: false
      }
    }
    
    // Limpiar registro de prueba
    await supabase.from('programs').delete().eq('id', testId)
    
    console.log('✅ Permisos de escritura verificados')
    console.log('✅ Configuración de Supabase completada')
    
    return {
      success: true,
      message: 'Supabase configurado correctamente'
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
    return {
      success: false,
      error: 'Error inesperado durante la configuración',
      details: error
    }
  }
}

// Mostrar instrucciones para configuración manual
export function showManualSetupInstructions() {
  console.log('📋 INSTRUCCIONES DE CONFIGURACIÓN MANUAL:')
  console.log('1. Ve a tu dashboard de Supabase')
  console.log('2. Navega a: SQL Editor')
  console.log('3. Ejecuta el siguiente SQL:')
  console.log(CREATE_TABLE_SQL)
  console.log('4. Recarga la aplicación')
}

// Ejecutar si es llamado directamente
if (typeof window === 'undefined') {
  setupSupabase().then(result => {
    console.log('Resultado:', result)
    process.exit(result.success ? 0 : 1)
  })
} 