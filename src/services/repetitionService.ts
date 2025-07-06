import { MediaContent } from '../types/content';

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
  setDailyLimit(contentId: string, limit: number, isUnlimited: boolean = false): void {
    this.updateRepetitionData(contentId, {
      dailyLimit: isUnlimited ? -1 : limit,
      isUnlimited
    });
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
  recordPlayback(contentId: string): void {
    const data = this.getRepetitionData(contentId);
    const today = this.getCurrentDate();
    
    if (!data) {
      // Crear nuevo registro
      this.updateRepetitionData(contentId, {
        dailyCount: 1,
        lastPlayDate: today
      });
    } else {
      // Si es un día diferente, resetear contador
      if (data.lastPlayDate !== today) {
        this.updateRepetitionData(contentId, {
          dailyCount: 1,
          lastPlayDate: today
        });
      } else {
        // Incrementar contador del día
        this.updateRepetitionData(contentId, {
          dailyCount: data.dailyCount + 1,
          lastPlayDate: today
        });
      }
    }
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
} 