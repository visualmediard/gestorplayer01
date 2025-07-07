import { supabase } from '../config/supabase.js';

// SQL para configurar correctamente Supabase Storage
const STORAGE_SETUP_SQL = `
-- Crear bucket público para archivos multimedia si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gestorplayer-media',
  'gestorplayer-media', 
  true,
  15728640, -- 15MB en bytes
  ARRAY['image/*', 'video/*']
) ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;

-- Política para permitir que cualquiera pueda ver los archivos (público)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'gestorplayer-media');

-- Política para permitir subida de archivos (anónimos)
CREATE POLICY "Anyone can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'gestorplayer-media');

-- Política para permitir actualización de archivos
CREATE POLICY "Anyone can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'gestorplayer-media');

-- Política para permitir eliminación de archivos
CREATE POLICY "Anyone can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'gestorplayer-media');
`;

export async function fixSupabaseStorage() {
  console.log('🔧 Configurando Supabase Storage...');
  
  try {
    // Ejecutar SQL para configurar storage
    const { error } = await supabase.rpc('exec_sql', { sql: STORAGE_SETUP_SQL });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      console.log('📋 Necesitas ejecutar manualmente este SQL en tu dashboard de Supabase:');
      console.log(STORAGE_SETUP_SQL);
      return {
        success: false,
        error: 'Error ejecutando SQL de configuración',
        needsManualSetup: true,
        sql: STORAGE_SETUP_SQL
      };
    }
    
    console.log('✅ Supabase Storage configurado correctamente');
    
    // Verificar que el bucket existe
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketError) {
      console.error('❌ Error verificando buckets:', bucketError);
      return {
        success: false,
        error: 'Error verificando buckets'
      };
    }
    
    const mediaBucket = buckets?.find(b => b.id === 'gestorplayer-media');
    if (!mediaBucket) {
      console.warn('⚠️ Bucket gestorplayer-media no encontrado');
      return {
        success: false,
        error: 'Bucket no encontrado',
        needsManualSetup: true,
        sql: STORAGE_SETUP_SQL
      };
    }
    
    console.log('✅ Bucket gestorplayer-media encontrado y configurado');
    
    return {
      success: true,
      message: 'Supabase Storage configurado correctamente'
    };
    
  } catch (error) {
    console.error('❌ Error general:', error);
    return {
      success: false,
      error: 'Error inesperado durante la configuración',
      details: error,
      needsManualSetup: true,
      sql: STORAGE_SETUP_SQL
    };
  }
}

// Función para mostrar instrucciones manuales
export function showStorageSetupInstructions() {
  console.log('📋 INSTRUCCIONES PARA CONFIGURAR SUPABASE STORAGE:');
  console.log('1. Ve a tu dashboard de Supabase');
  console.log('2. Navega a: SQL Editor');
  console.log('3. Ejecuta el siguiente SQL:');
  console.log(STORAGE_SETUP_SQL);
  console.log('4. Recarga la aplicación');
}

// Función para probar la configuración
export async function testStorageConfiguration() {
  console.log('🧪 Probando configuración de Storage...');
  
  try {
    // Intentar listar archivos en el bucket
    const { data: files, error } = await supabase
      .storage
      .from('gestorplayer-media')
      .list();
    
    if (error) {
      console.error('❌ Error accediendo al bucket:', error);
      return false;
    }
    
    console.log('✅ Acceso al bucket exitoso');
    console.log(`📁 Archivos en el bucket: ${files?.length || 0}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error probando configuración:', error);
    return false;
  }
} 