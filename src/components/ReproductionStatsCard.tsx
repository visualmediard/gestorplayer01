import { useState, useEffect } from 'react';
import { BarChart3, Clock, Play, RefreshCw } from 'lucide-react';
import ReproductionStatsService from '../services/reproductionStatsService';
import { GlobalStats } from '../types/content';

function ReproductionStatsCard() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const reproductionStatsService = ReproductionStatsService.getInstance();

  const loadStats = () => {
    setIsLoading(true);
    try {
      const globalStats = reproductionStatsService.getGlobalStats();
      setStats(globalStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(() => {
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-8 h-8 text-corporate-dark-blue animate-spin" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-corporate-charcoal-gray mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-corporate-charcoal-gray mb-2">
            No hay estadísticas disponibles
          </h3>
          <p className="text-corporate-charcoal-gray">
            Las estadísticas aparecerán cuando comiences a reproducir contenido
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-corporate-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-corporate-dark-blue">
              Estadísticas Globales
            </h2>
            <p className="text-sm text-corporate-charcoal-gray">
              Resumen de actividad del sistema
            </p>
          </div>
        </div>
        
        <button
          onClick={loadStats}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Actualizar estadísticas"
        >
          <RefreshCw className="w-5 h-5 text-corporate-charcoal-gray" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-corporate-light-blue/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-corporate-dark-blue">
                Total Reproducciones
              </p>
              <p className="text-2xl font-bold text-corporate-dark-blue">
                {stats.totalReproductions}
              </p>
            </div>
            <Play className="w-8 h-8 text-corporate-dark-blue" />
          </div>
        </div>

        <div className="bg-corporate-warm-yellow/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-corporate-dark-blue">
                Contenidos Activos
              </p>
              <p className="text-2xl font-bold text-corporate-dark-blue">
                {stats.totalContent}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-corporate-warm-yellow" />
          </div>
        </div>

        <div className="bg-corporate-soft-red/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-corporate-dark-blue">
                Duración Sesión
              </p>
              <p className="text-2xl font-bold text-corporate-dark-blue">
                {stats.sessionDuration}m
              </p>
            </div>
            <Clock className="w-8 h-8 text-corporate-soft-red" />
          </div>
        </div>
      </div>

      {/* Top Content */}
      {stats.topContent && stats.topContent.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-corporate-dark-blue mb-4">
            Contenido Más Reproducido
          </h3>
          <div className="space-y-3">
            {stats.topContent.map((content, index) => (
              <div key={content.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-corporate-dark-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-corporate-dark-blue truncate">
                    {content.name}
                  </p>
                  <p className="text-sm text-corporate-charcoal-gray">
                    {content.type === 'video' ? 'Video' : 'Imagen'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-corporate-dark-blue">
                    {content.reproductions}
                  </p>
                  <p className="text-xs text-corporate-charcoal-gray">
                    reproducciones
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-corporate-charcoal-gray">
            Última actualización: {new Date(stats.lastUpdated).toLocaleString('es-ES')}
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-corporate-charcoal-gray">
              {stats.reproductionsPerMinute} repr/min
            </span>
            <span className="text-corporate-charcoal-gray">
              {stats.totalPrograms} programas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReproductionStatsCard; 