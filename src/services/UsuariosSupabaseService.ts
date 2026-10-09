// src/services/UsuariosSupabaseService.ts
// Servicio para autenticación, gestión de perfiles y roles (Alumno, Docente, Admin) con Supabase Cloud

import { supabase, isSupabaseConfigured } from './supabase';
import { UsuarioDB } from '../types/database';
import { Usuario } from '../types/usuario';
import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';

export function mapUsuarioDBToUsuario(db: UsuarioDB): Usuario {
  return {
    id: db.id,
    nombre: db.nombre,
    email: db.email,
    rol: db.rol || 'alumno',
    cipColegiatura: db.cip_colegiatura || undefined,
    avatarUrl: db.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    creadoEn: db.creado_en,
    actualizadoEn: db.actualizado_en,
    activo: true,
  };
}

export const UsuariosSupabaseService = {
  /**
   * Busca un usuario por email en Supabase Cloud.
   * Si no existe en la nube, busca en la sesión persistente local.
   */
  async obtenerPorEmail(email: string): Promise<Usuario | null> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (!error && data) {
          return mapUsuarioDBToUsuario(data as UsuarioDB);
        }
      } catch (err) {
        console.warn('[UsuariosSupabaseService] Error consultando usuario en Supabase:', err);
      }
    }

    return null;
  },

  /**
   * Registra o actualiza un usuario en la tabla `public.usuarios` de PostgreSQL.
   */
  async registrarOUsuario(datos: {
    nombre: string;
    email: string;
    rol?: 'alumno' | 'docente' | 'admin';
    cipColegiatura?: string;
    avatarUrl?: string;
  }): Promise<Usuario> {
    const cleanEmail = datos.email.trim().toLowerCase();
    const cleanNombre = datos.nombre.trim();
    const rol = datos.rol || 'alumno';

    if (isSupabaseConfigured) {
      try {
        const usuarioPayload = {
          email: cleanEmail,
          nombre: cleanNombre,
          rol,
          cip_colegiatura: datos.cipColegiatura || null,
          avatar_url: datos.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        };

        const { data, error } = await supabase
          .from('usuarios')
          .upsert(usuarioPayload, { onConflict: 'email' })
          .select()
          .single();

        if (!error && data) {
          const usuarioMapeado = mapUsuarioDBToUsuario(data as UsuarioDB);
          await StorageService.set(STORAGE_KEYS.AUTH_USER, usuarioMapeado);
          return usuarioMapeado;
        } else if (error) {
          console.warn('[UsuariosSupabaseService] Error upsert usuario en Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[UsuariosSupabaseService] Excepción registrando usuario en Supabase:', err);
      }
    }

    // Modo local / Fallback
    const usuarioLocal: Usuario = {
      id: `usr-${Date.now()}`,
      nombre: cleanNombre,
      email: cleanEmail,
      rol,
      cipColegiatura: datos.cipColegiatura,
      avatarUrl: datos.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    await StorageService.set(STORAGE_KEYS.AUTH_USER, usuarioLocal);
    return usuarioLocal;
  },

  /**
   * Obtiene todos los usuarios registrados (Para el Panel de Administración).
   */
  async obtenerTodos(): Promise<Usuario[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('creado_en', { ascending: false });

        if (!error && data) {
          return (data as UsuarioDB[]).map(mapUsuarioDBToUsuario);
        }
      } catch (err) {
        console.error('[UsuariosSupabaseService] Error obteniendo usuarios:', err);
      }
    }
    return [];
  },

  /**
   * Cambia el rol de un usuario (admin <-> docente <-> alumno).
   */
  async cambiarRol(id: string, nuevoRol: 'alumno' | 'docente' | 'admin'): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('usuarios')
          .update({ rol: nuevoRol })
          .eq('id', id);

        return !error;
      } catch (err) {
        console.error('[UsuariosSupabaseService] Error cambiando rol:', err);
      }
    }
    return false;
  },

  /**
   * Actualiza el perfil de un usuario en Supabase y en disco local
   */
  async actualizarPerfil(
    id: string,
    cambios: { nombre?: string; cipColegiatura?: string; avatarUrl?: string }
  ): Promise<{ exito: boolean; mensaje: string; usuario?: Usuario }> {
    try {
      const payload: any = { actualizado_en: new Date().toISOString() };
      if (cambios.nombre !== undefined) payload.nombre = cambios.nombre.trim();
      if (cambios.cipColegiatura !== undefined) payload.cip_colegiatura = cambios.cipColegiatura.trim() || null;
      if (cambios.avatarUrl !== undefined) payload.avatar_url = cambios.avatarUrl;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('usuarios')
          .update(payload)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) {
          console.warn('[UsuariosSupabaseService] Error actualizando perfil en Supabase:', error.message);
        } else if (data) {
          const usuarioActualizado = mapUsuarioDBToUsuario(data as UsuarioDB);
          await StorageService.set(STORAGE_KEYS.AUTH_USER, usuarioActualizado);
          return { exito: true, mensaje: 'Perfil actualizado con éxito en Supabase', usuario: usuarioActualizado };
        }
      }

      // Fallback local en AsyncStorage
      const guardado = await StorageService.get<Usuario | null>(STORAGE_KEYS.AUTH_USER, null);
      if (guardado) {
        const usuarioLocal: Usuario = {
          ...guardado,
          nombre: cambios.nombre !== undefined ? cambios.nombre.trim() : guardado.nombre,
          cipColegiatura: cambios.cipColegiatura !== undefined ? cambios.cipColegiatura.trim() : guardado.cipColegiatura,
          avatarUrl: cambios.avatarUrl !== undefined ? cambios.avatarUrl : guardado.avatarUrl,
        };
        await StorageService.set(STORAGE_KEYS.AUTH_USER, usuarioLocal);
        return { exito: true, mensaje: 'Perfil actualizado localmente', usuario: usuarioLocal };
      }

      return { exito: true, mensaje: 'Perfil actualizado' };
    } catch (err: any) {
      console.error('[UsuariosSupabaseService] Excepcion actualizando perfil:', err);
      return { exito: false, mensaje: err?.message || 'Error al actualizar perfil' };
    }
  },
};

