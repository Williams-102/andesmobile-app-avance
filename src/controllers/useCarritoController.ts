// src/controllers/useCarritoController.ts
// Controlador de lógica de negocio para la pantalla de Carrito de Compras (Módulo 05)

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';

export function useCarritoController() {
  const router = useRouter();
  const { items, total, subtotal, igv, cantidadTotal, eliminarProducto, limpiarCarrito } = useCart();

  const handleQuitarCurso = useCallback((id: string, titulo: string) => {
    Alert.alert(
      'Quitar del Carrito',
      `¿Deseas remover "${titulo}" de tu orden?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () => eliminarProducto(id),
        },
      ]
    );
  }, [eliminarProducto]);

  const handleVaciarCarrito = useCallback(() => {
    Alert.alert(
      'Vaciar Carrito',
      '¿Estás seguro de que deseas eliminar todos los cursos de tu orden?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar',
          style: 'destructive',
          onPress: limpiarCarrito,
        },
      ]
    );
  }, [limpiarCarrito]);

  const handlePagar = useCallback(() => {
    Alert.alert(
      'Procesar Matrícula 🎓',
      `Monto Total: S/ ${total.toFixed(2)}\n\nMétodos disponibles:\n• Yape: 960 952 665 (Anahí Torre)\n• Plin: 960 444 777 (Code Andes)\n• Transferencia Interbank / BBVA\n\n¿Deseas confirmar la simulación de matrícula?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar y Pagar',
          onPress: () => {
            limpiarCarrito();
            Alert.alert(
              '¡Matrícula Exitosa! 🎉',
              'Se ha generado tu ficha de matrícula. El voucher ha sido validado para emisión de boleta electrónica.'
            );
          },
        },
      ]
    );
  }, [total, limpiarCarrito]);

  const handleIrAlCatalogo = useCallback(() => {
    router.push('/(tabs)/catalogo');
  }, [router]);

  return {
    items,
    total,
    subtotal,
    igv,
    cantidadTotal,
    handleQuitarCurso,
    handleVaciarCarrito,
    handlePagar,
    handleIrAlCatalogo,
  };
}
