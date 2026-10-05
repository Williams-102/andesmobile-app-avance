// src/services/CursosSupabaseService.ts
// Servicio para consultar el catálogo de especializaciones desde PostgreSQL en Supabase con resiliencia offline

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
  /**
   * Obtiene todos los cursos activos desde Supabase Cloud.
   * Si no hay red o aún no se han configurado credenciales en el .env,
   * recurre transparentemente a la caché local persistente en AsyncStorage.
   */
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
          // Guardar copia fresca en AsyncStorage para soporte Offline First
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

    // Fallback 2: Semilla inicial del catálogo si la app abre por primera vez sin internet
    await StorageService.set(STORAGE_KEYS.CACHE_CURSOS, CURSOS_MOCK);
    return CURSOS_MOCK;
  },

  /**
   * Obtiene un curso específico por su identificador
   */
  async obtenerCursoPorId(id: string): Promise<Curso | undefined> {
    const cursos = await this.obtenerCursos();
    return cursos.find((c) => c.id === id);
  },
};
