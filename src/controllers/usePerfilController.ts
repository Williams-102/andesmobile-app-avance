// src/controllers/usePerfilController.ts
// Controlador de lógica de negocio y autenticación para la pantalla de Perfil (Módulos 05 y 06)

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { BoletasService } from '../services/BoletasService';
import { Boleta } from '../types/boleta';

export function usePerfilController() {
  const router = useRouter();
  const { usuario, estaAutenticado, cargando, logout } = useAuth();
  const { showConfirm, showToast } = useNotification();

  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [modalBoletasVisible, setModalBoletasVisible] = useState<boolean>(false);
  const [cargandoBoletas, setCargandoBoletas] = useState<boolean>(false);

  const handleCerrarSesion = useCallback(() => {
    showConfirm({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir de tu cuenta de Code Andes?',
      confirmText: 'Salir',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'log-out-outline',
      onConfirm: () => {
        logout();
        showToast({
          type: 'info',
          title: 'Sesión Finalizada',
          message: 'Has salido de tu cuenta correctamente.',
        });
        router.replace('/(auth)/login');
      },
    });
  }, [logout, router, showConfirm, showToast]);

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
