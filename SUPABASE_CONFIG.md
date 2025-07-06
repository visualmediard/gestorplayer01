# Configuración de Supabase

## Paso 1: Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

## Paso 2: Obtener las credenciales
1. En tu dashboard de Supabase, ve a **Settings** > **API**
2. Copia la **URL** del proyecto
3. Copia la **anon/public key**

## Paso 3: Crear tabla en Supabase
Ve a **SQL Editor** en tu dashboard de Supabase y ejecuta este código:

```sql
-- Crear tabla de programas
CREATE TABLE public.programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    zones JSONB DEFAULT '[]'::jsonb,
    content INTEGER DEFAULT 0,
    last_modified TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (para desarrollo)
CREATE POLICY "Allow all operations" ON public.programs
    FOR ALL USING (true);

-- Crear índice para mejorar rendimiento
CREATE INDEX idx_programs_created_at ON public.programs(created_at);
```

## Paso 4: Configurar variables de entorno
1. Crea un archivo `.env.local` en la raíz del proyecto
2. Añade las siguientes variables:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

**Ejemplo:**
```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Paso 5: Reiniciar el servidor de desarrollo
```bash
npm run dev
```

## Verificación
- Si está configurado correctamente, verás "🟢 Supabase conectado" en la esquina superior derecha
- Si hay problemas, verás "🟡 Modo offline" y funcionará con localStorage

## Funcionalidades
- ✅ Sincronización automática con Supabase
- ✅ Fallback a localStorage si no hay conexión
- ✅ Migración automática de datos locales a Supabase
- ✅ Acceso desde cualquier dispositivo
- ✅ Persistencia en la nube 