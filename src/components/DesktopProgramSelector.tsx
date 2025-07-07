import React, { useEffect, useState, useRef } from 'react';
import { Program } from '../types/content';
import { ProgramService } from '../services/programService';
import { GlobalPlaybackService } from '../services/globalPlaybackService';
import { RepetitionService } from '../services/repetitionService';
import { supabase } from '../config/supabase';
import CanvasEditor from './CanvasEditor';

const DesktopProgramSelector: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  const programService = ProgramService.getInstance();
  const globalPlaybackService = GlobalPlaybackService.getInstance();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);

  // Función para cargar programas usando ProgramService (igual que la web)
  const loadPrograms = async (isManualSync = false) => {
    if (isManualSync) {
      setIsSyncing(true);
      setSyncMessage('Actualizando programas desde la web...');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando programas...');
      const loadedPrograms = await programService.getPrograms();
      console.log('✅ Programas cargados:', loadedPrograms.length);
      
      setPrograms(loadedPrograms);
      setLastSyncTime(new Date());
      setConnectionStatus('connected');
      
      // Inicializar servicio global de reproducción
      if (loadedPrograms.length > 0) {
        console.log('🎬 Inicializando servicio global de reproducción automática...');
        globalPlaybackService.initializeWithPrograms(loadedPrograms);
      } else {
        console.log('⏹️ No hay programas, deteniendo reproducción global');
        globalPlaybackService.stopGlobalPlayback();
      }
      
      if (isManualSync) {
        setSyncMessage(`✅ Sincronizado exitosamente - ${loadedPrograms.length} programas encontrados`);
        setTimeout(() => setSyncMessage(''), 3000);
      }
      
      console.log(`🔄 Programas sincronizados: ${loadedPrograms.length} programas`);
    } catch (error) {
      console.error('❌ Error cargando programas:', error);
      setError('Error al cargar programas');
      setSyncMessage('Error al sincronizar');
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // Función para sincronización manual
  const handleManualSync = () => {
    loadPrograms(true);
  };

  // Función para verificar conexión
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const testPrograms = await programService.getPrograms();
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      setConnectionStatus('disconnected');
      return false;
    }
  };

  // Sincronización automática cada 30 segundos como respaldo
  const startAutoSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(async () => {
      console.log('🔄 Sincronización automática de respaldo...');
      const isConnected = await checkConnection();
      if (isConnected) {
        loadPrograms();
      }
    }, 30000); // 30 segundos
  };

  // Detener sincronización automática
  const stopAutoSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };

  // Configurar sincronización en tiempo real con Supabase
  const setupRealtimeSync = () => {
    // Limpiar suscripción anterior si existe
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    // Crear nueva suscripción para cambios en tiempo real
    const channel = supabase.channel('desktop-realtime-programs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'programs' 
      }, (payload) => {
        console.log('🔄 Cambio detectado en Supabase:', payload.eventType);
        setSyncMessage('🔄 Cambios detectados, actualizando...');
        
        // Actualizar programas inmediatamente
        loadPrograms();
        
        setTimeout(() => setSyncMessage(''), 2000);
      })
      .subscribe();

    subscriptionRef.current = channel;
    console.log('🔗 Sincronización en tiempo real configurada');
  };

  // Cargar programas inicialmente y configurar sincronización
  useEffect(() => {
    loadPrograms();
    setupRealtimeSync();
    startAutoSync();
    
    // Inicializar sincronización de límites de repeticiones
    const repetitionService = RepetitionService.getInstance();
    repetitionService.initializeSync().catch(error => {
      console.error('❌ Error inicializando sincronización de repeticiones:', error);
    });
    
    return () => {
      stopAutoSync();
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      // Detener sincronización de repeticiones
      repetitionService.stopAutoSync();
    };
  }, []);

  // Sincronización manual con tecla F5
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'F5') {
        event.preventDefault();
        handleManualSync();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (selectedProgram) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
        {/* NO mostrar barra superior en modo visualización de video/canvas */}
        <CanvasEditor
          program={selectedProgram}
          onUpdateProgram={() => {}}
          onClose={() => setSelectedProgram(null)}
          viewOnly={true}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#111', 
      color: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>GestorPlayer - Aplicación de Escritorio</h1>
      
      {/* BOTÓN PRINCIPAL DE ACTUALIZAR - MÁS PROMINENTE */}
      <div style={{ 
        background: '#007acc', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '24px',
        minWidth: '400px',
        textAlign: 'center',
        border: '2px solid #005a9e',
        boxShadow: '0 4px 12px rgba(0, 122, 204, 0.3)'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold' }}>
          🔄 Sincronización de Datos
        </h3>
        <p style={{ fontSize: '14px', marginBottom: '16px', opacity: 0.9 }}>
          Mantén sincronizada la aplicación con los cambios de la web
        </p>
        
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          style={{
            padding: '12px 24px',
            background: isSyncing ? '#444' : '#fff',
            color: isSyncing ? '#888' : '#007acc',
            border: 'none',
            borderRadius: '8px',
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            minWidth: '200px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isSyncing) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isSyncing ? '⏳ Sincronizando...' : '🔄 ACTUALIZAR AHORA'}
        </button>
        
        <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '12px' }}>
          También puedes presionar F5 para actualizar
        </p>
      </div>
      
      {/* Información de estado */}
      <div style={{ 
        background: '#222', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '24px',
        minWidth: '400px',
        textAlign: 'center',
        border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span>📡 Estado de Conexión</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: connectionStatus === 'connected' ? '#4ade80' : 
                         connectionStatus === 'checking' ? '#fbbf24' : '#ef4444',
              animation: connectionStatus === 'checking' ? 'pulse 1s infinite' : 'none'
            }}></span>
            <span style={{ fontSize: '12px' }}>
              {connectionStatus === 'connected' ? 'Conectado' : 
               connectionStatus === 'checking' ? 'Verificando...' : 'Desconectado'}
            </span>
          </div>
        </div>
        
        {lastSyncTime && (
          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>
            Última sincronización: {lastSyncTime.toLocaleString()}
          </p>
        )}
        
        {syncMessage && (
          <p style={{ fontSize: '14px', color: '#4ade80', marginBottom: '8px' }}>
            {syncMessage}
          </p>
        )}
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={checkConnection}
            style={{
              padding: '6px 12px',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔍 Verificar Conexión
          </button>
        </div>
        
        <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>
          Sincronización automática cada 30s • Cambios en tiempo real
        </p>
      </div>
      
      {/* Lista de programas */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>Programas Disponibles</h2>
        
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            <p>Cargando programas...</p>
          </div>
        )}
        
        {error && (
          <div style={{ 
            background: '#442222', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            border: '1px solid #ff4444'
          }}>
            <p style={{ color: '#ff4444' }}>❌ {error}</p>
            <button
              onClick={handleManualSync}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                background: '#ff4444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </div>
        )}
        
        {!loading && !error && programs.length === 0 && (
          <div style={{ 
            background: '#222', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <p style={{ opacity: 0.7, marginBottom: '8px' }}>No hay programas disponibles</p>
            <p style={{ fontSize: '12px', opacity: 0.5 }}>Crea un programa desde la aplicación web</p>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: '400px' }}>
          {programs.map(program => (
            <button
              key={program.id}
              style={{ 
                padding: '16px 24px', 
                fontSize: 18, 
                borderRadius: 8, 
                background: '#222', 
                color: '#fff', 
                border: '1px solid #444', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333';
                e.currentTarget.style.borderColor = '#666';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#222';
                e.currentTarget.style.borderColor = '#444';
              }}
              onClick={() => setSelectedProgram(program)}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{program.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {program.content || 0} contenidos • {program.zones?.length || 0} zonas
                {program.lastModified && (
                  <span style={{ marginLeft: '8px' }}>
                    • Modificado: {new Date(program.lastModified).toLocaleDateString()}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default DesktopProgramSelector; 