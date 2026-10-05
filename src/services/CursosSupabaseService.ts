// src/services/CursosSupabaseService.ts
// Servicio para operaciones CRUD completas en el catálogo de especializaciones desde PostgreSQL en Supabase

import { supabase, isSupabaseConfigured } from './supabase';
import { CursoDB } from '../types/database';
import { Curso } from '../types/curso';
import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { CURSOS_MOCK } from '../constants/cursosData';

/**
 * Convierte un registro de PostgreSQL (snake_case) al modelo de interfaz móvil (camelCase)
 */
function mapCursoDBToCurso(db: CursoDB): Curso {
  return {
    id: db.id,
    codigo: `ANDES-${db.id.toUpperCase()}`,
    titulo: db.titulo,
    descripcion: db.descripcion,
    inversion: Number(db.precio),
    precioRegular: db.precio_regular ? Number(db.precio_regular) : undefined,
    duracion: `${db.horas || 120} hrs`,
    totalHorasAcademicas: db.horas || 120,
    rating: Number(db.rating || 4.9),
    nivel: (db.nivel as any) || 'Principiante',
    categoria: (db.categoria as any) || 'Móvil',
    docente: db.docente || 'Exar Williams Atao',
    imagenUrl: db.imagen_url,
    requisitos: [
      'Fundamentos de programación y lógica',
      'Computadora con Windows, Mac o Linux',
      'Smartphone Android o iPhone con Expo Go instalado',
    ],
    temario: [
      'Módulo 01: Fundamentos de React Native y Expo CLI',
      'Módulo 02: TypeScript Estricto y Componentes Nativos',
      'Módulo 03: Estilos Modernos y Responsive Flexbox',
      'Módulo 04: Navegación Basada en Archivos con Expo Router',
      'Módulo 05: Estado Global Reactivo con Context API',
      'Módulo 06: Arquitectura Offline First y AsyncStorage',
      'Módulo 07: Backend Cloud y Base de Datos con Supabase',
    ],
    modalidad: 'Virtual en vivo',
    moneda: 'PEN',
    estado: 'disponible',
  };
}

