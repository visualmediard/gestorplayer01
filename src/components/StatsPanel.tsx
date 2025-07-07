import { useState, useEffect } from 'react';
import { BarChart3, PieChart, Download, Filter, Calendar, Trash2 } from 'lucide-react';
import ReproductionStatsService from '../services/reproductionStatsService';
import { RepetitionService } from '../services/repetitionService';
import { ReproductionStats } from '../types/content';

function StatsPanel() {
  const [stats, setStats] = useState<ReproductionStats>({});
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [sortBy, setSortBy] = useState<'reproductions' | 'name' | 'date'>('reproductions');
  const [isLoading, setIsLoading] = useState(true);

  const reproductionStatsService = ReproductionStatsService.getInstance();
  const repetitionService = RepetitionService.getInstance();

  useEffect(() => {
    loadStats();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    setIsLoading(true);
    try {
      const allStats = reproductionStatsService.getStats();
      setStats(allStats);
    } catch (error) {
      console.error('Error loading detailed stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStats = Object.entries(stats).filter(([_, stat]) => {
    if (filter === 'all') return true;
    return stat.type === filter;
  });

  const sortedStats = filteredStats.sort(([, a], [, b]) => {
    switch (sortBy) {
      case 'reproductions':
        return b.reproductions - a.reproductions;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return b.lastReproduction - a.lastReproduction;
      default:
        return 0;
    }
  });

  const exportStats = () => {
    try {
      const dataStr = reproductionStatsService.exportStats();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `gestorplayer_stats_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting stats:', error);
    }
  };

  const getTotalByType = (type: 'image' | 'video') => {
    return Object.values(stats).filter(stat => stat.type === type).length;
  };

  const getTotalReproductionsByType = (type: 'image' | 'video') => {
    return Object.values(stats)
      .filter(stat => stat.type === type)
      .reduce((sum, stat) => sum + stat.reproductions, 0);
  };

  // Eliminar un contenido de estadísticas y repeticiones
  const handleDeleteContent = (contentId: string) => {
    if (window.confirm('¿Seguro que deseas borrar todas las estadísticas y repeticiones de este contenido?')) {
      reproductionStatsService.clearContentStats(contentId);
      repetitionService.clearContentData(contentId);
      loadStats();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-corporate-dark-blue"></div>
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
              Panel de Estadísticas Detalladas
            </h2>
            <p className="text-sm text-corporate-charcoal-gray">
              Análisis completo de reproducción de contenido
            </p>
          </div>
        </div>
        
        <button
          onClick={exportStats}
          className="flex items-center space-x-2 bg-corporate-dark-blue text-white px-4 py-2 rounded-lg hover:bg-corporate-deep-blue transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Imágenes</p>
              <p className="text-2xl font-bold text-blue-800">{getTotalByType('image')}</p>
              <p className="text-xs text-blue-600">{getTotalReproductionsByType('image')} reproducciones</p>
            </div>
            <PieChart className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Videos</p>
              <p className="text-2xl font-bold text-green-800">{getTotalByType('video')}</p>
              <p className="text-xs text-green-600">{getTotalReproductionsByType('video')} reproducciones</p>
            </div>
            <PieChart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total</p>
              <p className="text-2xl font-bold text-purple-800">{Object.keys(stats).length}</p>
              <p className="text-xs text-purple-600">contenidos únicos</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-corporate-charcoal-gray" />
          <span className="text-sm font-medium text-corporate-charcoal-gray">Filtros:</span>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'image' | 'video')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-corporate-dark-blue"
        >
          <option value="all">Todos los tipos</option>
          <option value="image">Solo imágenes</option>
          <option value="video">Solo videos</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'reproductions' | 'name' | 'date')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-corporate-dark-blue"
        >
          <option value="reproductions">Más reproducido</option>
          <option value="name">Nombre A-Z</option>
          <option value="date">Más reciente</option>
        </select>
      </div>

      {/* Stats Table */}
      {sortedStats.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-corporate-dark-blue">Contenido</th>
                <th className="text-center py-3 px-2 font-medium text-corporate-dark-blue">Tipo</th>
                <th className="text-center py-3 px-2 font-medium text-corporate-dark-blue">Reproducciones</th>
                <th className="text-center py-3 px-2 font-medium text-corporate-dark-blue">Por minuto</th>
                <th className="text-center py-3 px-2 font-medium text-corporate-dark-blue">Última</th>
                <th className="text-center py-3 px-2 font-medium text-corporate-dark-blue">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map(([contentId, stat]) => (
                <tr key={contentId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-corporate-dark-blue truncate max-w-xs">{stat.name}</p>
                      <p className="text-xs text-corporate-charcoal-gray">Programa: {stat.programName}</p>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      stat.type === 'video' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {stat.type === 'video' ? 'Video' : 'Imagen'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className="font-semibold text-corporate-dark-blue">{stat.reproductions}</span>
                  </td>
                  <td className="text-center py-3 px-2 text-corporate-charcoal-gray">
                    {stat.reproductionsPerMinute}
                  </td>
                  <td className="text-center py-3 px-2 text-corporate-charcoal-gray">
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(stat.lastReproduction).toLocaleTimeString('es-ES')}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <button
                      title="Borrar contenido"
                      onClick={() => handleDeleteContent(contentId)}
                      className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-corporate-charcoal-gray mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-corporate-charcoal-gray mb-2">
            No hay datos de reproducción
          </h3>
          <p className="text-corporate-charcoal-gray">
            Comienza a reproducir contenido para ver estadísticas detalladas
          </p>
        </div>
      )}
    </div>
  );
}

export default StatsPanel; 