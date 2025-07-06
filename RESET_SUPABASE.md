# 🧹 Limpiar y Reinstalar Supabase

## Paso 1: Eliminar tabla actual (si existe)

Ve a tu dashboard de Supabase → **SQL Editor** y ejecuta:

```sql
-- Eliminar la tabla programs si existe
DROP TABLE IF EXISTS public.programs CASCADE;

-- Eliminar políticas RLS si existen
DROP POLICY IF EXISTS "Allow all operations" ON public.programs;
```

## Paso 2: Crear tabla nueva desde cero

Después de eliminar, ejecuta este SQL para crear la tabla limpia:

```sql
-- Crear tabla de programas desde cero
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

-- Crear política para permitir todas las operaciones
CREATE POLICY "Allow all operations" ON public.programs
    FOR ALL USING (true);

-- Crear índice para mejorar rendimiento
CREATE INDEX idx_programs_created_at ON public.programs(created_at);

-- Verificar que la tabla se creó correctamente
SELECT * FROM public.programs;
```

## Paso 3: Verificar

Deberías ver una tabla vacía con las columnas correctas.

## Paso 4: Recargar la aplicación

Después de ejecutar el SQL, recarga tu aplicación en el navegador. 