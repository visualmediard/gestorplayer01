import { supabase } from '../config/supabase'

// SQL para crear la tabla de límites de repeticiones
export const CREATE_REPETITION_LIMITS_TABLE_SQL = `
-- Crear tabla de límites de repeticiones
CREATE TABLE public.repetition_limits (
    id SERIAL PRIMARY KEY,
    content_id TEXT NOT NULL,
    daily_limit INTEGER NOT NULL DEFAULT -1,
    is_unlimited BOOLEAN NOT NULL DEFAULT true,
    daily_count INTEGER NOT NULL DEFAULT 0,
    last_play_date TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(content_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.repetition_limits ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones
CREATE POLICY "Allow all operations on repetition_limits" ON public.repetition_limits
    FOR ALL USING (true);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_repetition_limits_content_id ON public.repetition_limits(content_id);
CREATE INDEX idx_repetition_limits_last_play_date ON public.repetition_limits(last_play_date);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_repetition_limits_updated_at 
    BEFORE UPDATE ON public.repetition_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`

export async function setupRepetitionLimitsTable() {
  console.log('🔧 Configurando tabla de límites de repeticiones...')
  
  try {
    // Verificar si la tabla ya existe
    const { error: checkError } = await supabase
      .from('repetition_limits')
      .select('count')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ La tabla "repetition_limits" ya existe')
      return {
        success: true,
        message: 'Tabla de límites de repeticiones ya configurada'
      }
    }
    
    if (checkError.code === 'PGRST116') {
      // Tabla no existe, necesitamos crearla
      console.log('📋 La tabla "repetition_limits" no existe')
      console.log('🔗 Ve a tu dashboard de Supabase → SQL Editor')
      console.log('💡 Ejecuta este SQL:')
      console.log(CREATE_REPETITION_LIMITS_TABLE_SQL)
      
      return {
        success: false,
        error: 'La tabla "repetition_limits" no existe. Créala manualmente.',
        sql: CREATE_REPETITION_LIMITS_TABLE_SQL,
        needsManualSetup: true
      }
    } else {
      console.error('❌ Error accediendo a la tabla:', checkError)
      return {
        success: false,
        error: `Error de base de datos: ${checkError.message}`,
        code: checkError.code
      }
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

// Función para sincronizar límites locales con Supabase
export async function syncRepetitionLimitsToSupabase() {
  console.log('🔄 Sincronizando límites de repeticiones con Supabase...')
  
  try {
    // Obtener datos locales del localStorage
    const localData = localStorage.getItem('gestorplayer-repetitions')
    if (!localData) {
      console.log('ℹ️ No hay datos locales para sincronizar')
      return { success: true, message: 'No hay datos locales' }
    }
    
    const repetitionData = JSON.parse(localData)
    
    // Sincronizar cada límite
    for (const data of repetitionData) {
      const { error } = await supabase
        .from('repetition_limits')
        .upsert({
          content_id: data.contentId,
          daily_limit: data.dailyLimit,
          is_unlimited: data.isUnlimited,
          daily_count: data.dailyCount,
          last_play_date: data.lastPlayDate
        }, {
          onConflict: 'content_id'
        })
      
      if (error) {
        console.error(`❌ Error sincronizando límite para ${data.contentId}:`, error)
      } else {
        console.log(`✅ Límite sincronizado para ${data.contentId}`)
      }
    }
    
    console.log('✅ Sincronización completada')
    return { success: true, message: 'Sincronización completada' }
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error)
    return {
      success: false,
      error: 'Error durante la sincronización',
      details: error
    }
  }
}

// Función para cargar límites desde Supabase
export async function loadRepetitionLimitsFromSupabase() {
  console.log('📥 Cargando límites de repeticiones desde Supabase...')
  
  try {
    const { data, error } = await supabase
      .from('repetition_limits')
      .select('*')
    
    if (error) {
      console.error('❌ Error cargando límites:', error)
      return { success: false, error: error.message }
    }
    
    if (!data || data.length === 0) {
      console.log('ℹ️ No hay límites en Supabase')
      return { success: true, data: [] }
    }
    
    // Convertir formato de Supabase a formato local
    const localFormat = data.map(item => ({
      contentId: item.content_id,
      dailyLimit: item.daily_limit,
      isUnlimited: item.is_unlimited,
      dailyCount: item.daily_count,
      lastPlayDate: item.last_play_date
    }))
    
    // Guardar en localStorage
    localStorage.setItem('gestorplayer-repetitions', JSON.stringify(localFormat))
    
    console.log(`✅ Cargados ${localFormat.length} límites desde Supabase`)
    return { success: true, data: localFormat }
    
  } catch (error) {
    console.error('❌ Error cargando límites:', error)
    return {
      success: false,
      error: 'Error cargando límites',
      details: error
    }
  }
} 