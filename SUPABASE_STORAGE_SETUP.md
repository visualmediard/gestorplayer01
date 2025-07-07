# Configuración de Supabase Storage para GestorPlayer

## 🗂️ Crear Bucket de Almacenamiento

### Opción 1: Desde la Interfaz de Supabase (Recomendado)

1. **Accede a tu proyecto de Supabase:**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto `gestorplayer`

2. **Navega a Storage:**
   - En el menú lateral, haz clic en "Storage"
   - Haz clic en "Create a new bucket"

3. **Configurar el bucket:**
   ```
   Bucket name: gestorplayer-media
   Public bucket: ✅ Habilitado
   File size limit: 15 MB
   Allowed MIME types: image/*, video/*
   ```

4. **Hacer clic en "Create bucket"**

### Opción 2: Usando SQL (Avanzado)

Si prefieres usar SQL, ejecuta estos comandos en el SQL Editor de Supabase:

```sql
-- Crear bucket público para archivos multimedia
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gestorplayer-media',
  'gestorplayer-media', 
  true,
  15728640, -- 15MB en bytes
  ARRAY['image/*', 'video/*']
);
```

## 🔒 Configurar Políticas de Seguridad (RLS)

### Políticas necesarias para el bucket:

```sql
-- Política para permitir que cualquiera pueda ver los archivos (público)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'gestorplayer-media');

-- Política para permitir subida de archivos (anónimos)
CREATE POLICY "Anyone can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'gestorplayer-media');

-- Política para permitir actualización de archivos
CREATE POLICY "Anyone can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'gestorplayer-media');

-- Política para permitir eliminación de archivos
CREATE POLICY "Anyone can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'gestorplayer-media');
```

## 🚀 Verificar Configuración

### Código de prueba para verificar que funciona:

```javascript
import { supabase } from './src/config/supabase.ts';

// Función de prueba
async function testStorageSetup() {
  try {
    // 1. Verificar que el bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Buckets disponibles:', buckets);
    
    if (bucketsError) {
      console.error('Error obteniendo buckets:', bucketsError);
      return;
    }
    
    const bucket = buckets.find(b => b.name === 'gestorplayer-media');
    if (!bucket) {
      console.error('❌ Bucket gestorplayer-media no encontrado');
      return;
    }
    
    console.log('✅ Bucket encontrado:', bucket);
    
    // 2. Probar subida de archivo (necesitas un archivo de prueba)
    // const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    // const { data, error } = await supabase.storage
    //   .from('gestorplayer-media')
    //   .upload('test/test.txt', file);
    
    // if (error) {
    //   console.error('❌ Error subiendo archivo:', error);
    // } else {
    //   console.log('✅ Archivo subido correctamente:', data);
    // }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

// Ejecutar prueba
testStorageSetup();
```

## 📝 Notas Importantes

### URLs de Acceso
- Los archivos subidos serán accesibles públicamente en:
  ```
  https://[tu-proyecto].supabase.co/storage/v1/object/public/gestorplayer-media/[ruta-archivo]
  ```

### Estructura de Carpetas
- Los archivos se organizarán automáticamente en:
  ```
  gestorplayer-media/
  └── media/
      ├── [timestamp]_[id]_[nombre-archivo].[ext]
      ├── [timestamp]_[id]_[nombre-archivo].[ext]
      └── ...
  ```

### Límites y Restricciones
- **Tamaño máximo:** 15MB por archivo
- **Tipos permitidos:** Imágenes (jpg, png, gif, webp) y Videos (mp4, webm, mov)
- **Acceso:** Público (no requiere autenticación)

## 🔧 Configuración Adicional (Opcional)

### Para mayor seguridad en producción:

```sql
-- Crear función para limpiar nombres de archivo
CREATE OR REPLACE FUNCTION clean_filename(filename text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(filename, '[^a-zA-Z0-9._-]', '_', 'g'),
    '_{2,}', '_', 'g'
  );
END;
$$;

-- Trigger para limpiar nombres de archivo automáticamente
CREATE OR REPLACE FUNCTION clean_storage_filename()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.name = clean_filename(NEW.name);
  RETURN NEW;
END;
$$;

CREATE TRIGGER clean_filename_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION clean_storage_filename();
```

## ✅ Verificación Final

Para confirmar que todo está configurado correctamente:

1. ✅ Bucket `gestorplayer-media` creado
2. ✅ Bucket configurado como público
3. ✅ Políticas RLS configuradas
4. ✅ Límite de 15MB establecido
5. ✅ MIME types permitidos configurados

¡Una vez completada esta configuración, los archivos de GestorPlayer se almacenarán permanentemente en Supabase Storage! 🎉 