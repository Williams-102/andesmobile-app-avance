// src/services/BoletasService.ts
// Servicio para gestionar el historial local de boletas electrónicas en AsyncStorage

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
   * Registra una nueva boleta en el disco flash del teléfono
   */
  async registrarBoleta(datos: Omit<Boleta, 'id' | 'fecha'>): Promise<Boleta> {
    const boletas = await StorageService.get<Boleta[]>(STORAGE_KEYS.BOLETAS, []);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const nuevaBoleta: Boleta = {
      ...datos,
      id: `BOL-2026-${randomNum}`,
      fecha: new Date().toISOString(),
    };

    // Añadir al inicio para que las compras más recientes aparezcan arriba
    boletas.unshift(nuevaBoleta);
    await StorageService.set(STORAGE_KEYS.BOLETAS, boletas);
    console.log(`[BoletasService] 🧾 Boleta ${nuevaBoleta.id} guardada (${nuevaBoleta.estado})`);
    return nuevaBoleta;
  },
};
