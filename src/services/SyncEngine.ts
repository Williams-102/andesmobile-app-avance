// src/services/SyncEngine.ts
// Motor de sincronización automática para la cola FIFO de transacciones offline

import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { AccionOffline } from '../types/offline';
import { BoletasService } from './BoletasService';

export const SyncEngine = {
  /**
   * Encola una transacción en el disco físico
   */
  async encolar(accion: Omit<AccionOffline, 'id' | 'timestamp' | 'intentos'>): Promise<string> {
    const cola = await StorageService.get<AccionOffline[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const idTicket = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nuevoTicket: AccionOffline = {
      ...accion,
      id: idTicket,
      timestamp: Date.now(),
      intentos: 0,
    };
    cola.push(nuevoTicket);
    await StorageService.set(STORAGE_KEYS.OFFLINE_QUEUE, cola);
    console.log(`[SyncEngine] Acción encolada: ${idTicket} (${accion.tipo})`);
    return idTicket;
  },

  /**
   * Obtiene la cantidad de acciones pendientes en cola
   */
  async getPendientesCount(): Promise<number> {
    const cola = await StorageService.get<AccionOffline[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    return cola.length;
  },

  /**
   * Procesa la cola FIFO en estricto orden cronológico
   */
  async procesarCola(): Promise<{ procesados: number; fallidos: number }> {
    const cola = await StorageService.get<AccionOffline[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    if (cola.length === 0) return { procesados: 0, fallidos: 0 };

    console.log(`[SyncEngine] Iniciando auto-sync de ${cola.length} acciones pendientes...`);
    let procesados = 0;
    const colaRestante = [...cola];

    for (const ticket of cola) {
      try {
        // En Módulo 06 simulamos la latencia del backend; en Módulo 07 viajará a Supabase
        await new Promise((resolve) => setTimeout(resolve, 600));
        console.log(`[SyncEngine] Ticket ${ticket.id} (${ticket.tipo}) sincronizado con éxito.`);

        // Generar la boleta oficial registrada con origen offline
        if (ticket.tipo === 'INSCRIPCION_CURSO' && ticket.payload) {
          const cursos = (ticket.payload.items || []).map((it: any) => ({
            id: it.id,
            titulo: it.titulo,
            precio: it.precio,
          }));
          await BoletasService.registrarBoleta({
            cursos,
            total: ticket.payload.total || 0,
            metodoPago: 'Yape / Plin / Tarjeta',
            estado: 'SINCRONIZADO_OFFLINE',
            ticketOfflineId: ticket.id,
          });
        }

        // Retira el ticket sincronizado
        colaRestante.shift();
        await StorageService.set(STORAGE_KEYS.OFFLINE_QUEUE, colaRestante);
        procesados++;
      } catch (error) {
        console.warn(`[SyncEngine] Error en ticket ${ticket.id}. Deteniendo cola FIFO para mantener consistencia.`);
        ticket.intentos += 1;
        await StorageService.set(STORAGE_KEYS.OFFLINE_QUEUE, colaRestante);
        break;
      }
    }

    return { procesados, fallidos: colaRestante.length };
  },
};
