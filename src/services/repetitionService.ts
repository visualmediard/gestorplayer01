import { supabase } from '../config/supabase'

interface RepetitionData {
  contentId: string;
  dailyCount: number;
  lastPlayDate: string;
  dailyLimit: number;
  isUnlimited: boolean;
}

export class RepetitionService {
  private static instance: RepetitionService;
  private storageKey = 'gestorplayer-repetitions';
  private isSupabaseEnabled = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: number = 0;
  private syncCallbacks: Array<() => void> = [];

  static getInstance(): RepetitionService {
    if (!RepetitionService.instance) {
      RepetitionService.instance = new RepetitionService();
    }
    return RepetitionService.instance;
  }

  // Obtener la fecha actual en formato YYYY-MM-DD
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Cargar datos de repeticiones del localStorage
  private loadRepetitionData(): RepetitionData[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  // Guardar datos de repeticiones en localStorage
  private saveRepetitionData(data: RepetitionData[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando datos de repeticiones:', error);
    }
  }

  // Obtener o crear datos de repetición para un contenido
  private getRepetitionData(contentId: string): RepetitionData | null {
    const allData = this.loadRepetitionData();
    return allData.find(data => data.contentId === contentId) || null;
  }

  // Actualizar datos de repetición para un contenido
  private updateRepetitionData(contentId: string, updates: Partial<RepetitionData>): void {
    const allData = this.loadRepetitionData();
    const index = allData.findIndex(data => data.contentId === contentId);
    
    if (index >= 0) {
      allData[index] = { ...allData[index], ...updates };
    } else {
      allData.push({
        contentId,
        dailyCount: 0,
        lastPlayDate: this.getCurrentDate(),
        dailyLimit: -1,
        isUnlimited: true,
        ...updates
      });
    }
    
    this.saveRepetitionData(allData);
  }

  // Configurar límite diario para un contenido
  async setDailyLimit(contentId: string, limit: number, isUnlimited: boolean = false): Promise<void> {
    this.updateRepetitionData(contentId, {
      dailyLimit: isUnlimited ? -1 : limit,
      isUnlimited
    });
    
    // Sincronizar con Supabase
    await this.syncLimitChange(contentId);
  }

  // Verificar si un contenido puede reproducirse hoy
  canPlayToday(contentId: string): boolean {
    const data = this.getRepetitionData(contentId);
    
    if (!data) {
      // Si no hay datos, puede reproducirse
      return true;
    }

    // Si es ilimitado, siempre puede reproducirse
    if (data.isUnlimited || data.dailyLimit === -1) {
      return true;
    }

    const today = this.getCurrentDate();
    
    // Si es un día diferente, resetear contador
    if (data.lastPlayDate !== today) {
      this.updateRepetitionData(contentId, {
        dailyCount: 0,
        lastPlayDate: today
      });
      return true;
    }

    // Verificar si aún puede reproducirse hoy
    return data.dailyCount < data.dailyLimit;
  }

  // Registrar una reproducción
  async recordPlayback(contentId: string): Promise<void> {
    const data = this.getRepetitionData(contentId);
    const today = this.getCurrentDate();
    
    if (!data) {
      // Crear nuevo registro
      this.updateRepetitionData(contentId, {
        dailyCount: 1,
        lastPlayDate: today
      });
      console.log(`🆕 Nuevo contenido reproducido - ID: ${contentId}, Contador: 1`);
    } else {
      // Si es un día diferente, resetear contador
      if (data.lastPlayDate !== today) {
        this.updateRepetitionData(contentId, {
          dailyCount: 1,
          lastPlayDate: today
        });
        console.log(`🗓️ Nuevo día detectado - ID: ${contentId}, Contador reseteado a: 1`);
      } else {
        // Incrementar contador del día
        const newCount = data.dailyCount + 1;
        this.updateRepetitionData(contentId, {
          dailyCount: newCount,
          lastPlayDate: today
        });
        console.log(`🔢 Reproducción registrada - ID: ${contentId}, Contador: ${newCount}, Límite: ${data.isUnlimited ? 'Ilimitado' : data.dailyLimit}`);
      }
    }
    
    // Sincronizar con Supabase después de registrar la reproducción
    await this.syncLimitChange(contentId);
  }

  // Obtener información de reproducción para un contenido
  getPlaybackInfo(contentId: string): { played: number; limit: number; canPlay: boolean; isUnlimited: boolean } {
    const data = this.getRepetitionData(contentId);
    const today = this.getCurrentDate();
    
    if (!data) {
      return { played: 0, limit: -1, canPlay: true, isUnlimited: true };
    }

    // Si es un día diferente, el contador se resetea
    const played = data.lastPlayDate === today ? data.dailyCount : 0;
    
    return {
      played,
      limit: data.dailyLimit,
      canPlay: this.canPlayToday(contentId),
      isUnlimited: data.isUnlimited
    };
  }

  // Obtener estadísticas específicas de un contenido (para sincronización)
  getContentStats(contentId: string): { reproductionsToday: number; dailyLimit: number; isUnlimited: boolean } | null {
    const data = this.getRepetitionData(contentId);
    const today = this.getCurrentDate();
    
    if (!data) {
      return null;
    }

    // Si es un día diferente, el contador se resetea
    const reproductionsToday = data.lastPlayDate === today ? data.dailyCount : 0;
    
    return {
      reproductionsToday,
      dailyLimit: data.dailyLimit,
      isUnlimited: data.isUnlimited
    };
  }

  // Limpiar datos de repetición para un contenido específico
  clearContentData(contentId: string): void {
    const allData = this.loadRepetitionData();
    const filteredData = allData.filter(data => data.contentId !== contentId);
    this.saveRepetitionData(filteredData);
    console.log(`🧹 Datos de repetición eliminados para contenido ID: ${contentId}`);
  }

  // Limpiar datos de repeticiones (para testing o mantenimiento)
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Obtener estadísticas generales
  getStats(): { totalContents: number; activeToday: number; completedToday: number } {
    const allData = this.loadRepetitionData();
    const today = this.getCurrentDate();
    
    let activeToday = 0;
    let completedToday = 0;
    
    allData.forEach(data => {
      if (data.lastPlayDate === today) {
        if (data.isUnlimited || data.dailyCount < data.dailyLimit) {
          activeToday++;
        } else {
          completedToday++;
        }
      }
    });
    
    return {
      totalContents: allData.length,
      activeToday,
      completedToday
    };
  }

  // Obtener todas las estadísticas como array para debugging
  getAllStats(): Array<{
    contentId: string;
    reproductionsToday: number;
    dailyLimit: number;
    lastPlayDate: string;
    canPlayToday: boolean;
    isUnlimited: boolean;
  }> {
    const allData = this.loadRepetitionData();
    const today = this.getCurrentDate();
    
    return allData.map(data => ({
      contentId: data.contentId,
      reproductionsToday: data.lastPlayDate === today ? data.dailyCount : 0,
      dailyLimit: data.dailyLimit,
      lastPlayDate: data.lastPlayDate,
      canPlayToday: this.canPlayToday(data.contentId),
      isUnlimited: data.isUnlimited
    }));
  }

  // Mostrar estadísticas detalladas en consola (para debugging)
  showDetailedStats(): void {
    const allData = this.loadRepetitionData();
    const today = this.getCurrentDate();
    
    console.log('📊 === ESTADÍSTICAS DETALLADAS DE REPETICIONES ===');
    console.log(`📅 Fecha: ${today}`);
    console.log(`📝 Total de contenidos con datos: ${allData.length}`);
    console.log('');
    
    if (allData.length === 0) {
      console.log('❌ No hay datos de repetición registrados');
      return;
    }
    
    console.log('📋 Detalle por contenido:');
    allData.forEach((data, index) => {
      const isToday = data.lastPlayDate === today;
      const canPlay = this.canPlayToday(data.contentId);
      const status = data.isUnlimited ? 'Ilimitado' : 
                     canPlay ? 'Activo' : 'Límite alcanzado';
      
      console.log(`${index + 1}. ID: ${data.contentId}`);
      console.log(`   📊 Reproducciones hoy: ${isToday ? data.dailyCount : 0}`);
      console.log(`   🎯 Límite diario: ${data.isUnlimited ? 'Ilimitado' : data.dailyLimit}`);
      console.log(`   📅 Última reproducción: ${data.lastPlayDate}`);
      console.log(`   ✅ Estado: ${status}`);
      console.log(`   🔄 Puede reproducirse: ${canPlay ? 'Sí' : 'No'}`);
      console.log('');
    });
    
    const stats = this.getStats();
    console.log('📈 Resumen:');
    console.log(`   📁 Total contenidos: ${stats.totalContents}`);
    console.log(`   🟢 Activos hoy: ${stats.activeToday}`);
    console.log(`   🔴 Completados hoy: ${stats.completedToday}`);
    console.log('='.repeat(50));
  }

  // ===== FUNCIONES DE SINCRONIZACIÓN CON SUPABASE =====

  // Verificar conexión con Supabase
  private async checkSupabaseConnection(): Promise<void> {
    try {
      const { error } = await supabase
        .from('repetition_limits')
        .select('count')
        .limit(1)
      
      if (error && error.code === 'PGRST116') {
        // Tabla no existe
        this.isSupabaseEnabled = false
        console.warn('⚠️ Tabla repetition_limits no existe en Supabase')
      } else if (error) {
        this.isSupabaseEnabled = false
        console.warn('⚠️ Error de conexión con Supabase:', error)
      } else {
        this.isSupabaseEnabled = true
        console.log('✅ Conexión con Supabase establecida')
      }
    } catch (error) {
      this.isSupabaseEnabled = false
      console.warn('⚠️ Error verificando conexión con Supabase:', error)
    }
  }

  // Sincronizar límites locales con Supabase
  async syncToSupabase(): Promise<void> {
    await this.checkSupabaseConnection()
    
    if (!this.isSupabaseEnabled) {
      console.log('ℹ️ Supabase no disponible, saltando sincronización')
      return
    }

    try {
      const localData = this.loadRepetitionData()
      
      if (localData.length === 0) {
        console.log('ℹ️ No hay datos locales para sincronizar')
        return
      }

      console.log(`🔄 Sincronizando ${localData.length} límites con Supabase...`)

      for (const data of localData) {
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

      console.log('✅ Sincronización con Supabase completada')
    } catch (error) {
      console.error('❌ Error durante la sincronización:', error)
    }
  }

  // Cargar límites desde Supabase
  async loadFromSupabase(): Promise<void> {
    await this.checkSupabaseConnection()
    
    if (!this.isSupabaseEnabled) {
      console.log('ℹ️ Supabase no disponible, saltando carga')
      return
    }

    try {
      const { data, error } = await supabase
        .from('repetition_limits')
        .select('*')

      if (error) {
        console.error('❌ Error cargando límites desde Supabase:', error)
        return
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No hay límites en Supabase')
        return
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
      this.saveRepetitionData(localFormat)

      console.log(`✅ Cargados ${localFormat.length} límites desde Supabase`)
    } catch (error) {
      console.error('❌ Error cargando límites desde Supabase:', error)
    }
  }

  // Sincronizar automáticamente al cambiar límites
  private async syncLimitChange(contentId: string): Promise<void> {
    console.log(`🔄 Intentando sincronizar límite para ${contentId}...`)
    
    if (!this.isSupabaseEnabled) {
      console.log(`ℹ️ Supabase no disponible, saltando sincronización para ${contentId}`)
      return
    }

    try {
      const data = this.getRepetitionData(contentId)
      if (!data) {
        console.log(`⚠️ No hay datos para sincronizar para ${contentId}`)
        return
      }

      console.log(`📤 Enviando datos a Supabase para ${contentId}:`, {
        content_id: contentId,
        daily_limit: data.dailyLimit,
        is_unlimited: data.isUnlimited,
        daily_count: data.dailyCount,
        last_play_date: data.lastPlayDate
      })

      const { error } = await supabase
        .from('repetition_limits')
        .upsert({
          content_id: contentId,
          daily_limit: data.dailyLimit,
          is_unlimited: data.isUnlimited,
          daily_count: data.dailyCount,
          last_play_date: data.lastPlayDate
        }, {
          onConflict: 'content_id'
        })

      if (error) {
        console.error(`❌ Error sincronizando cambio de límite para ${contentId}:`, error)
      } else {
        console.log(`✅ Límite sincronizado exitosamente para ${contentId}`)
      }
    } catch (error) {
      console.error('❌ Error en sincronización automática:', error)
    }
  }

  // Inicializar sincronización
  async initializeSync(): Promise<void> {
    try {
      console.log('🚀 Inicializando sincronización de límites de repeticiones...')
      await this.checkSupabaseConnection()
      
      if (this.isSupabaseEnabled) {
        console.log('🔄 Iniciando sincronización con Supabase...')
        
        // Cargar datos existentes de Supabase
        await this.loadFromSupabase()
        
        // Sincronizar datos locales con Supabase
        await this.syncToSupabase()
        
        // Iniciar sincronización automática cada 30 segundos
        this.startAutoSync()
        
        console.log('✅ Sincronización inicial completada')
      } else {
        console.log('⚠️ Supabase no disponible, usando solo almacenamiento local')
      }
    } catch (error) {
      console.error('❌ Error en sincronización inicial:', error)
    }
  }

  // Iniciar sincronización automática
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    this.syncInterval = setInterval(async () => {
      try {
        await this.performAutoSync()
      } catch (error) {
        console.error('❌ Error en sincronización automática:', error)
      }
    }, 30000) // Sincronizar cada 30 segundos
    
    console.log('🔄 Sincronización automática iniciada (cada 30 segundos)')
  }

  // Detener sincronización automática
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('⏹️ Sincronización automática detenida')
    }
  }

  // Realizar sincronización automática
  private async performAutoSync(): Promise<void> {
    if (!this.isSupabaseEnabled) return
    
    try {
      // Cargar cambios desde Supabase
      await this.loadFromSupabase()
      
      // Notificar a los listeners que hay cambios
      this.notifySyncCallbacks()
      
      console.log('🔄 Sincronización automática completada')
    } catch (error) {
      console.error('❌ Error en sincronización automática:', error)
    }
  }

  // Agregar callback para notificar cambios
  onSyncChange(callback: () => void): void {
    this.syncCallbacks.push(callback)
  }

  // Remover callback
  removeSyncCallback(callback: () => void): void {
    const index = this.syncCallbacks.indexOf(callback)
    if (index > -1) {
      this.syncCallbacks.splice(index, 1)
    }
  }

  // Notificar a todos los callbacks
  private notifySyncCallbacks(): void {
    this.syncCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('❌ Error en callback de sincronización:', error)
      }
    })
  }
} 