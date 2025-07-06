# GestorPlayer - Sistema de Gestión de Publicidad Digital

## 🎯 Estado Actual de la Aplicación

GestorPlayer es una aplicación web moderna para gestión de programas de publicidad exterior (Digital Signage) construida con React, TypeScript y Tailwind CSS. 

### ✅ Funcionalidades Implementadas

#### 1. **Infraestructura Básica**
- ✅ Proyecto React 18 + TypeScript configurado con Vite
- ✅ Tailwind CSS con colores corporativos personalizados
- ✅ Estructura de carpetas organizada y escalable
- ✅ Sistema de tipos TypeScript completo

#### 2. **Servicios Core**
- ✅ **ReproductionStatsService**: Servicio singleton para estadísticas globales
- ✅ **FrequencyService**: Control de frecuencia de reproducción con límites diarios
- ✅ Persistencia en localStorage con auto-guardado
- ✅ Gestión de memoria y limpieza automática

#### 3. **Hooks Personalizados**
- ✅ **useToast**: Notificaciones toast con Sonner
- ✅ **useMobile**: Detección de dispositivos móviles
- ✅ **useContentPlayback**: Sistema de reproducción automática (estructura base)

#### 4. **Interfaz de Usuario**
- ✅ **Navbar**: Navegación principal responsive
- ✅ **Dashboard Principal**: Vista general con estadísticas
- ✅ **Gestión de Programas**: Crear, editar, duplicar, eliminar
- ✅ **Sistema de Tabs**: Programas vs Estadísticas
- ✅ **Diseño Corporate**: Gradientes y colores personalizados

#### 5. **Componentes Principales**
- ✅ **ProgramCard**: Tarjetas de programa con menú contextual
- ✅ **CreateProgramDialog**: Modal para crear programas con resoluciones predefinidas
- ✅ **ReproductionStatsCard**: Panel de estadísticas globales en tiempo real
- ✅ **StatsPanel**: Tabla detallada de estadísticas con filtros
- ✅ **NotFound**: Página 404 corporativa

#### 6. **Características Avanzadas**
- ✅ Sistema de estadísticas en tiempo real
- ✅ Exportación de datos en JSON
- ✅ Filtros y ordenamiento en estadísticas
- ✅ Responsive design completo
- ✅ Notificaciones de feedback al usuario
- ✅ Validación de formularios

## 🚧 En Desarrollo

### Próximas Funcionalidades Principales

#### 1. **Editor de Canvas** (Próximo)
- Sistema de sidebar con iconos (7 secciones)
- Canvas escalable con zoom
- Zonas redimensionables y arrastrables
- Sistema de capas y selección

#### 2. **Sistema de Playlist Automática** (Próximo)
- Reproducción secuencial inteligente
- Timers por tipo de contenido
- Control de frecuencia por elemento
- Modo preview sin afectar estadísticas

#### 3. **Gestión de Contenido Multimedia** (Futuro)
- Upload de imágenes y videos
- Previsualización de archivos
- Detección automática de duración
- Sistema de drag & drop

## 🛠️ Tecnologías Utilizadas

### Core
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos

### UI/UX
- **Lucide React** - Iconos modernos
- **Sonner** - Sistema de notificaciones
- **Gradientes personalizados** - Identidad visual corporativa

### Gestión de Estado
- **useState/useEffect** - Estado local de React
- **localStorage** - Persistencia de datos
- **Singleton Services** - Servicios centralizados

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd gestorplayer2

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build
```

### Uso Básico

1. **Crear un Programa**
   - Haz clic en "Nuevo Programa"
   - Ingresa nombre y selecciona resolución
   - El programa se crea con 0 zonas y 0 contenidos

2. **Gestionar Programas**
   - Ver/editar desde las tarjetas del dashboard
   - Duplicar programas existentes
   - Exportar configuración como JSON
   - Eliminar programas no utilizados

3. **Ver Estadísticas**
   - Tab "Estadísticas" para ver métricas globales
   - Panel detallado con filtros por tipo
   - Exportación de datos para análisis

## 📊 Características del Sistema

### Colores Corporativos
```css
--corporate-dark-blue: hsl(195, 73%, 20%)
--corporate-deep-blue: hsl(195, 73%, 15%)
--corporate-light-blue: hsl(195, 73%, 85%)
--corporate-smoke-white: hsl(0, 0%, 96%)
--corporate-charcoal-gray: hsl(0, 0%, 45%)
--corporate-warm-yellow: hsl(45, 100%, 60%)
--corporate-soft-red: hsl(0, 65%, 65%)
--corporate-success-green: hsl(120, 50%, 45%)
```

### Resoluciones Predefinidas
- **Full HD**: 1920 x 1080
- **HD**: 1280 x 720
- **4K UHD**: 3840 x 2160
- **Vertical HD**: 1080 x 1920
- **Cuadrado**: 1080 x 1080

### Estructura de Datos

#### Program
```typescript
interface Program {
  id: string;
  name: string;
  width: number;
  height: number;
  zones: number;
  content: number;
  lastModified: string;
  zoneList?: Zone[];
  createdAt?: string;
  description?: string;
}
```

#### ReproductionStats
```typescript
interface ReproductionStats {
  [contentId: string]: {
    name: string;
    type: 'image' | 'video';
    reproductions: number;
    lastReproduction: number;
    zoneId: string;
    zoneName: string;
    programId: string;
    programName: string;
    reproductionsPerMinute: number;
  };
}
```

## 🔧 Desarrollo

### Scripts Disponibles
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Build de producción
npm run lint     # Linting del código
npm run preview  # Preview del build
```

### Estructura de Carpetas
```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.tsx
│   ├── ProgramCard.tsx
│   └── ...
├── hooks/              # Hooks personalizados
├── services/           # Servicios de negocio
├── types/              # Definiciones de tipos
├── pages/              # Páginas principales
└── lib/                # Utilidades
```

## 📝 Próximos Pasos

### Fase 2: Editor de Canvas
1. Implementar CanvasEditor con sidebar de iconos
2. Sistema de zonas redimensionables
3. Controles de zoom y escala
4. Selección y propiedades de zonas

### Fase 3: Sistema de Reproducción
1. Playlist automática con timers
2. Control de frecuencia avanzado
3. Modo preview inteligente
4. Gestión de archivos multimedia

### Fase 4: Características Avanzadas
1. Sistema de templates
2. Programación temporal
3. API para dispositivos externos
4. Dashboard de monitoreo en tiempo real

## 🎨 Diseño y UX

La aplicación sigue principios de diseño moderno:
- **Gradientes corporativos** para identidad visual
- **Iconografía consistente** con Lucide React
- **Responsive design** para todos los dispositivos
- **Feedback inmediato** con notificaciones toast
- **Estados de carga** para mejor experiencia

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades, crear un issue en el repositorio del proyecto.

---

**GestorPlayer** - Sistema profesional de gestión de publicidad digital desarrollado con tecnologías modernas para máximo rendimiento y escalabilidad. 