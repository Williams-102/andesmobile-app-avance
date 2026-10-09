// src/services/StorageServiceSupabase.ts
// Servicio para subida de imágenes a Supabase Storage con Expo ImagePicker (Módulo 08)

import { supabase, isSupabaseConfigured } from './supabase';

export interface ImagenSubidaResult {
  exito: boolean;
  url: string;
  error?: string;
}

export const StorageServiceSupabase = {
  /**
   * Sube una imagen a Supabase Storage en el bucket 'cursos'.
   * @param uri URI local del archivo proporcionado por Expo ImagePicker (file:// o content://)
   * @param nombreArchivo Nombre único deseado (ej: 'curso-17120392.jpg')
   */
  async subirImagenCurso(uri: string, nombreArchivo?: string): Promise<ImagenSubidaResult> {
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

      // Convertir URI local a ArrayBuffer mediante fetch nativo de React Native
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Subir archivo al bucket 'cursos'
      const { data, error } = await supabase.storage
        .from('cursos')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.warn('[StorageService] Error subiendo imagen a Supabase Storage:', error.message);
        // Retornar la URI local como fallback visual para no trabar la experiencia de usuario
        return {
          exito: false,
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
        exito: false,
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
