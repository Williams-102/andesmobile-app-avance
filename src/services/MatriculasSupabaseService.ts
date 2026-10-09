// src/services/MatriculasSupabaseService.ts
// Servicio para registrar matriculas y pedidos en las tablas relacionales de PostgreSQL en Supabase (Modulos 07, 08 y 09)

import { supabase, isSupabaseConfigured } from './supabase';
import { MatriculaDB, MatriculaItemDB } from '../types/database';

export const MatriculasSupabaseService = {
  /**
   * Inserta una matricula con sus items en Supabase
   */
  async crearMatricula(
    matricula: Omit<MatriculaDB, 'fecha'>,
    items: Omit<MatriculaItemDB, 'id' | 'matricula_id'>[]
  ): Promise<{ exito: boolean; mensaje: string }> {
    if (!isSupabaseConfigured) {
      console.log('[MatriculasSupabase] Supabase no configurado con credenciales reales. Simulando exito local.');
      return { exito: true, mensaje: 'Modo local sin credenciales configuradas' };
    }

    try {
      // 1. Insertar la cabecera en la tabla 'matriculas'
      const { error: errMatricula } = await supabase
        .from('matriculas')
        .insert([matricula]);

      if (errMatricula) {
        console.error('[MatriculasSupabase] Error insertando cabecera de matricula:', errMatricula);
        return { exito: false, mensaje: errMatricula.message };
      }

      // 2. Insertar los items en 'matricula_items'
      if (items.length > 0) {
        const itemsPayload = items.map((it) => ({
          matricula_id: matricula.id,
          curso_id: it.curso_id,
          precio_unitario: it.precio_unitario,
        }));

        const { error: errItems } = await supabase
          .from('matricula_items')
          .insert(itemsPayload);

        if (errItems) {
          console.error('[MatriculasSupabase] Error insertando items de matricula:', errItems);
          return { exito: false, mensaje: errItems.message };
        }
      }

      console.log(`[MatriculasSupabase] Matricula ${matricula.id} guardada con exito en PostgreSQL.`);
      return { exito: true, mensaje: 'Matricula registrada exitosamente en Supabase' };
    } catch (err: any) {
      console.error('[MatriculasSupabase] Error inesperado:', err);
      return { exito: false, mensaje: err?.message || 'Error de conexion con Supabase' };
    }
  },

  /**
   * Obtiene las matriculas registradas por un usuario especifico
   */
  async obtenerMatriculasPorUsuario(usuarioId: string): Promise<MatriculaDB[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('matriculas')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('fecha', { ascending: false });

      if (error) {
        console.warn('[MatriculasSupabase] Error consultando matriculas:', error.message);
        return [];
      }
      return data || [];
    } catch (e) {
      return [];
    }
  },
};
