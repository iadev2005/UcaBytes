# Configuración de Supabase para Instagram Assistant

## Pasos para configurar Supabase

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL del proyecto y la anon key

### 2. Configurar Storage
1. En el dashboard de Supabase, ve a "Storage"
2. Crea un nuevo bucket llamado `uploads`
3. Configura las políticas de acceso:

```sql
-- Política para permitir subida de archivos
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Política para permitir lectura pública
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');
```

### 3. Configurar variables de entorno
1. Copia el archivo `env.example` como `.env.local`
2. Reemplaza las variables con tus credenciales reales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Verificar configuración
- Las imágenes y videos se subirán automáticamente a Supabase Storage
- Las URLs generadas se usarán para publicar en Instagram
- Los archivos se almacenan en el bucket `uploads`

## Funcionalidades implementadas

### Drag and Drop
- Arrastra y suelta imágenes y videos directamente en el área de upload
- Soporte para múltiples archivos (hasta 10)
- Preview en tiempo real dentro del área de drag and drop
- Muestra tanto archivos subidos como URLs manuales en el mismo lugar

### Integración con Instagram
- Las URLs de Supabase se combinan con URLs manuales
- Soporte para carruseles mixtos (imágenes + videos)
- Compatible con historias y posts normales
- Indicadores visuales para distinguir archivos de Supabase vs URLs manuales

### Características técnicas
- Validación de tipos de archivo (imágenes y videos)
- Generación de nombres únicos para evitar conflictos
- Manejo de errores y progreso de upload
- Limpieza automática del formulario después de publicar 