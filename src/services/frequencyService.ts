import { FrequencySettings } from '../types/content';

class FrequencyService {
  private static instance: FrequencyService;
  private settings: FrequencySettings = {};
  private dailyStats: { [contentId: string]: { count: number; date: string } } = {};

  static getInstance(): FrequencyService {
    if (!FrequencyService.instance) {
      FrequencyService.instance = new FrequencyService();
    }
    return FrequencyService.instance;
  }

  constructor() {
    this.loadSettings();
    this.cleanupOldStats();
  }

  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('gestorplayer-frequency-settings');
      const savedStats = localStorage.getItem('gestorplayer-daily-stats');
      
      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      }
      
      if (savedStats) {
        this.dailyStats = JSON.parse(savedStats);
      }
    } catch (error) {
      console.error('Error loading frequency settings:', error);
      this.settings = {};
      this.dailyStats = {};
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('gestorplayer-frequency-settings', JSON.stringify(this.settings));
      localStorage.setItem('gestorplayer-daily-stats', JSON.stringify(this.dailyStats));
    } catch (error) {
      console.error('Error saving frequency settings:', error);
    }
  }

  private cleanupOldStats(): void {
    const today = new Date().toDateString();
    
    Object.keys(this.dailyStats).forEach(contentId => {
      if (this.dailyStats[contentId].date !== today) {
        this.dailyStats[contentId] = { count: 0, date: today };
      }
    });
    
    this.saveSettings();
  }

  setFrequencyLimit(contentId: string, limit: number, isUnlimited: boolean = false): void {
    if (!this.settings[contentId]) {
      this.settings[contentId] = {
        count: 0,
        date: new Date().toDateString(),
        limit: limit,
        isUnlimited: isUnlimited
      };
    } else {
      this.settings[contentId].limit = limit;
      this.settings[contentId].isUnlimited = isUnlimited;
    }
    
    this.saveSettings();
  }

  canPlayContent(contentId: string): boolean {
    const today = new Date().toDateString();
    
    // Verificar si existe configuración para este contenido
    const setting = this.settings[contentId];
    if (!setting) {
      return true; // Sin configuración = sin límites
    }
    
    // Si es ilimitado, siempre puede reproducir
    if (setting.isUnlimited) {
      return true;
    }
    
    // Inicializar stats diarios si no existen
    if (!this.dailyStats[contentId]) {
      this.dailyStats[contentId] = { count: 0, date: today };
    }
    
    // Resetear contador si cambió el día
    if (this.dailyStats[contentId].date !== today) {
      this.dailyStats[contentId] = { count: 0, date: today };
    }
    
    // Verificar límite diario
    return this.dailyStats[contentId].count < setting.limit;
  }

  recordPlayback(contentId: string): void {
    const today = new Date().toDateString();
    
    // Inicializar stats diarios si no existen
    if (!this.dailyStats[contentId]) {
      this.dailyStats[contentId] = { count: 0, date: today };
    }
    
    // Resetear contador si cambió el día
    if (this.dailyStats[contentId].date !== today) {
      this.dailyStats[contentId] = { count: 0, date: today };
    }
    
    // Incrementar contador
    this.dailyStats[contentId].count++;
    
    // Actualizar configuración si existe
    if (this.settings[contentId]) {
      this.settings[contentId].count = this.dailyStats[contentId].count;
      this.settings[contentId].date = today;
    }
    
    this.saveSettings();
  }

  getContentStats(contentId: string): { count: number; limit: number; isUnlimited: boolean; remainingPlays: number } {
    const today = new Date().toDateString();
    const setting = this.settings[contentId];
    const dailyStat = this.dailyStats[contentId];
    
    if (!setting) {
      return {
        count: 0,
        limit: 0,
        isUnlimited: true,
        remainingPlays: Infinity
      };
    }
    
    const currentCount = dailyStat && dailyStat.date === today ? dailyStat.count : 0;
    const remainingPlays = setting.isUnlimited ? Infinity : Math.max(0, setting.limit - currentCount);
    
    return {
      count: currentCount,
      limit: setting.limit,
      isUnlimited: setting.isUnlimited,
      remainingPlays
    };
  }

  getAllStats(): { [contentId: string]: { count: number; limit: number; isUnlimited: boolean; remainingPlays: number } } {
    const stats: { [contentId: string]: { count: number; limit: number; isUnlimited: boolean; remainingPlays: number } } = {};
    
    Object.keys(this.settings).forEach(contentId => {
      stats[contentId] = this.getContentStats(contentId);
    });
    
    return stats;
  }

  resetDailyStats(): void {
    const today = new Date().toDateString();
    
    Object.keys(this.dailyStats).forEach(contentId => {
      this.dailyStats[contentId] = { count: 0, date: today };
    });
    
    Object.keys(this.settings).forEach(contentId => {
      this.settings[contentId].count = 0;
      this.settings[contentId].date = today;
    });
    
    this.saveSettings();
  }

  removeContent(contentId: string): void {
    delete this.settings[contentId];
    delete this.dailyStats[contentId];
    this.saveSettings();
  }

  getFrequencySettings(): FrequencySettings {
    return { ...this.settings };
  }

  updateFrequencySettings(settings: FrequencySettings): void {
    this.settings = { ...settings };
    this.saveSettings();
  }

  exportSettings(): string {
    return JSON.stringify({
      settings: this.settings,
      dailyStats: this.dailyStats,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  importSettings(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.settings && typeof parsed.settings === 'object') {
        this.settings = parsed.settings;
        if (parsed.dailyStats && typeof parsed.dailyStats === 'object') {
          this.dailyStats = parsed.dailyStats;
        }
        this.saveSettings();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing frequency settings:', error);
      return false;
    }
  }
}

export default FrequencyService; 