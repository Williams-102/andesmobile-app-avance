-- ============================================================================
-- CODE ANDES ACADEMY · ESPECIALIZACION EN DESARROLLO MOVIL 2026
-- SCRIPT MAESTRO CONSOLIDADO (MODULOS 07, 08 + 09)
-- Docente: Ing. Exar Williams Atao Paucar (CIP Reg. 304921)
-- Modulo 09: Pasarela de Pagos (Yape/Plin/Tarjeta), Validacion de Vouchers & Boletas
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLA DE USUARIOS Y PERFILES (ALUMNOS, DOCENTES Y ADMIN)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  nombre          TEXT NOT NULL,
  rol             TEXT NOT NULL DEFAULT 'alumno'
                    CHECK (rol IN ('alumno', 'docente', 'admin')),
  cip_colegiatura TEXT,
  avatar_url      TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  creado_en       TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.usuarios IS 'Perfiles de estudiantes y docentes de Code Andes Academy';

-- ----------------------------------------------------------------------------
-- 2. TABLA DE CURSOS (CATALOGO DE ESPECIALIZACIONES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cursos (
  id             TEXT PRIMARY KEY,
  titulo         TEXT NOT NULL,
  descripcion    TEXT NOT NULL,
  precio         NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
  precio_regular NUMERIC(10, 2),
  horas          INTEGER NOT NULL DEFAULT 120,
  rating         NUMERIC(2, 1) DEFAULT 4.9,
  nivel          TEXT DEFAULT 'Principiante',
  categoria      TEXT DEFAULT 'Movil',
  docente        TEXT DEFAULT 'Exar Williams Atao',
  imagen_url     TEXT NOT NULL,
  activo         BOOLEAN DEFAULT TRUE,
  creado_en      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cursos_categoria ON public.cursos(categoria);
CREATE INDEX IF NOT EXISTS idx_cursos_activo    ON public.cursos(activo);

-- ----------------------------------------------------------------------------
-- 3. TABLA DE MATRICULAS (CABECERA DE BOLETA DIGITAL - MODULO 09)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matriculas (
  id                      TEXT PRIMARY KEY,
  usuario_id              UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  total                   NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  subtotal                NUMERIC(10, 2) NOT NULL,
  igv                     NUMERIC(10, 2) NOT NULL,
  metodo_pago             TEXT NOT NULL DEFAULT 'Yape',
  numero_operacion        TEXT,
  voucher_url             TEXT,
  banco_origen            TEXT,
  ultimos_digitos_tarjeta TEXT,
  estado                  TEXT NOT NULL DEFAULT 'completado'
                            CHECK (estado IN ('pendiente', 'completado', 'cancelado')),
  ticket_offline_id       TEXT,
  fecha                   TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar migraciones si la tabla ya existia previamente
ALTER TABLE public.matriculas ADD COLUMN IF NOT EXISTS numero_operacion TEXT;
ALTER TABLE public.matriculas ADD COLUMN IF NOT EXISTS voucher_url TEXT;
ALTER TABLE public.matriculas ADD COLUMN IF NOT EXISTS banco_origen TEXT;
ALTER TABLE public.matriculas ADD COLUMN IF NOT EXISTS ultimos_digitos_tarjeta TEXT;

CREATE INDEX IF NOT EXISTS idx_matriculas_usuario ON public.matriculas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_estado  ON public.matriculas(estado);

-- ----------------------------------------------------------------------------
-- 4. TABLA DETALLE DE MATRICULA (CURSOS COMPRADOS POR BOLETA)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matricula_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id    TEXT NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  curso_id        TEXT NOT NULL REFERENCES public.cursos(id),
  precio_unitario NUMERIC(10, 2) NOT NULL,
  creado_en       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_matricula ON public.matricula_items(matricula_id);

-- ----------------------------------------------------------------------------
-- 5. GRANT DE PERMISOS PostgreSQL A LOS ROLES DE SUPABASE
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cursos          TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios        TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matriculas      TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matricula_items TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6. DATOS INICIALES DEL CATALOGO (SEED OFICIAL)
-- ----------------------------------------------------------------------------
INSERT INTO public.cursos (id, titulo, descripcion, precio, precio_regular, horas, rating, nivel, categoria, docente, imagen_url)
VALUES
  ('react-native-expo',
   'Desarrollo de Apps Moviles con React Native & Expo',
   'Aprende a crear aplicaciones Android e iOS profesionales con TypeScript, Expo Router y Supabase.',
   149.90, 250.00, 120, 4.9, 'Principiante', 'Movil', 'Exar Williams Atao',
   'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600'),

  ('backend-nestjs-supabase',
   'Arquitectura Backend y APIs con NestJS & PostgreSQL',
   'Disena microservicios escalables, autenticacion JWT y persistencia en la nube.',
   179.90, 290.00, 100, 4.8, 'Intermedio', 'Backend', 'Exar Williams Atao',
   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600'),

  ('cloud-aws-devops',
   'Especializacion Cloud Architecture & DevOps con AWS',
   'Despliegues continuos, Docker, Kubernetes y servicios cloud de alta disponibilidad.',
   199.90, 320.00, 140, 5.0, 'Avanzado', 'Cloud', 'Exar Williams Atao',
   'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600')

ON CONFLICT (id) DO UPDATE SET
  precio      = EXCLUDED.precio,
  titulo      = EXCLUDED.titulo,
  descripcion = EXCLUDED.descripcion;

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) Y POLITICAS DE ACCESO
-- ----------------------------------------------------------------------------
-- Habilitar RLS en todas las tablas publicas
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matricula_items ENABLE ROW LEVEL SECURITY;

-- Limpieza preventiva de politicas previas para evitar duplicados o conflictos
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('cursos', 'usuarios', 'matriculas', 'matricula_items')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Politica unificada para catalogo de cursos (lectura y administracion en clase)
CREATE POLICY "Permitir acceso completo cursos"
ON public.cursos FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Politica unificada para usuarios y perfiles
CREATE POLICY "Permitir acceso completo usuarios"
ON public.usuarios FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Politica unificada para matriculas (registro de compras y emision de boletas)
CREATE POLICY "Permitir acceso completo matriculas"
ON public.matriculas FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Politica unificada para items de matricula
CREATE POLICY "Permitir acceso completo matricula_items"
ON public.matricula_items FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 8. USUARIOS DEMO PARA PRUEBAS EN CLASE
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
  email           = EXCLUDED.email,
  nombre          = EXCLUDED.nombre,
  rol             = EXCLUDED.rol,
  cip_colegiatura = EXCLUDED.cip_colegiatura;

-- ----------------------------------------------------------------------------
-- 9. SUPABASE STORAGE — BUCKETS 'cursos' Y 'vouchers' (MODULO 09)
-- ----------------------------------------------------------------------------

-- A. Bucket de Portadas de Cursos (Modulo 08)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cursos', 'cursos', true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 5242880,
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
USING (bucket_id = 'cursos') WITH CHECK (bucket_id = 'cursos');

DROP POLICY IF EXISTS "Eliminacion imagenes admin cursos" ON storage.objects;
CREATE POLICY "Eliminacion imagenes admin cursos"
ON storage.objects FOR DELETE
USING (bucket_id = 'cursos');

-- B. Bucket de Comprobantes Bancarios Vouchers (Modulo 09)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vouchers', 'vouchers', true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Lectura publica comprobantes vouchers" ON storage.objects;
CREATE POLICY "Lectura publica comprobantes vouchers"
ON storage.objects FOR SELECT
USING (bucket_id = 'vouchers');

DROP POLICY IF EXISTS "Subida libre comprobantes vouchers" ON storage.objects;
CREATE POLICY "Subida libre comprobantes vouchers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vouchers');

DROP POLICY IF EXISTS "Actualizacion comprobantes vouchers" ON storage.objects;
CREATE POLICY "Actualizacion comprobantes vouchers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vouchers') WITH CHECK (bucket_id = 'vouchers');

DROP POLICY IF EXISTS "Eliminacion comprobantes vouchers" ON storage.objects;
CREATE POLICY "Eliminacion comprobantes vouchers"
ON storage.objects FOR DELETE
USING (bucket_id = 'vouchers');

-- ----------------------------------------------------------------------------
-- 10. TRIGGER AUTOMATICO AUTH -> USUARIOS
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
    COALESCE(NEW.raw_user_meta_data->>'avatar_url',
             'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200')
  )
  ON CONFLICT (email) DO UPDATE SET
    id     = EXCLUDED.id,
    nombre = COALESCE(EXCLUDED.nombre, public.usuarios.nombre),
    rol    = COALESCE(EXCLUDED.rol,    public.usuarios.rol);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.manejar_nuevo_usuario_auth();

-- ----------------------------------------------------------------------------
-- 11. RECARGA DE CACHE DE ESQUEMA POSTGREST (EVITA ERROR PGRST204)
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
