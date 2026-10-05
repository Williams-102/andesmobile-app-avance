// src/controllers/useCarritoController.ts
// Controlador de lógica de negocio para la pantalla de Carrito de Compras (Módulos 05, 06 y 07 - Supabase Cloud)

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { SyncEngine } from '../services/SyncEngine';
import { BoletasService } from '../services/BoletasService';
import { MatriculasSupabaseService } from '../services/MatriculasSupabaseService';

export function useCarritoController() {
  const router = useRouter();
  const { items, total, subtotal, igv, cantidadTotal, eliminarProducto, limpiarCarrito } = useCart();
  const { isOffline } = useNetworkStatus();

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

  const handlePagar = useCallback(async () => {
    if (isOffline) {
      // Flujo Offline First: Encolar en FIFO
      Alert.alert(
        'Modo Offline Activo 📡',
        `No dispones de conexión a internet en este momento.\n\nTotal a procesar: S/ ${total.toFixed(2)}\n\n¿Deseas encolar esta matrícula localmente para auto-sincronizarla a Supabase apenas recuperes señal?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Encolar Matrícula ⚡',
            onPress: async () => {
              const ticketId = await SyncEngine.encolar({
                tipo: 'INSCRIPCION_CURSO',
                payload: {
                  items,
                  total,
                  fecha: new Date().toISOString(),
                },
              });
              limpiarCarrito();
              Alert.alert(
                '¡Operación Guardada en Cola! 📦',
                `Ticket: ${ticketId}\n\nTu matrícula ha sido asegurada en el almacenamiento interno de tu móvil. Cuando vuelvas a tener internet, el motor de sincronización la enviará automáticamente a Supabase.`
              );
            },
          },
        ]
      );
      return;
    }

    // Flujo Online
    Alert.alert(
      'Procesar Matrícula 🎓',
      `Monto Total: S/ ${total.toFixed(2)}\n\nMétodos disponibles:\n• Yape: 960 952 665 (Anahí Torre)\n• Plin: 960 444 777 (Code Andes)\n• Transferencia Interbank / BBVA\n\n¿Deseas confirmar la matrícula y registrarla en Supabase Cloud?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar y Pagar',
          onPress: async () => {
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

            // 2. ☁️ MÓDULO 07: Registrar en vivo en PostgreSQL en Supabase Cloud
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
            Alert.alert(
              '¡Matrícula Exitosa! 🎉',
              `Se ha generado tu boleta digital N° ${boleta.id} y se ha registrado en Supabase.\nPuedes consultarla en la sección Perfil > Historial de Boletas.`
            );
          },
        },
      ]
    );
  }, [isOffline, total, items, limpiarCarrito]);

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
