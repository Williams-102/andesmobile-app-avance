// src/context/AuthContext.tsx
// Gestión de Estado Global de Sesión de Usuario (Módulos 05 y 06 - Persistencia Offline con AsyncStorage)

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Usuario, AuthContextType } from '../types/usuario';
import { StorageService } from '../services/StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { UsuariosSupabaseService } from '../services/UsuariosSupabaseService';

import { AuthServiceSupabase } from '../services/AuthServiceSupabase';

// 1. Creación del Canal de Contexto tipado
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// 2. Componente Proveedor (La Antena) con persistencia en disco y JWT
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true); // Inicia en true mientras restaura sesión

  // Restauración de sesión persistente en AsyncStorage y Supabase Auth
  useEffect(() => {
    let isMounted = true;
    const restaurarSesion = async () => {
      try {
        const usuarioGuardado = await StorageService.get<Usuario | null>(STORAGE_KEYS.AUTH_USER, null);
        const sesionSupabase = await AuthServiceSupabase.obtenerSesionActual();

        if (isMounted) {
          if (usuarioGuardado) {
            setUsuario(usuarioGuardado);
          }
          if (sesionSupabase?.access_token) {
            setToken(sesionSupabase.access_token);
          }
        }
      } catch (error) {
        console.error('[AuthContext] Error restaurando sesión persistente:', error);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    restaurarSesion();
    return () => {
      isMounted = false;
    };
  }, []);

  // Iniciar Sesión conectando con Supabase Auth & JWT
  const login = useCallback(
    async (email: string, password?: string, nombre?: string, rol?: 'alumno' | 'docente' | 'admin') => {
      setCargando(true);
      try {
        const resultado = await AuthServiceSupabase.login(email, password);
        if (resultado.exito && resultado.usuario) {
          setUsuario(resultado.usuario);
          setToken(resultado.token || null);
          console.log(`[AuthContext] Sesión JWT iniciada como [${resultado.usuario.rol.toUpperCase()}]: ${resultado.usuario.nombre}`);
        }
      } catch (error) {
        console.error('[AuthContext] Error en login:', error);
        throw error;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  // Registrar nueva cuenta en Supabase Cloud con JWT y Rol
  const registro = useCallback(
    async (datos: {
      nombre: string;
      email: string;
      password?: string;
      cipColegiatura?: string;
      telefono?: string;
      rol?: 'alumno' | 'docente' | 'admin';
    }) => {
      setCargando(true);
      try {
        const resultado = await AuthServiceSupabase.registrar(datos);
        if (resultado.exito && resultado.usuario) {
          setUsuario(resultado.usuario);
          setToken(resultado.token || null);
          console.log(`[AuthContext] Registro JWT completado con éxito en Supabase: ${resultado.usuario.email}`);
        }
      } catch (error) {
        console.error('[AuthContext] Error en registro:', error);
        throw error;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  // Cerrar Sesión y purgar de AsyncStorage
  const logout = useCallback(async () => {
    await AuthServiceSupabase.cerrarSesion();
    setUsuario(null);
    setToken(null);
  }, []);

  // Recuperar contraseña
  const recuperarPassword = useCallback(async (email: string) => {
    return AuthServiceSupabase.recuperarPassword(email);
  }, []);

  // Actualizar datos del perfil y sincronizar con AsyncStorage
  const actualizarPerfil = useCallback((datos: Partial<Usuario>) => {
    setUsuario((prev) => {
      if (!prev) return null;
      const actualizado: Usuario = {
        ...prev,
        ...datos,
        actualizadoEn: new Date().toISOString(),
      };
      StorageService.set(STORAGE_KEYS.AUTH_USER, actualizado);
      return actualizado;
    });
  }, []);

  // Memorización del valor de contexto para evitar re-renderizados innecesarios
  const value = useMemo(
    () => ({
      usuario,
      token,
      estaAutenticado: !!usuario,
      cargando,
      login,
      registro,
      logout,
      actualizarPerfil,
      recuperarPassword,
    }),
    [usuario, token, cargando, login, registro, logout, actualizarPerfil, recuperarPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Hook Personalizado de Consumo Seguro (Custom Hook con Escudo Anticaídas)
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe ser utilizado dentro de un <AuthProvider>. ' +
      'Asegúrate de envolver tu app en app/_layout.tsx.'
    );
  }

  return context;
}
