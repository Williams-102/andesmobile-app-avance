// src/context/AuthContext.tsx
// Gestión de Estado Global de Sesión de Usuario (Módulos 05 y 06 - Persistencia Offline con AsyncStorage)

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Usuario, AuthContextType } from '../types/usuario';
import { StorageService } from '../services/StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { UsuariosSupabaseService } from '../services/UsuariosSupabaseService';

// 1. Creación del Canal de Contexto tipado
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// 2. Componente Proveedor (La Antena) con persistencia en disco
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true); // Inicia en true mientras restaura sesión

  // Restauración de sesión persistente en AsyncStorage al arrancar la app
  useEffect(() => {
    let isMounted = true;
    const restaurarSesion = async () => {
      try {
        const usuarioGuardado = await StorageService.get<Usuario | null>(STORAGE_KEYS.AUTH_USER, null);
        if (isMounted && usuarioGuardado) {
          setUsuario(usuarioGuardado);
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

  // Iniciar Sesión conectando con Supabase Cloud y roles reales
  const login = useCallback(async (email: string, nombre?: string, rol?: 'alumno' | 'docente' | 'admin') => {
    setCargando(true);
    try {
      const emailLimpio = email.trim().toLowerCase();

      // 1. Intentar buscar en Supabase Cloud
      const usuarioEncontrado = await UsuariosSupabaseService.obtenerPorEmail(emailLimpio);

      if (usuarioEncontrado) {
        setUsuario(usuarioEncontrado);
        await StorageService.set(STORAGE_KEYS.AUTH_USER, usuarioEncontrado);
        console.log(`[AuthContext] ☁️ Sesión iniciada como [${usuarioEncontrado.rol.toUpperCase()}]: ${usuarioEncontrado.nombre}`);
      } else {
        // 2. Determinar rol automático según el correo o parámetro
        let rolAsignado: 'alumno' | 'docente' | 'admin' = rol || 'alumno';
        if (!rol) {
          if (emailLimpio.includes('admin')) rolAsignado = 'admin';
          else if (emailLimpio.includes('docente') || emailLimpio.includes('profesor')) rolAsignado = 'docente';
        }

        const nuevoUsuario = await UsuariosSupabaseService.registrarOUsuario({
          nombre: nombre || (rolAsignado === 'admin' ? 'Administrador Code Andes' : rolAsignado === 'docente' ? 'Prof. Williams (Docente)' : 'Estudiante Code Andes'),
          email: emailLimpio,
          rol: rolAsignado,
          cipColegiatura: rolAsignado !== 'alumno' ? 'CIP-304921' : undefined,
        });

        setUsuario(nuevoUsuario);
        console.log(`[AuthContext] ☁️ Nuevo usuario registrado en Supabase como [${nuevoUsuario.rol.toUpperCase()}].`);
      }
    } catch (error) {
      console.error('[AuthContext] Error en login:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  // Registrar nueva cuenta en Supabase Cloud con rol
  const registro = useCallback(
    async (datos: {
      nombre: string;
      email: string;
      cipColegiatura?: string;
      telefono?: string;
      rol?: 'alumno' | 'docente' | 'admin';
    }) => {
      setCargando(true);
      try {
        const nuevoUsuario = await UsuariosSupabaseService.registrarOUsuario({
          nombre: datos.nombre,
          email: datos.email,
          rol: datos.rol || 'alumno',
          cipColegiatura: datos.cipColegiatura,
        });

        setUsuario(nuevoUsuario);
        console.log(`[AuthContext] ☁️ Registro completado con éxito en Supabase: ${nuevoUsuario.email}`);
      } catch (error) {
        console.error('[AuthContext] Error en registro:', error);
      } finally {
        setCargando(false);
      }
    },
    []
  );

  // Cerrar Sesión y purgar de AsyncStorage
  const logout = useCallback(async () => {
    setUsuario(null);
    await StorageService.remove(STORAGE_KEYS.AUTH_USER);
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
      estaAutenticado: !!usuario,
      cargando,
      login,
      registro,
      logout,
      actualizarPerfil,
    }),
    [usuario, cargando, login, registro, logout, actualizarPerfil]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Hook Personalizado de Consumo Seguro (Custom Hook con Escudo Anticaídas)
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      '❌ useAuth debe ser utilizado dentro de un <AuthProvider>. ' +
      'Asegúrate de envolver tu app en app/_layout.tsx.'
    );
  }

  return context;
}
