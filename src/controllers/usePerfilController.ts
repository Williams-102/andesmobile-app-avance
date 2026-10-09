// src/controllers/usePerfilController.ts
// Controlador de logica de negocio y autenticacion para la pantalla de Perfil (Modulos 05 al 09)

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { BoletasService } from '../services/BoletasService';
import { Boleta } from '../types/boleta';

export function usePerfilController() {
  const router = useRouter();
  const { usuario, estaAutenticado, cargando, logout, actualizarPerfil } = useAuth();
  const { showConfirm, showToast } = useNotification();

  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [modalBoletasVisible, setModalBoletasVisible] = useState<boolean>(false);
  const [cargandoBoletas, setCargandoBoletas] = useState<boolean>(false);
  const [boletaSeleccionada, setBoletaSeleccionada] = useState<Boleta | null>(null);

  // Estados de modales de Certificaciones y Ajustes
  const [modalCertificadosVisible, setModalCertificadosVisible] = useState<boolean>(false);
  const [modalAjustesVisible, setModalAjustesVisible] = useState<boolean>(false);

  const handleCerrarSesion = useCallback(() => {
    showConfirm({
      title: 'Cerrar Sesion',
      message: '¿Estas seguro de que deseas salir de tu cuenta de Code Andes?',
      confirmText: 'Salir',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'log-out-outline',
      onConfirm: () => {
        logout();
        showToast({
          type: 'info',
          title: 'Sesion Finalizada',
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
      const data = await BoletasService.obtenerBoletas(usuario?.id, usuario?.email);
      setBoletas(data);
    } catch (e) {
      console.error('[usePerfilController] Error cargando boletas:', e);
    } finally {
      setCargandoBoletas(false);
    }
  }, [usuario?.id, usuario?.email]);

  const handleCerrarBoletas = useCallback(() => {
    setModalBoletasVisible(false);
  }, []);

  const handleAbrirCertificados = useCallback(async () => {
    try {
      if (boletas.length === 0) {
        const data = await BoletasService.obtenerBoletas(usuario?.id, usuario?.email);
        setBoletas(data);
      }
    } catch (e) {
      console.warn('[usePerfilController] Error precargando boletas para certificados:', e);
    }
    setModalCertificadosVisible(true);
  }, [boletas.length, usuario?.id, usuario?.email]);

  const handleCerrarCertificados = useCallback(() => {
    setModalCertificadosVisible(false);
  }, []);

  const handleAbrirAjustes = useCallback(() => {
    setModalAjustesVisible(true);
  }, []);

  const handleCerrarAjustes = useCallback(() => {
    setModalAjustesVisible(false);
  }, []);

  const handlePerfilActualizado = useCallback((nuevoUsuario: any) => {
    actualizarPerfil(nuevoUsuario);
  }, [actualizarPerfil]);

  const handleLimpiarHistorialBoletas = useCallback(() => {
    showConfirm({
      title: 'Limpiar Historial',
      message: '¿Deseas vaciar el historial de boletas guardadas localmente en este dispositivo?',
      confirmText: 'Limpiar',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'trash-outline',
      onConfirm: async () => {
        await BoletasService.limpiarHistorial();
        setBoletas([]);
        showToast({
          type: 'info',
          title: 'Historial Vacio',
          message: 'Se ha limpiado el registro local de boletas.',
        });
      },
    });
  }, [showConfirm, showToast]);

  return {
    usuario,
    estaAutenticado,
    cargando,
    boletas,
    modalBoletasVisible,
    cargandoBoletas,
    boletaSeleccionada,
    setBoletaSeleccionada,
    modalCertificadosVisible,
    modalAjustesVisible,
    handleCerrarSesion,
    handleIrALogin,
    handleIrARegistro,
    handleAbrirBoletas,
    handleCerrarBoletas,
    handleAbrirCertificados,
    handleCerrarCertificados,
    handleAbrirAjustes,
    handleCerrarAjustes,
    handlePerfilActualizado,
    handleLimpiarHistorialBoletas,
  };
}
