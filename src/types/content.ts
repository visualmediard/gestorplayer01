export interface MediaContent {
  id: string;
  name: string;
  type: 'image' | 'video';
  file: File | null;
  url?: string;
  duration?: number;
  size?: number;
  lastModified?: number;
  // Configuración de repeticiones
  dailyLimit: number; // Cuántas veces por día (-1 = ilimitado)
  isUnlimited: boolean; // Repeticiones ilimitadas
  // Control de reproducción diaria
  dailyCount: number; // Cuántas veces se reprodujo hoy
  lastPlayDate: string; // Fecha de la última reproducción
  // Estado de reproducción
  isAvailableToday: boolean; // Si está disponible para reproducir hoy
}

export interface Content {
  id: string;
  name: string;
  type: 'image' | 'video' | 'text' | 'web';
  url?: string;
  text?: string;
  duration: number;
  frequency: number;
  originalFrequency: number;
  remainingPlays: number;
  isActive: boolean;
  createdAt: string;
  lastPlayed?: string;
  totalPlays: number;
  // Para Supabase Storage
  filePath?: string; // Ruta del archivo en Supabase Storage
  isStorageFile?: boolean; // Si el archivo está en Supabase Storage
}

export interface Zone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  content: Content[];
  isSelected: boolean;
  zIndex: number;
}

export interface Program {
  id: string;
  name: string;
  width: number;
  height: number;
  zones: Zone[];
  content: number;
  lastModified: string;
  createdAt: string;
  description?: string;
}

export interface PlaylistState {
  programId: string;
  zoneId: string;
  currentContentIndex: number;
  isPlaying: boolean;
  playlist: Content[];
  playbackHistory: PlaybackHistoryEntry[];
}

export interface PlaybackHistoryEntry {
  contentId: string;
  playedAt: string;
  duration: number;
  completed: boolean;
}

export interface CanvasSettings {
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  zoom: number;
}

export interface ReproductionStats {
  [contentId: string]: {
    name: string;
    type: 'image' | 'video';
    reproductions: number;
    lastReproduction: number;
    programId: string;
    programName: string;
    reproductionsPerMinute: number;
    totalDuration?: number;
    averageSessionTime?: number;
  };
}

export interface FrequencySettings {
  [contentId: string]: {
    count: number;
    date: string;
    limit: number;
    isUnlimited: boolean;
  };
}

export interface GlobalStats {
  totalPrograms: number;
  totalContent: number;
  totalReproductions: number;
  sessionDuration: number;
  reproductionsPerMinute: number;
  topContent: Array<{
    id: string;
    name: string;
    reproductions: number;
    type: 'image' | 'video';
  }>;
  lastUpdated: string;
} 