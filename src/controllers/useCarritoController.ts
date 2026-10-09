// src/controllers/useCarritoController.ts
// Controlador desacoplado para la logica del Carrito de Compras y Pasarela de Pagos (Modulos 05 al 09)

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useNotification } from '../context/NotificationContext';
import { Boleta, BoletaItem } from '../types/boleta';

export function useCarritoController() {
  const router = useRouter();
  const { items, total, subtotal, igv, cantidadTotal, eliminarProducto, limpiarCarrito } = useCart();
  const { isOffline } = useNetworkStatus();
  const { showConfirm, showToast } = useNotification();

  // Estados de modales para el Modulo 09 (Checkout y Boleta)
  const [isCheckoutVisible, setIsCheckoutVisible] = useState<boolean>(false);
  const [boletaEmitida, setBoletaEmitida] = useState<Boleta | null>(null);
  const [isBoletaVisible, setIsBoletaVisible] = useState<boolean>(false);

  const handleQuitarCurso = useCallback((id: string, titulo: string) => {
    eliminarProducto(id);
    showToast({
      type: 'info',
      title: 'Curso Retirado',
      message: `"${titulo}" ha sido eliminado de tu carrito.`,
    });
  }, [eliminarProducto, showToast]);

  const handleVaciarCarrito = useCallback(() => {
    showConfirm({
      title: 'Vaciar Carrito',
      message: '¿Estas seguro de que deseas eliminar todos los cursos de tu orden?',
      confirmText: 'Vaciar',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'trash-bin-outline',
      onConfirm: () => {
        limpiarCarrito();
        showToast({
          type: 'info',
          title: 'Carrito Vacio',
          message: 'Se han eliminado todos los cursos de tu orden.',
        });
      },
    });
  }, [limpiarCarrito, showConfirm, showToast]);

  // Apertura del modal de checkout interactivo (Modulo 09)
  const handlePagar = useCallback(() => {
    if (items.length === 0) {
      showToast({
        type: 'warning',
        title: 'Carrito Vacio',
        message: 'Agrega cursos antes de procesar la matricula.',
      });
      return;
    }
    setIsCheckoutVisible(true);
  }, [items.length, showToast]);

  const handleCerrarCheckout = useCallback(() => {
    setIsCheckoutVisible(false);
  }, []);

  // Callback cuando el pago es procesado con exito en CheckoutModal
  const handlePagoCompletado = useCallback((boleta: Boleta) => {
    limpiarCarrito();
    setBoletaEmitida(boleta);
    setIsBoletaVisible(true);
  }, [limpiarCarrito]);

  const handleCerrarBoleta = useCallback(() => {
    setIsBoletaVisible(false);
    setBoletaEmitida(null);
  }, []);

  const handleIrAlCatalogo = useCallback(() => {
    router.push('/(tabs)/catalogo');
  }, [router]);

  // Adaptar items al formato BoletaItem
  const itemsBoleta: BoletaItem[] = items.map((it) => ({
    id: it.id,
    titulo: it.titulo,
    precio: it.precio,
  }));

  return {
    items,
    itemsBoleta,
    total,
    subtotal,
    igv,
    cantidadTotal,
    handleQuitarCurso,
    handleVaciarCarrito,
    handlePagar,
    handleIrAlCatalogo,
    isOffline,
    // Estados y manejadores de Modulo 09
    isCheckoutVisible,
    handleCerrarCheckout,
    handlePagoCompletado,
    boletaEmitida,
    isBoletaVisible,
    handleCerrarBoleta,
  };
}
