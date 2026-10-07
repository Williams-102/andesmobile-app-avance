-- ============================================================================
-- CODE ANDES ACADEMY · ESPECIALIZACIÓN EN DESARROLLO MÓVIL 2026
-- MÓDULO 07: BACKEND EN LA NUBE Y BASE DE DATOS RELACIONAL CON SUPABASE
-- Docente: Exar Williams Atao Paucar
-- Script Oficial de Base de Datos para Andes Mobile App
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLA DE USUARIOS Y PERFILES (ALUMNOS Y DOCENTES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'alumno' CHECK (rol IN ('alumno', 'docente', 'admin')),
  cip_colegiatura TEXT,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.usuarios IS 'Perfiles de estudiantes y docentes de Code Andes Academy';

-- ----------------------------------------------------------------------------
-- 2. TABLA DE CURSOS (CATÁLOGO DE ESPECIALIZACIONES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cursos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
  precio_regular NUMERIC(10, 2),
  horas INTEGER NOT NULL DEFAULT 120,
  rating NUMERIC(2, 1) DEFAULT 4.9,
  nivel TEXT DEFAULT 'Principiante',
  categoria TEXT DEFAULT 'Móvil',
  docente TEXT DEFAULT 'Exar Williams Atao',
  imagen_url TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cursos_categoria ON public.cursos(categoria);
CREATE INDEX IF NOT EXISTS idx_cursos_activo ON public.cursos(activo);

-- ----------------------------------------------------------------------------
-- 3. TABLA DE MATRÍCULAS (CABECERA DE PEDIDO / BOLETAS DIGITALES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matriculas (
  id TEXT PRIMARY KEY,                       -- Ej: 'BOL-2026-4821'
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  subtotal NUMERIC(10, 2) NOT NULL,
  igv NUMERIC(10, 2) NOT NULL,
  metodo_pago TEXT NOT NULL DEFAULT 'Yape / Plin / Tarjeta',
  estado TEXT NOT NULL DEFAULT 'completado' 
    CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
  ticket_offline_id TEXT,                    -- ID si provino de la cola FIFO SyncEngine
  fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matriculas_usuario ON public.matriculas(usuario_id);

-- ----------------------------------------------------------------------------
-- 4. TABLA DETALLE DE MATRÍCULA (CURSOS COMPRADOS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matricula_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id TEXT NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  curso_id TEXT NOT NULL REFERENCES public.cursos(id),
  precio_unitario NUMERIC(10, 2) NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_matricula ON public.matricula_items(matricula_id);

-- ----------------------------------------------------------------------------
-- 5. DATOS INICIALES (SEED OFICIAL)
-- ----------------------------------------------------------------------------
INSERT INTO public.cursos (id, titulo, descripcion, precio, precio_regular, horas, rating, nivel, categoria, docente, imagen_url)
VALUES
('react-native-expo', 'Desarrollo de Apps Móviles con React Native & Expo', 'Aprende a crear aplicaciones Android e iOS profesionales con TypeScript, Expo Router y Supabase.', 149.90, 250.00, 120, 4.9, 'Principiante', 'Móvil', 'Exar Williams Atao', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600'),
('backend-nestjs-supabase', 'Arquitectura Backend y APIs con NestJS & PostgreSQL', 'Diseña microservicios escalables, autenticación JWT y persistencia en la nube.', 179.90, 290.00, 100, 4.8, 'Intermedio', 'Backend', 'Exar Williams Atao', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600'),
('cloud-aws-devops', 'Especialización Cloud Architecture & DevOps con AWS', 'Despliegues continuos, Docker, Kubernetes y servicios cloud de alta disponibilidad.', 199.90, 320.00, 140, 5.0, 'Avanzado', 'Cloud', 'Exar Williams Atao', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600')
ON CONFLICT (id) DO UPDATE SET
  precio = EXCLUDED.precio,
  titulo = EXCLUDED.titulo,
  descripcion = EXCLUDED.descripcion;

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) & POLÍTICAS DE ACCESO
-- ----------------------------------------------------------------------------
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matricula_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Cursos: Lectura pública para cualquier visitante
DROP POLICY IF EXISTS "Lectura publica cursos" ON public.cursos;
CREATE POLICY "Lectura publica cursos"
ON public.cursos FOR SELECT
USING (activo = TRUE);

-- Cursos: Operaciones CRUD de Administración (Crear, Editar precios, Eliminar)
DROP POLICY IF EXISTS "Permitir crear cursos admin" ON public.cursos;
CREATE POLICY "Permitir crear cursos admin"
ON public.cursos FOR INSERT
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Permitir actualizar cursos admin" ON public.cursos;
CREATE POLICY "Permitir actualizar cursos admin"
ON public.cursos FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Permitir eliminar cursos admin" ON public.cursos;
CREATE POLICY "Permitir eliminar cursos admin"
ON public.cursos FOR DELETE
USING (TRUE);


-- Matrículas: Permitir inserción y lectura de compras
DROP POLICY IF EXISTS "Permitir crear matriculas" ON public.matriculas;
CREATE POLICY "Permitir crear matriculas"
ON public.matriculas FOR INSERT
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Permitir ver matriculas" ON public.matriculas;
CREATE POLICY "Permitir ver matriculas"
ON public.matriculas FOR SELECT
USING (TRUE);

-- Items de Matrícula: Permitir inserción y lectura
DROP POLICY IF EXISTS "Permitir crear items" ON public.matricula_items;
CREATE POLICY "Permitir crear items"
ON public.matricula_items FOR INSERT
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Permitir ver items" ON public.matricula_items;
CREATE POLICY "Permitir ver items"
ON public.matricula_items FOR SELECT
USING (TRUE);

-- Usuarios: Políticas RLS para login, registro y lectura de perfiles
DROP POLICY IF EXISTS "Lectura publica usuarios" ON public.usuarios;
CREATE POLICY "Lectura publica usuarios"
ON public.usuarios FOR SELECT
USING (TRUE);

DROP POLICY IF EXISTS "Permitir crear usuarios" ON public.usuarios;
CREATE POLICY "Permitir crear usuarios"
ON public.usuarios FOR INSERT
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Permitir actualizar usuarios" ON public.usuarios;
CREATE POLICY "Permitir actualizar usuarios"
ON public.usuarios FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

-- 7. USUARIOS SEMILLA (ADMINISTRADOR, DOCENTE, ALUMNO)
INSERT INTO public.usuarios (id, email, nombre, rol, cip_colegiatura, avatar_url)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin@codeandes.edu.pe', 'Exar Williams (Admin)', 'admin', 'CIP-304921', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
  ('a0000000-0000-0000-0000-000000000002', 'docente@codeandes.edu.pe', 'Ing. Williams Atao (Docente)', 'docente', 'CIP-304921', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'),
  ('a0000000-0000-0000-0000-000000000003', 'alumno@codeandes.edu.pe', 'Estudiante Code Andes', 'alumno', 'CIP-Estudiante', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200')
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  cip_colegiatura = EXCLUDED.cip_colegiatura;

-- ----------------------------------------------------------------------------
-- 8. SUPABASE STORAGE: BUCKET DE CURSOS Y POLÍTICAS (MÓDULO 08)
-- ----------------------------------------------------------------------------
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

DROP POLICY IF EXISTS "Lectura publica portadas cursos" ON storage.objects;
CREATE POLICY "Lectura publica portadas cursos"
ON storage.objects FOR SELECT
USING (bucket_id = 'cursos');

DROP POLICY IF EXISTS "Subida de imagenes admin cursos" ON storage.objects;
CREATE POLICY "Subida de imagenes admin cursos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cursos');

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
-- 9. TRIGGER DE SINCRONIZACIÓN AUTOMÁTICA ENTRE SUPABASE AUTH Y USUARIOS
-- ----------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.manejar_nuevo_usuario_auth();

