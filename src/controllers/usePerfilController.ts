// src/controllers/usePerfilController.ts
// Controlador de lógica de negocio y autenticación para la pantalla de Perfil (Módulo 05)

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export function usePerfilController() {
  const router = useRouter();
  const { usuario, estaAutenticado, cargando, logout } = useAuth();

  const handleCerrarSesion = useCallback(() => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  }, [logout, router]);

  const handleIrALogin = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleIrARegistro = useCallback(() => {
    router.push('/(auth)/registro');
  }, [router]);

  return {
    usuario,
    estaAutenticado,
    cargando,
    handleCerrarSesion,
    handleIrALogin,
    handleIrARegistro,
  };
}
