// src/services/SyncEngine.ts
// Motor de sincronización automática para la cola FIFO de transacciones offline conectada a Supabase Cloud (Módulos 06 y 07)

import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { AccionOffline } from '../types/offline';
import { BoletasService } from './BoletasService';
import { MatriculasSupabaseService } from './MatriculasSupabaseService';

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
   * Procesa la cola FIFO en estricto orden cronológico y despacha a Supabase Cloud
   */
  async procesarCola(): Promise<{ procesados: number; fallidos: number }> {
    const cola = await StorageService.get<AccionOffline[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    if (cola.length === 0) return { procesados: 0, fallidos: 0 };

    console.log(`[SyncEngine] Iniciando auto-sync de ${cola.length} acciones pendientes hacia Supabase...`);
    let procesados = 0;
    const colaRestante = [...cola];

    for (const ticket of cola) {
      try {
        console.log(`[SyncEngine] Procesando ticket ${ticket.id} (${ticket.tipo})...`);

        // Despacho de matrícula hacia Supabase y almacenamiento de boleta local
        if (ticket.tipo === 'INSCRIPCION_CURSO' && ticket.payload) {
          const cursos = (ticket.payload.items || []).map((it: any) => ({
            id: it.id,
            titulo: it.titulo,
            precio: it.precio,
          }));

          const metodoPagoDinamico = ticket.payload.metodoPago || 'Yape';
          const boleta = await BoletasService.registrarBoleta({
            cursos,
            total: ticket.payload.total || 0,
            metodoPago: metodoPagoDinamico,
            numeroOperacion: ticket.payload.numeroOperacion,
            voucherUrl: ticket.payload.voucherUrl,
            estado: 'SINCRONIZADO_OFFLINE',
            ticketOfflineId: ticket.id,
          });

          // Insercion permanente en PostgreSQL de Supabase
          const totalNum = ticket.payload.total || 0;
          const subtotalNum = totalNum / 1.18;
          const igvNum = totalNum - subtotalNum;

          await MatriculasSupabaseService.crearMatricula(
            {
              id: boleta.id,
              usuario_id: null,
              total: totalNum,
              subtotal: subtotalNum,
              igv: igvNum,
              metodo_pago: metodoPagoDinamico,
              numero_operacion: ticket.payload.numeroOperacion || null,
              voucher_url: ticket.payload.voucherUrl || null,
              banco_origen: metodoPagoDinamico.toUpperCase(),
              ultimos_digitos_tarjeta: ticket.payload.ultimosDigitosTarjeta || null,
              estado: 'completado',
              ticket_offline_id: ticket.id,
            },
            cursos.map((c: any) => ({
              curso_id: c.id,
              precio_unitario: c.precio,
            }))
          );
        }

        // Retira el ticket sincronizado de la cola local
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
