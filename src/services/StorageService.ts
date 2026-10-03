// src/services/StorageService.ts
// Capa de abstracción tipada para AsyncStorage con serialización JSON segura

import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageService = {
  /**
   * Guarda cualquier valor serializándolo automáticamente a JSON
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`[StorageService] Error guardando clave "${key}":`, error);
    }
  },

  /**
   * Recupera y parsea un valor. Si no existe o falla, devuelve el valor por defecto
   */
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`[StorageService] Error leyendo clave "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Elimina una clave específica
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] Error eliminando clave "${key}":`, error);
    }
  },

  /**
   * Limpia todo el almacenamiento de la aplicación
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[StorageService] Error limpiando AsyncStorage:', error);
    }
  },
};
