// src/controllers/useCarritoController.ts
// Controlador de lógica de negocio para la pantalla de Carrito de Compras (Módulos 05, 06 y 07 - Supabase Cloud)

import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { SyncEngine } from '../services/SyncEngine';
import { BoletasService } from '../services/BoletasService';
import { MatriculasSupabaseService } from '../services/MatriculasSupabaseService';

export function useCarritoController() {
  const router = useRouter();
  const { items, total, subtotal, igv, cantidadTotal, eliminarProducto, limpiarCarrito } = useCart();
  const { isOffline } = useNetworkStatus();
  const { showConfirm, showToast } = useNotification();

  const handleQuitarCurso = useCallback((id: string, titulo: string) => {
    showConfirm({
      title: 'Quitar del Carrito',
      message: `¿Deseas remover "${titulo}" de tu orden de compra?`,
      confirmText: 'Quitar',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'trash-outline',
      onConfirm: () => {
        eliminarProducto(id);
        showToast({
          type: 'info',
          title: 'Curso Removido',
          message: `"${titulo}" fue retirado de tu carrito.`,
        });
      },
    });
  }, [eliminarProducto, showConfirm, showToast]);

  const handleVaciarCarrito = useCallback(() => {
    showConfirm({
      title: 'Vaciar Carrito',
      message: '¿Estás seguro de que deseas eliminar todos los cursos de tu orden?',
      confirmText: 'Vaciar',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'trash-bin-outline',
      onConfirm: () => {
        limpiarCarrito();
        showToast({
          type: 'info',
          title: 'Carrito Vacío',
          message: 'Se han eliminado todos los cursos de tu orden.',
        });
      },
    });
  }, [limpiarCarrito, showConfirm, showToast]);

  const handlePagar = useCallback(async () => {
    if (items.length === 0) {
      showToast({
        type: 'warning',
        title: 'Carrito Vacío',
        message: 'Agrega cursos antes de procesar la matrícula.',
      });
      return;
    }

    if (isOffline) {
      // Flujo Offline First: Encolar en FIFO
      showConfirm({
        title: 'Modo Offline Activo',
        message: `No dispones de conexión a internet en este momento.\n\nTotal a procesar: S/ ${total.toFixed(2)}\n\n¿Deseas encolar esta matrícula localmente para auto-sincronizarla a Supabase apenas recuperes señal?`,
        confirmText: 'Encolar Matrícula',
        cancelText: 'Cancelar',
        type: 'warning',
        icon: 'cloud-offline-outline',
        onConfirm: async () => {
          const ticketId = await SyncEngine.encolar({
            tipo: 'INSCRIPCION_CURSO',
            payload: {
              items,
              total,
              fecha: new Date().toISOString(),
            },
          });
          limpiarCarrito();
          showToast({
            type: 'success',
            title: 'Operación Guardada en Cola',
            message: `Ticket: ${ticketId}\nTu matrícula ha sido asegurada en el almacenamiento interno de tu móvil. Se enviará a Supabase al recuperar la conexión.`,
            duration: 5000,
          });
        },
      });
      return;
    }

    // Flujo Online
    showConfirm({
      title: 'Confirmar Matrícula',
      message: `Monto Total: S/ ${total.toFixed(2)}\n\nMétodos disponibles:\n• Yape: 960 952 665 (Anahí Torre)\n• Plin: 960 444 777 (Code Andes)\n• Transferencia Interbank / BBVA\n\n¿Deseas confirmar la matrícula y registrarla en Supabase Cloud?`,
      confirmText: 'Confirmar y Pagar',
      cancelText: 'Cancelar',
      type: 'primary',
      icon: 'card-outline',
      onConfirm: async () => {
        const cursosComprados = items.map((it) => ({
          id: it.id,
          titulo: it.titulo,
          precio: it.precio,
        }));

        // 1. Guardar comprobante local para consulta inmediata en Perfil
        const boleta = await BoletasService.registrarBoleta({
          cursos: cursosComprados,
          total,
          metodoPago: 'Yape / Plin / Tarjeta',
          estado: 'COMPLETADO_ONLINE',
        });

        // 2. Registrar en vivo en PostgreSQL en Supabase Cloud
        const subtotalCalculado = total / 1.18;
        const igvCalculado = total - subtotalCalculado;
        await MatriculasSupabaseService.crearMatricula(
          {
            id: boleta.id,
            usuario_id: null,
            total,
            subtotal: subtotalCalculado,
            igv: igvCalculado,
            metodo_pago: 'Yape / Plin / Tarjeta',
            estado: 'completado',
          },
          cursosComprados.map((c) => ({
            curso_id: c.id,
            precio_unitario: c.precio,
          }))
        );

        limpiarCarrito();
        showToast({
          type: 'success',
          title: 'Matrícula Exitosa',
          message: `Boleta digital N° ${boleta.id} registrada en Supabase Cloud. Puedes consultarla en la sección Perfil.`,
          duration: 5000,
        });
      },
    });
  }, [isOffline, total, items, limpiarCarrito, showConfirm, showToast]);

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
    isOffline,
  };
}
