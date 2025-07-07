import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Importar y ejecutar prueba de Storage solo en desarrollo
if (import.meta.env.DEV) {
  import('./scripts/testStorage').then(({ testStorageConnectivity, showBucketInfo }) => {
    // Ejecutar prueba después de que la aplicación se haya cargado
    setTimeout(() => {
      console.log('🔧 Modo desarrollo - Ejecutando prueba de Supabase Storage...');
      testStorageConnectivity().then((success) => {
        if (success) {
          showBucketInfo();
        }
      });
    }, 2000); // Esperar 2 segundos para que se cargue la aplicación
  });
  
  // Agregar funciones globales para debugging
  import('./services/repetitionService').then(({ RepetitionService }) => {
    const repetitionService = RepetitionService.getInstance();
    
    // Funciones globales para debugging
    (window as any).debugRepetitions = {
      showStats: () => repetitionService.showDetailedStats(),
      clearAll: () => {
        repetitionService.clearAllData();
        console.log('🧹 Todos los datos de repetición han sido eliminados');
      },
      clearContent: (contentId: string) => {
        repetitionService.clearContentData(contentId);
        console.log(`🧹 Datos eliminados para contenido: ${contentId}`);
      }
    };
    
    console.log('🔧 Funciones de debugging disponibles:');
    console.log('   debugRepetitions.showStats() - Mostrar estadísticas detalladas');
    console.log('   debugRepetitions.clearAll() - Limpiar todos los datos');
    console.log('   debugRepetitions.clearContent(id) - Limpiar datos de un contenido específico');
  });
  
  // Importar servicio de debugging avanzado
  import('./services/debugStatsService').then(() => {
    console.log('🛠️ Servicio de debugging avanzado cargado');
    console.log('   debugStats.showCommands() - Ver todos los comandos disponibles');
  });
}
 
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 