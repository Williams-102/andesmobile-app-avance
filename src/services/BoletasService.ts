// src/services/BoletasService.ts
// Servicio para gestionar el historial local de boletas electronicas en AsyncStorage (Modulos 06, 07, 08 y 09)

import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { Boleta } from '../types/boleta';

export const BoletasService = {
  /**
   * Obtiene la lista de boletas guardadas localmente
   */
  async obtenerBoletas(): Promise<Boleta[]> {
    return await StorageService.get<Boleta[]>(STORAGE_KEYS.BOLETAS, []);
  },

  /**
   * Registra una nueva boleta digital con desglose de IGV y numeracion de serie formal
   */
  async registrarBoleta(
    datos: Omit<Boleta, 'id' | 'serie' | 'fecha' | 'rucEmisor' | 'razonSocialEmisor' | 'subtotal' | 'igv'> & {
      id?: string;
      serie?: string;
      subtotal?: number;
      igv?: number;
    }
  ): Promise<Boleta> {
    const boletas = await StorageService.get<Boleta[]>(STORAGE_KEYS.BOLETAS, []);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const correlativo = String(boletas.length + 1).padStart(6, '0');

    const idGenerado = datos.id || `BOL-2026-${randomNum}`;
    const serieGenerada = datos.serie || `B001-${correlativo}`;

    const subtotal = datos.subtotal !== undefined ? datos.subtotal : Number((datos.total / 1.18).toFixed(2));
    const igv = datos.igv !== undefined ? datos.igv : Number((datos.total - subtotal).toFixed(2));

    const nuevaBoleta: Boleta = {
      ...datos,
      id: idGenerado,
      serie: serieGenerada,
      subtotal,
      igv,
      rucEmisor: '20612345678',
      razonSocialEmisor: 'Code Andes Academy S.A.C.',
      fecha: new Date().toISOString(),
    };

    // Anadir al inicio para que las compras mas recientes aparezcan arriba
    boletas.unshift(nuevaBoleta);
    await StorageService.set(STORAGE_KEYS.BOLETAS, boletas);
    console.log(`[BoletasService] Boleta ${nuevaBoleta.serie} (${nuevaBoleta.id}) guardada exitosamente.`);
    return nuevaBoleta;
  },
};
