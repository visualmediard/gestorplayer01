import { ReproductionStats, GlobalStats } from '../types/content';

class ReproductionStatsService {
  private static instance: ReproductionStatsService;
  private stats: ReproductionStats = {};
  private sessionStart: number = Date.now();
  private autoSaveInterval: NodeJS.Timeout | null = null;

  static getInstance(): ReproductionStatsService {
    if (!ReproductionStatsService.instance) {
      ReproductionStatsService.instance = new ReproductionStatsService();
    }
    return ReproductionStatsService.instance;
  }

  constructor() {
    this.loadStats();
    this.startAutoSave();
  }

  private loadStats(): void {
    try {
      const saved = localStorage.getItem('gestorplayer-reproduction-stats');
      if (saved) {
        const parsedStats = JSON.parse(saved);
        this.stats = parsedStats;
      }
    } catch (error) {
      console.error('Error loading reproduction stats:', error);
      this.stats = {};
    }
  }

  private saveStats(): void {
    try {
      localStorage.setItem('gestorplayer-reproduction-stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Error saving reproduction stats:', error);
    }
  }

  private startAutoSave(): void {
    // Limpiar intervalo anterior si existe
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Guardar cada 30 segundos
    this.autoSaveInterval = setInterval(() => {
      this.saveStats();
    }, 30000);
  }

  recordReproduction(
    contentId: string,
    contentName: string,
    contentType: 'image' | 'video',
    programId: string,
    programName: string,
    duration?: number
  ): void {
    const now = Date.now();

    if (!this.stats[contentId]) {
      this.stats[contentId] = {
        name: contentName,
        type: contentType,
        reproductions: 0,
        lastReproduction: 0,
        programId,
        programName,
        reproductionsPerMinute: 0,
        totalDuration: 0,
        averageSessionTime: 0
      };
    }

    // Actualizar estadísticas
    this.stats[contentId].reproductions++;
    this.stats[contentId].lastReproduction = now;
    
    if (duration) {
      this.stats[contentId].totalDuration = (this.stats[contentId].totalDuration || 0) + duration;
      this.stats[contentId].averageSessionTime = this.stats[contentId].totalDuration! / this.stats[contentId].reproductions;
    }

    this.calculateReproductionsPerMinute(contentId);
    this.saveStats(); // Guardar inmediatamente después de registrar
  }

  private calculateReproductionsPerMinute(contentId: string): void {
    const stat = this.stats[contentId];
    if (!stat) return;

    const sessionDurationMinutes = (Date.now() - this.sessionStart) / (1000 * 60);
    if (sessionDurationMinutes > 0) {
      stat.reproductionsPerMinute = Math.round((stat.reproductions / sessionDurationMinutes) * 100) / 100;
    }
  }

  getStats(): ReproductionStats {
    return { ...this.stats };
  }

  getGlobalStats(): GlobalStats {
    const stats = Object.values(this.stats);
    const totalReproductions = stats.reduce((sum, stat) => sum + stat.reproductions, 0);
    const sessionDurationMinutes = (Date.now() - this.sessionStart) / (1000 * 60);

    // Agrupar por programa para contar programas únicos
    const programsSet = new Set(stats.map(stat => stat.programId));

    return {
      totalPrograms: programsSet.size,
      totalContent: Object.keys(this.stats).length,
      totalReproductions,
      sessionDuration: Math.floor(sessionDurationMinutes),
      reproductionsPerMinute: sessionDurationMinutes > 0 ? Math.round((totalReproductions / sessionDurationMinutes) * 100) / 100 : 0,
      topContent: this.getTopContent(5),
      lastUpdated: new Date().toISOString()
    };
  }

  getTopContent(limit: number = 5): Array<{
    id: string;
    name: string;
    reproductions: number;
    type: 'image' | 'video';
  }> {
    return Object.entries(this.stats)
      .map(([id, stat]) => ({
        id,
        name: stat.name,
        reproductions: stat.reproductions,
        type: stat.type
      }))
      .sort((a, b) => b.reproductions - a.reproductions)
      .slice(0, limit);
  }

  getStatsByProgram(programId: string): ReproductionStats {
    const programStats: ReproductionStats = {};
    
    Object.entries(this.stats).forEach(([contentId, stat]) => {
      if (stat.programId === programId) {
        programStats[contentId] = stat;
      }
    });

    return programStats;
  }

  getTotalReproductions(): number {
    return Object.values(this.stats).reduce((total, stat) => total + stat.reproductions, 0);
  }

  getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStart) / (1000 * 60));
  }

  resetStats(): void {
    this.stats = {};
    this.saveStats();
  }

  resetSessionStats(): void {
    this.sessionStart = Date.now();
    Object.values(this.stats).forEach(stat => {
      stat.reproductionsPerMinute = 0;
    });
  }

  exportStats(): string {
    return JSON.stringify({
      stats: this.stats,
      sessionStart: this.sessionStart,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  importStats(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.stats && typeof parsed.stats === 'object') {
        this.stats = parsed.stats;
        this.saveStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing stats:', error);
      return false;
    }
  }

  destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
}

export default ReproductionStatsService; 