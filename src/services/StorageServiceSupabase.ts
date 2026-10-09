// src/services/StorageServiceSupabase.ts
// Servicio para subida de imágenes a Supabase Storage con Expo ImagePicker (Módulo 08)

import { supabase, isSupabaseConfigured } from './supabase';

export interface ImagenSubidaResult {
  exito: boolean;
  url: string;
  error?: string;
}

function decodeBase64(base64String: string): Uint8Array {
  const clean = base64String.replace(/[\r\n\t]/g, '');
  const globalAny = globalThis as any;
  if (typeof globalAny.Buffer !== 'undefined') {
    return new Uint8Array(globalAny.Buffer.from(clean, 'base64'));
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let bufferLength = Math.floor(clean.length * 0.75);
  if (clean.endsWith('==')) bufferLength -= 2;
  else if (clean.endsWith('=')) bufferLength -= 1;
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const encoded1 = chars.indexOf(clean[i]);
    const encoded2 = chars.indexOf(clean[i + 1]);
    const encoded3 = chars.indexOf(clean[i + 2]);
    const encoded4 = chars.indexOf(clean[i + 3]);
    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== -1 && encoded3 !== 64) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    if (encoded4 !== -1 && encoded4 !== 64) bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }
  return bytes;
}

export const StorageServiceSupabase = {
  /**
   * Sube una imagen a Supabase Storage en el bucket 'cursos'.
   * Soporta base64 directo de Expo ImagePicker o conversion de URI.
   */
  async subirImagenCurso(
    uri: string,
    nombreArchivo?: string,
    base64?: string
  ): Promise<ImagenSubidaResult> {
    try {
      const fileName = nombreArchivo || `curso_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
      const filePath = `portadas/${fileName}`;

      // Si Supabase no está configurado, usamos la URI local como fallback para pruebas
      if (!isSupabaseConfigured) {
        console.log('[StorageService] Supabase no configurado, usando URI local directa:', uri);
        return {
          exito: true,
          url: uri,
        };
      }

      let fileData: any;
      if (base64) {
        fileData = decodeBase64(base64);
      } else {
        const response = await fetch(uri);
        fileData = await response.blob();
      }

      // Subir archivo al bucket 'cursos'
      const { data, error } = await supabase.storage
        .from('cursos')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.warn('[StorageService] Error subiendo imagen a Supabase Storage:', error.message);
        // Retornar la URI local como fallback visual para no trabar la experiencia de usuario
        return {
          exito: true,
          url: uri,
          error: error.message,
        };
      }

      // Obtener URL pública de la imagen
      const { data: publicUrlData } = supabase.storage
        .from('cursos')
        .getPublicUrl(filePath);

      console.log('[StorageService] Imagen subida con éxito a Supabase Storage:', publicUrlData.publicUrl);

      return {
        exito: true,
        url: publicUrlData.publicUrl,
      };
    } catch (err: any) {
      console.warn('[StorageService] Excepción al procesar imagen:', err);
      return {
        exito: true,
        url: uri,
        error: err.message || 'Error desconocido al subir imagen',
      };
    }
  },

  /**
   * Obtiene la URL pública directa para un archivo en el bucket
   */
  obtenerUrlPublica(path: string): string {
    const { data } = supabase.storage.from('cursos').getPublicUrl(path);
    return data.publicUrl;
  },
};