export const CursosSupabaseService = {
  // --------------------------------------------------------------------------
  // 1. READ: Obtener todos los cursos activos con fallback a caché local
  // --------------------------------------------------------------------------
  async obtenerCursos(): Promise<Curso[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('cursos')
          .select('*')
          .eq('activo', true)
          .order('precio', { ascending: true });

        if (!error && data && data.length > 0) {
          const cursosMapeados = (data as CursoDB[]).map(mapCursoDBToCurso);
          await StorageService.set(STORAGE_KEYS.CACHE_CURSOS, cursosMapeados);
          console.log(`[CursosSupabaseService] ☁️ ${cursosMapeados.length} cursos cargados en vivo desde PostgreSQL en Supabase.`);
          return cursosMapeados;
        }

        if (error) {
          console.warn('[CursosSupabaseService] Aviso de consulta Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[CursosSupabaseService] Error de conexión con Supabase, usando respaldo offline:', err);
      }
    }

    // Fallback 1: Leer de la caché local persistente en disco (Módulo 06)
    const cacheLocal = await StorageService.get<Curso[]>(STORAGE_KEYS.CACHE_CURSOS, []);
    if (cacheLocal && cacheLocal.length > 0) {
      console.log(`[CursosSupabaseService] 📦 ${cacheLocal.length} cursos cargados desde caché local AsyncStorage.`);
      return cacheLocal;
    }

    // Fallback 2: Semilla inicial si la app abre por primera vez
    await StorageService.set(STORAGE_KEYS.CACHE_CURSOS, CURSOS_MOCK);
    return CURSOS_MOCK;
  },

  // --------------------------------------------------------------------------
  // 2. READ BY ID: Obtener curso específico
  // --------------------------------------------------------------------------
  async obtenerCursoPorId(id: string): Promise<Curso | undefined> {
    const cursos = await this.obtenerCursos();
    return cursos.find((c) => c.id === id);
  },

  // --------------------------------------------------------------------------
  // 3. CREATE: Crear un nuevo curso en el catálogo (Panel Administrativo)
  // --------------------------------------------------------------------------
  async crearCurso(cursoNuevo: Omit<CursoDB, 'creado_en'>): Promise<{ exito: boolean; mensaje: string; curso?: Curso }> {
    if (!isSupabaseConfigured) {
      // Modo local: Guardar en caché
      const cursos = await this.obtenerCursos();
      const nuevoMapeado = mapCursoDBToCurso(cursoNuevo as CursoDB);
      const listaActualizada = [nuevoMapeado, ...cursos];
      await StorageService.set(STORAGE_KEYS.CACHE_CURSOS, listaActualizada);
      return { exito: true, mensaje: 'Curso creado localmente (Modo sin Supabase)', curso: nuevoMapeado };
    }

    try {
      const { data, error } = await supabase
        .from('cursos')
        .insert([cursoNuevo])
        .select()
        .single();

      if (error) {
        console.error('[CursosSupabaseService] Error en INSERT curso:', error.message);
        return { exito: false, mensaje: error.message };
      }

      const cursoCreado = mapCursoDBToCurso(data as CursoDB);
      // Refrescar caché local
      const cursosActuales = await StorageService.get<Curso[]>(STORAGE_KEYS.CACHE_CURSOS, []);
      await StorageService.set(STORAGE_KEYS.CACHE_CURSOS, [cursoCreado, ...cursosActuales]);

      console.log(`[CursosSupabaseService] ☁️ Curso "${cursoCreado.titulo}" insertado con éxito en PostgreSQL.`);
      return { exito: true, mensaje: 'Curso creado con éxito en Supabase Cloud', curso: cursoCreado };
    } catch (err: any) {
      return { exito: false, mensaje: err?.message || 'Error de conexión al crear curso' };
    }
  },

  // --------------------------------------------------------------------------
  // 4. UPDATE: Actualizar precio de un curso (Asignación de Precios)
  // --------------------------------------------------------------------------
  async actualizarPrecio(id: string, nuevoPrecio: number, precioRegular?: number): Promise<{ exito: boolean; mensaje: string }> {
    if (!isSupabaseConfigured) {
      // Modo local
      const cursos = await this.obtenerCursos();
      const actualizados = cursos.map((c) =>
        c.id === id ? { ...c, inversion: nuevoPrecio, precioRegular: precioRegular ?? c.precioRegular } : c
      );
      await StorageService.set(STORAGE_KEYS.CACHE_CURSOS, actualizados);
      return { exito: true, mensaje: 'Precio actualizado localmente' };
    }

    try {
      const updateData: any = { precio: nuevoPrecio };
      if (precioRegular !== undefined) updateData.precio_regular = precioRegular;

      const { error } = await supabase
        .from('cursos')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('[CursosSupabaseService] Error en UPDATE precio:', error.message);
        return { exito: false, mensaje: error.message };
      }

      // Sincronizar en caché local
      const cursos = await StorageService.get<Curso[]>(STORAGE_KEYS.CACHE_CURSOS, []);
      const actualizados = cursos.map((c) =>
        c.id === id ? { ...c, inversion: nuevoPrecio, precioRegular: precioRegular ?? c.precioRegular } : c
      );
      await StorageService.set(STORAGE_KEYS.CACHE_CURSOS, actualizados);

      console.log(`[CursosSupabaseService] ☁️ Precio del curso #${id} actualizado a S/ ${nuevoPrecio.toFixed(2)}.`);
      return { exito: true, mensaje: 'Precio actualizado con éxito en Supabase' };
    } catch (err: any) {
      return { exito: false, mensaje: err?.message || 'Error al actualizar precio' };
    }
  },

  // --------------------------------------------------------------------------
  // 5. UPDATE COMPLETO: Modificar datos generales de un curso
  // --------------------------------------------------------------------------
  async actualizarCurso(id: string, campos: Partial<CursoDB>): Promise<{ exito: boolean; mensaje: string }> {
    if (!isSupabaseConfigured) {
      return { exito: true, mensaje: 'Modificado localmente' };
    }

    try {
      const { error } = await supabase
        .from('cursos')
        .update(campos)
        .eq('id', id);

      if (error) return { exito: false, mensaje: error.message };
      return { exito: true, mensaje: 'Curso actualizado con éxito' };
    } catch (err: any) {
      return { exito: false, mensaje: err?.message || 'Error al actualizar curso' };
    }
  },

  // --------------------------------------------------------------------------
  // 6. DELETE: Eliminar o desactivar un curso (Soft Delete recomendado)
  // --------------------------------------------------------------------------
  async eliminarCurso(id: string, permanente = false): Promise<{ exito: boolean; mensaje: string }> {
    if (!isSupabaseConfigured) {
      const cursos = await this.obtenerCursos();
      const filtrados = cursos.filter((c) => c.id !== id);
      await StorageService.set(STORAGE_KEYS.CACHE_CURSOS, filtrados);
      return { exito: true, mensaje: 'Curso eliminado de la caché local' };
    }

    try {
      if (permanente) {
        // Hard Delete
        const { error } = await supabase.from('cursos').delete().eq('id', id);
        if (error) return { exito: false, mensaje: error.message };
      } else {
        // Soft Delete (recomendado en producción para preservar integridad con matriculas)
        const { error } = await supabase.from('cursos').update({ activo: false }).eq('id', id);
        if (error) return { exito: false, mensaje: error.message };
      }

      // Remover de caché local
      const cursos = await StorageService.get<Curso[]>(STORAGE_KEYS.CACHE_CURSOS, []);
      const filtrados = cursos.filter((c) => c.id !== id);
      await StorageService.set(STORAGE_KEYS.CACHE_CURSOS, filtrados);

      console.log(`[CursosSupabaseService] 🗑️ Curso #${id} eliminado/desactivado con éxito.`);
      return { exito: true, mensaje: 'Curso retirado del catálogo con éxito' };
    } catch (err: any) {
      return { exito: false, mensaje: err?.message || 'Error al eliminar curso' };
    }
  },
};
