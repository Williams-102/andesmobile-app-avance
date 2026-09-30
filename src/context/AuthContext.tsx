// src/context/AuthContext.tsx
// Gestión de Estado Global de Sesión de Usuario (Módulo 05 - Láminas 14 a 18)

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Usuario, AuthContextType } from '../types/usuario';

// 1. Creación del Canal de Contexto tipado
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// 2. Componente Proveedor (La Antena)
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estado inicial: null para permitir el flujo completo de Splash -> Welcome -> Login
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  // Iniciar Sesión simulado con latencia de red
  const login = useCallback(async (email: string, nombre?: string) => {
    setCargando(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    setUsuario({
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
    });

    setCargando(false);
  }, []);

  // Registrar nueva cuenta de alumno
  const registro = useCallback(
    async (datos: {
      nombre: string;
      email: string;
      cipColegiatura?: string;
      telefono?: string;
    }) => {
      setCargando(true);
      await new Promise((resolve) => setTimeout(resolve, 900));

      setUsuario({
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
      });

      setCargando(false);
    },
    []
  );

  // Cerrar Sesión
  const logout = useCallback(() => {
    setUsuario(null);
  }, []);

  // Actualizar datos del perfil
  const actualizarPerfil = useCallback((datos: Partial<Usuario>) => {
    setUsuario((prev) => (prev ? { ...prev, ...datos, actualizadoEn: new Date().toISOString() } : null));
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
