// src/services/VouchersSupabaseService.ts
// Servicio para subida y almacenamiento de comprobantes de pago (Vouchers) en Supabase Storage (Modulo 09)

import { supabase, isSupabaseConfigured } from './supabase';

export interface VoucherSubidaResult {
  exito: boolean;
  url: string;
  error?: string;
}

export const VouchersSupabaseService = {
  /**
   * Sube la imagen del comprobante de pago al bucket 'vouchers' en Supabase Storage.
   * @param uri URI local del archivo provista por Expo ImagePicker (file:// o content://)
   * @param prefijo Prefijo opcional para el nombre del archivo (ej: 'yape_350')
   */
  async subirComprobante(uri: string, prefijo: string = 'voucher'): Promise<VoucherSubidaResult> {
    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 7);
      const fileName = `${prefijo}_${timestamp}_${randomStr}.jpg`;
      const filePath = `comprobantes/${fileName}`;

      // Si Supabase no esta configurado con credenciales reales, usamos la URI local para pruebas fluidas
      if (!isSupabaseConfigured) {
        console.log('[VouchersSupabaseService] Modo local activo. Usando URI directa:', uri);
        return {
          exito: true,
          url: uri,
        };
      }

      // Convertir URI local a ArrayBuffer mediante fetch nativo
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Subida al bucket 'vouchers'
      const { data, error } = await supabase.storage
        .from('vouchers')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.warn('[VouchersSupabaseService] Error subiendo comprobante a Supabase:', error.message);
        // Fallback visual a la URI local para no detener la experiencia de usuario
        return {
          exito: false,
          url: uri,
          error: error.message,
        };
      }

      // Obtener URL publica del comprobante
      const { data: publicUrlData } = supabase.storage
        .from('vouchers')
        .getPublicUrl(filePath);

      console.log('[VouchersSupabaseService] Voucher almacenado con exito:', publicUrlData.publicUrl);

      return {
        exito: true,
        url: publicUrlData.publicUrl,
      };
    } catch (err: any) {
      console.warn('[VouchersSupabaseService] Excepcion al procesar voucher:', err);
      return {
        exito: false,
        url: uri,
        error: err?.message || 'Error desconocido al subir el voucher',
      };
    }
  },

  /**
   * Obtiene la URL publica directa de un archivo en el bucket 'vouchers'
   */
  obtenerUrlPublica(path: string): string {
    const { data } = supabase.storage.from('vouchers').getPublicUrl(path);
    return data.publicUrl;
  },
};
