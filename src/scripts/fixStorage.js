import { fixSupabaseStorage, showStorageSetupInstructions, testStorageConfiguration } from './fixSupabaseStorage.js';

// Función principal para arreglar Supabase Storage
async function main() {
  console.log('🚀 Iniciando configuración de Supabase Storage...');
  
  try {
    // Intentar configurar automáticamente
    const result = await fixSupabaseStorage();
    
    if (result.success) {
      console.log('✅ Configuración automática exitosa');
      
      // Probar la configuración
      const testResult = await testStorageConfiguration();
      if (testResult) {
        console.log('✅ Configuración verificada correctamente');
      } else {
        console.log('⚠️ Configuración completada pero hay problemas de acceso');
      }
    } else {
      console.log('❌ Configuración automática falló');
      console.log('📋 Mostrando instrucciones manuales...');
      showStorageSetupInstructions();
    }
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    showStorageSetupInstructions();
  }
}

// Ejecutar si se llama directamente
if (typeof window !== 'undefined') {
  // En el navegador, agregar al objeto global
  window.fixSupabaseStorage = main;
  window.showStorageSetupInstructions = showStorageSetupInstructions;
  window.testStorageConfiguration = testStorageConfiguration;
  
  console.log('🔧 Scripts de configuración de Supabase Storage cargados');
  console.log('💡 Usa window.fixSupabaseStorage() para configurar automáticamente');
  console.log('💡 Usa window.showStorageSetupInstructions() para ver instrucciones manuales');
  console.log('💡 Usa window.testStorageConfiguration() para probar la configuración');
} else {
  // En Node.js, ejecutar directamente
  main();
} 