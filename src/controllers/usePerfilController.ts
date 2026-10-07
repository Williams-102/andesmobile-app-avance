// src/controllers/usePerfilController.ts
// Controlador de lógica de negocio y autenticación para la pantalla de Perfil (Módulos 05 y 06)

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { BoletasService } from '../services/BoletasService';
import { Boleta } from '../types/boleta';

export function usePerfilController() {
  const router = useRouter();
  const { usuario, estaAutenticado, cargando, logout } = useAuth();

  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [modalBoletasVisible, setModalBoletasVisible] = useState<boolean>(false);
  const [cargandoBoletas, setCargandoBoletas] = useState<boolean>(false);

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
            router.replace('/(auth)/login');
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

  const handleAbrirBoletas = useCallback(async () => {
    setCargandoBoletas(true);
    setModalBoletasVisible(true);
    try {
      const data = await BoletasService.obtenerBoletas();
      setBoletas(data);
    } catch (e) {
      console.error('[usePerfilController] Error cargando boletas:', e);
    } finally {
      setCargandoBoletas(false);
    }
  }, []);

  const handleCerrarBoletas = useCallback(() => {
    setModalBoletasVisible(false);
  }, []);

  return {
    usuario,
    estaAutenticado,
    cargando,
    boletas,
    modalBoletasVisible,
    cargandoBoletas,
    handleCerrarSesion,
    handleIrALogin,
    handleIrARegistro,
    handleAbrirBoletas,
    handleCerrarBoletas,
  };
}
