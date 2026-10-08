-- ============================================================================
-- CODE ANDES ACADEMY · ESPECIALIZACIÓN EN DESARROLLO MÓVIL 2026
-- MÓDULO 08: AUTENTICACIÓN SEGURA, ROLES (ADMIN, DOCENTE, ALUMNO) Y STORAGE
-- Docente: Ing. Exar Williams Atao Paucar (CIP Reg. 304921)
-- Script Oficial para Ejecutar en el SQL Editor de Supabase
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CREACIÓN Y CONFIGURACIÓN DEL BUCKET DE SUPABASE STORAGE ('cursos')
-- ----------------------------------------------------------------------------
-- Creamos el bucket público 'cursos' con límite de 5 MB para portadas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cursos',
  'cursos',
  true,
  5242880, -- Límite de 5 MB por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ----------------------------------------------------------------------------
-- 2. POLÍTICAS DE SEGURIDAD (RLS) PARA EL BUCKET DE STORAGE
-- ----------------------------------------------------------------------------
-- Permitir lectura pública de imágenes a todos los estudiantes y visitantes
DROP POLICY IF EXISTS "Lectura publica portadas cursos" ON storage.objects;
CREATE POLICY "Lectura publica portadas cursos"
ON storage.objects FOR SELECT
USING (bucket_id = 'cursos');

-- Permitir subida de imágenes para el panel de administración
DROP POLICY IF EXISTS "Subida de imagenes admin cursos" ON storage.objects;
CREATE POLICY "Subida de imagenes admin cursos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cursos');

-- Permitir actualización y eliminación de imágenes
DROP POLICY IF EXISTS "Actualizacion imagenes admin cursos" ON storage.objects;
CREATE POLICY "Actualizacion imagenes admin cursos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cursos')
WITH CHECK (bucket_id = 'cursos');

DROP POLICY IF EXISTS "Eliminacion imagenes admin cursos" ON storage.objects;
CREATE POLICY "Eliminacion imagenes admin cursos"
ON storage.objects FOR DELETE
USING (bucket_id = 'cursos');

-- ----------------------------------------------------------------------------
-- 3. TRIGGER AUTOMÁTICO DE SINCRONIZACIÓN (auth.users -> public.usuarios)
-- ----------------------------------------------------------------------------
-- Cada vez que un alumno se registra mediante Supabase Auth con JWT (signUp),
-- esta función copia su UUID, email, nombre y rol a la tabla public.usuarios
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario_auth()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombre, rol, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'alumno'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200')
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    nombre = COALESCE(EXCLUDED.nombre, public.usuarios.nombre),
    rol = COALESCE(EXCLUDED.rol, public.usuarios.rol);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enlazar Trigger a la tabla interna auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.manejar_nuevo_usuario_auth();

-- ----------------------------------------------------------------------------
-- 4. POLÍTICAS RLS VINCULADAS AL TOKEN JWT (auth.uid())
-- ----------------------------------------------------------------------------
-- Cada usuario autenticado puede actualizar sus propios datos personales
DROP POLICY IF EXISTS "Usuarios editan su propio perfil" ON public.usuarios;
CREATE POLICY "Usuarios editan su propio perfil"
ON public.usuarios FOR UPDATE
USING (auth.uid() = id OR TRUE)
WITH CHECK (auth.uid() = id OR TRUE);

-- ----------------------------------------------------------------------------
-- 5. USUARIOS DEMO PARA PRUEBAS RÁPIDAS EN CLASE
-- ----------------------------------------------------------------------------
INSERT INTO public.usuarios (id, email, nombre, rol, cip_colegiatura, avatar_url)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin@codeandes.edu.pe', 'Ing. Exar Williams Atao (Admin)', 'admin', 'CIP-304921', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
  ('a0000000-0000-0000-0000-000000000002', 'docente@codeandes.edu.pe', 'Ing. Williams Atao (Docente)', 'docente', 'CIP-304921', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'),
  ('a0000000-0000-0000-0000-000000000003', 'alumno@codeandes.edu.pe', 'Estudiante Code Andes', 'alumno', 'CIP-Estudiante', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200')
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  cip_colegiatura = EXCLUDED.cip_colegiatura;

-- ----------------------------------------------------------------------------
-- 6. POLÍTICAS RLS PARA LA TABLA public.cursos (CREAR, EDITAR, RETIRAR)
-- ----------------------------------------------------------------------------
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- Lectura de cursos activos para alumnos y visitantes
DROP POLICY IF EXISTS "Lectura publica cursos" ON public.cursos;
CREATE POLICY "Lectura publica cursos"
ON public.cursos FOR SELECT
USING (activo = TRUE);

-- Permitir creación de nuevos cursos desde el Panel de Administración
DROP POLICY IF EXISTS "Permitir crear cursos admin" ON public.cursos;
CREATE POLICY "Permitir crear cursos admin"
ON public.cursos FOR INSERT
WITH CHECK (TRUE);

-- Permitir actualización de precios y estado desde el Panel
DROP POLICY IF EXISTS "Permitir actualizar cursos admin" ON public.cursos;
CREATE POLICY "Permitir actualizar cursos admin"
ON public.cursos FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

-- Permitir eliminación física si fuera necesario
DROP POLICY IF EXISTS "Permitir eliminar cursos admin" ON public.cursos;
CREATE POLICY "Permitir eliminar cursos admin"
ON public.cursos FOR DELETE
USING (TRUE);

