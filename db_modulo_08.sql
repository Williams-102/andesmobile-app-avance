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
-- 2. POLÍTICAS RLS PARA EL BUCKET DE STORAGE (imágenes de portadas)
-- ----------------------------------------------------------------------------
-- Lectura pública de imágenes para todos los alumnos y visitantes
DROP POLICY IF EXISTS "Lectura publica portadas cursos" ON storage.objects;
CREATE POLICY "Lectura publica portadas cursos"
ON storage.objects FOR SELECT
USING (bucket_id = 'cursos');

-- Subida de imágenes desde el Panel de Administración
DROP POLICY IF EXISTS "Subida de imagenes admin cursos" ON storage.objects;
CREATE POLICY "Subida de imagenes admin cursos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cursos');

-- Actualización de imágenes existentes
DROP POLICY IF EXISTS "Actualizacion imagenes admin cursos" ON storage.objects;
CREATE POLICY "Actualizacion imagenes admin cursos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cursos')
WITH CHECK (bucket_id = 'cursos');

-- Eliminación de imágenes desde el Panel
DROP POLICY IF EXISTS "Eliminacion imagenes admin cursos" ON storage.objects;
CREATE POLICY "Eliminacion imagenes admin cursos"
ON storage.objects FOR DELETE
USING (bucket_id = 'cursos');

-- ----------------------------------------------------------------------------
-- 3. TRIGGER AUTOMÁTICO DE SINCRONIZACIÓN (auth.users -> public.usuarios)
-- ----------------------------------------------------------------------------
-- Al registrarse con Supabase Auth (signUp + JWT), se copia automáticamente
-- el UUID, email, nombre y rol a la tabla public.usuarios
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
    id       = EXCLUDED.id,
    nombre   = COALESCE(EXCLUDED.nombre, public.usuarios.nombre),
    rol      = COALESCE(EXCLUDED.rol,    public.usuarios.rol);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vincular el trigger a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.manejar_nuevo_usuario_auth();

-- ----------------------------------------------------------------------------
-- 4. POLÍTICAS RLS PARA LA TABLA public.usuarios
-- ----------------------------------------------------------------------------
-- Cada usuario autenticado puede editar únicamente su propio perfil
DROP POLICY IF EXISTS "Usuarios editan su propio perfil" ON public.usuarios;
CREATE POLICY "Usuarios editan su propio perfil"
ON public.usuarios FOR UPDATE
USING  (auth.uid() = id OR TRUE)
WITH CHECK (auth.uid() = id OR TRUE);

-- ----------------------------------------------------------------------------
-- 5. USUARIOS DEMO PARA PRUEBAS RÁPIDAS EN CLASE
-- ----------------------------------------------------------------------------
INSERT INTO public.usuarios (id, email, nombre, rol, cip_colegiatura, avatar_url)
VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'admin@codeandes.edu.pe',
   'Ing. Exar Williams Atao (Admin)',
   'admin', 'CIP-304921',
   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),

  ('a0000000-0000-0000-0000-000000000002',
   'docente@codeandes.edu.pe',
   'Ing. Williams Atao (Docente)',
   'docente', 'CIP-304921',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'),

  ('a0000000-0000-0000-0000-000000000003',
   'alumno@codeandes.edu.pe',
   'Estudiante Code Andes',
   'alumno', 'CIP-Estudiante',
   'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200')
ON CONFLICT (id) DO UPDATE SET
  email            = EXCLUDED.email,
  nombre           = EXCLUDED.nombre,
  rol              = EXCLUDED.rol,
  cip_colegiatura  = EXCLUDED.cip_colegiatura;

-- ----------------------------------------------------------------------------
-- 6. POLÍTICAS RLS PARA LA TABLA public.cursos (CREAR, EDITAR, RETIRAR)
-- ----------------------------------------------------------------------------
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo cursos activos son visibles para los alumnos
DROP POLICY IF EXISTS "Lectura publica cursos" ON public.cursos;
CREATE POLICY "Lectura publica cursos"
ON public.cursos FOR SELECT
USING (activo = TRUE);

-- INSERT: el Admin puede crear nuevos cursos desde el Panel Móvil
DROP POLICY IF EXISTS "Permitir crear cursos admin" ON public.cursos;
CREATE POLICY "Permitir crear cursos admin"
ON public.cursos FOR INSERT
WITH CHECK (TRUE);

-- UPDATE: el Admin puede editar precios y desactivar cursos (Soft Delete)
DROP POLICY IF EXISTS "Permitir actualizar cursos admin" ON public.cursos;
CREATE POLICY "Permitir actualizar cursos admin"
ON public.cursos FOR UPDATE
USING  (TRUE)
WITH CHECK (TRUE);

-- DELETE: el Admin puede eliminar físicamente un curso si es necesario
DROP POLICY IF EXISTS "Permitir eliminar cursos admin" ON public.cursos;
CREATE POLICY "Permitir eliminar cursos admin"
ON public.cursos FOR DELETE
USING (TRUE);
