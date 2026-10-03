// src/context/AuthContext.tsx
// Gestión de Estado Global de Sesión de Usuario (Módulos 05 y 06 - Persistencia Offline con AsyncStorage)

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Usuario, AuthContextType } from '../types/usuario';
import { StorageService } from '../services/StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';

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

  // Iniciar Sesión con persistencia física en AsyncStorage
  const login = useCallback(async (email: string, nombre?: string) => {
    setCargando(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const nuevoUsuario: Usuario = {
      id: `usr-${Date.now()}`,
      nombre: nombre || 'Estudiante Code Andes',
      email: email.trim().toLowerCase(),
      rol: 'alumno',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      telefono: '+51 960 444 777',
      cipColegiatura: 'CIP-304921',
      ciudad: 'Lima',
      pais: 'Perú',
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    setUsuario(nuevoUsuario);
    await StorageService.set(STORAGE_KEYS.AUTH_USER, nuevoUsuario);
    setCargando(false);
  }, []);

  // Registrar nueva cuenta de alumno con persistencia física en AsyncStorage
  const registro = useCallback(
    async (datos: {
      nombre: string;
      email: string;
      cipColegiatura?: string;
      telefono?: string;
    }) => {
      setCargando(true);
      await new Promise((resolve) => setTimeout(resolve, 900));

      const nuevoUsuario: Usuario = {
        id: `usr-reg-${Date.now()}`,
        nombre: datos.nombre.trim(),
        email: datos.email.trim().toLowerCase(),
        rol: 'alumno',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        telefono: datos.telefono || '+51 906 427 414',
        cipColegiatura: datos.cipColegiatura || 'CIP-Pendiente',
        ciudad: 'Lima',
        pais: 'Perú',
        activo: true,
        creadoEn: new Date().toISOString(),
      };

      setUsuario(nuevoUsuario);
      await StorageService.set(STORAGE_KEYS.AUTH_USER, nuevoUsuario);
      setCargando(false);
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
