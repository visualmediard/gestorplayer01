import { StorageService } from '../services/storageService';

// Función para probar la conectividad con Supabase Storage
export const testStorageConnectivity = async () => {
  console.log('🚀 Iniciando prueba de conectividad con Supabase Storage...');
  
  const storageService = StorageService.getInstance();
  
  try {
    // 1. Verificar si el servicio está disponible
    console.log('📡 Verificando disponibilidad del servicio...');
    const isAvailable = await storageService.isStorageAvailable();
    console.log(`✅ Servicio disponible: ${isAvailable}`);
    
    if (!isAvailable) {
      console.error('❌ El servicio de Storage no está disponible');
      return false;
    }
    
    // 2. Obtener estadísticas del bucket
    console.log('📊 Obteniendo estadísticas del bucket...');
    const stats = await storageService.getStorageStats();
    console.log(`📁 Archivos totales: ${stats.totalFiles}`);
    console.log(`💾 Tamaño total: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // 3. Crear archivo de prueba
    console.log('🧪 Creando archivo de prueba...');
    const testContent = 'Prueba de conectividad con GestorPlayer - ' + new Date().toISOString();
    const testFile = new File([testContent], 'test-connectivity.txt', { type: 'text/plain' });
    
    const uploadResult = await storageService.uploadFile(testFile);
    
    if (uploadResult.success && uploadResult.url && uploadResult.path) {
      console.log('✅ Archivo subido exitosamente');
      console.log(`🔗 URL: ${uploadResult.url}`);
      console.log(`📁 Ruta: ${uploadResult.path}`);
      
      // 4. Eliminar archivo de prueba
      console.log('🧹 Eliminando archivo de prueba...');
      const deleteResult = await storageService.deleteFile(uploadResult.path);
      
      if (deleteResult.success) {
        console.log('✅ Archivo eliminado exitosamente');
      } else {
        console.warn('⚠️ Error al eliminar archivo de prueba:', deleteResult.error);
      }
      
      console.log('🎉 ¡Prueba completada exitosamente!');
      return true;
    } else {
      console.error('❌ Error al subir archivo:', uploadResult.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    return false;
  }
};

// Función para mostrar información del bucket
export const showBucketInfo = async () => {
  console.log('📋 Información del bucket gestorplayer-media:');
  
  const storageService = StorageService.getInstance();
  
  try {
    const stats = await storageService.getStorageStats();
    
    console.log('🏢 Bucket: gestorplayer-media');
    console.log('📁 Archivos:', stats.totalFiles);
    console.log('💾 Tamaño total:', (stats.totalSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('📊 Límite por archivo: 15MB');
    console.log('🎯 Tipos permitidos: image/*, video/*');
    console.log('🔒 Acceso: Público (lectura)');
    console.log('☁️ Proveedor: Supabase Storage');
    
  } catch (error) {
    console.error('❌ Error obteniendo información del bucket:', error);
  }
};

// Ejecutar prueba si se ejecuta directamente
if (import.meta.hot) {
  // Solo en desarrollo
  console.log('🔥 Modo desarrollo detectado - ejecutando prueba automática...');
  testStorageConnectivity().then((success) => {
    if (success) {
      showBucketInfo();
    }
  });
} 