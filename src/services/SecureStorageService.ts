// src/services/SecureStorageService.ts
// Servicio de almacenamiento criptografico seguro en hardware nativo (Android Keystore / iOS Keychain).
// Modulo 10: Optimizacion, Ciberseguridad Movil y Pruebas en Hardware Real.
// Code Andes Academy - Docente: Ing. Exar Williams Atao Paucar (CIP Reg. 304921)
// CERO EMOJIS O EMOTICONES.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURE_PREFIX = '@andes_secure_';
const TOKEN_KEY = `${SECURE_PREFIX}auth_jwt_token_v1`;
const REFRESH_TOKEN_KEY = `${SECURE_PREFIX}auth_refresh_token_v1`;
const USER_PIN_KEY = `${SECURE_PREFIX}user_pin_v1`;

export const SecureStorageService = {
  /**
   * Determina si el almacenamiento criptografico por hardware esta disponible en la plataforma.
   * En iOS utiliza Keychain, en Android utiliza Android Keystore. En Web utiliza almacenamiento ofuscado.
   */
  async estaDisponible(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }
    try {
      return await SecureStore.isAvailableAsync();
    } catch {
      return false;
    }
  },

  /**
   * Guarda un valor en el contenedor seguro con cifrado de hardware.
   */
  async guardar(clave: string, valor: string): Promise<boolean> {
    try {
      const disponible = await this.estaDisponible();
      if (disponible) {
        await SecureStore.setItemAsync(clave, valor, {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
      } else {
        // En entorno web o fallback: Almacenar con codificacion Base64 como mitigacion
        const encoded = typeof btoa !== 'undefined' ? btoa(valor) : valor;
        await AsyncStorage.setItem(`${SECURE_PREFIX}${clave}`, encoded);
      }
      return true;
    } catch (err) {
      console.warn(`[SecureStorageService] Error al guardar clave segura (${clave}):`, err);
      return false;
    }
  },

  /**
   * Recupera un valor desencriptado del contenedor seguro.
   */
  async obtener(clave: string): Promise<string | null> {
    try {
      const disponible = await this.estaDisponible();
      if (disponible) {
        return await SecureStore.getItemAsync(clave);
      } else {
        const item = await AsyncStorage.getItem(`${SECURE_PREFIX}${clave}`);
        if (!item) return null;
        return typeof atob !== 'undefined' ? atob(item) : item;
      }
    } catch (err) {
      console.warn(`[SecureStorageService] Error al leer clave segura (${clave}):`, err);
      return null;
    }
  },

  /**
   * Elimina de forma segura e irreversible una clave del contenedor.
   */
  async eliminar(clave: string): Promise<boolean> {
    try {
      const disponible = await this.estaDisponible();
      if (disponible) {
        await SecureStore.deleteItemAsync(clave);
      } else {
        await AsyncStorage.removeItem(`${SECURE_PREFIX}${clave}`);
      }
      return true;
    } catch (err) {
      console.warn(`[SecureStorageService] Error al eliminar clave segura (${clave}):`, err);
      return false;
    }
  },

  // METODOS DE ALTO NIVEL PARA AUTENTICACION JWT (CIBERSEGURIDAD)

  /**
   * Guarda el token JWT de sesion del usuario en el Keystore/Keychain.
   */
  async guardarTokenJwt(token: string): Promise<boolean> {
    return await this.guardar(TOKEN_KEY, token);
  },

  /**
   * Obtiene el token JWT autenticado para adjuntarlo a las peticiones HTTP.
   */
  async obtenerTokenJwt(): Promise<string | null> {
    return await this.obtener(TOKEN_KEY);
  },

  /**
   * Elimina todos los tokens de sesion tras cerrar sesion (Logout seguro).
   */
  async purgarSesionSegura(): Promise<void> {
    await this.eliminar(TOKEN_KEY);
    await this.eliminar(REFRESH_TOKEN_KEY);
    await this.eliminar(USER_PIN_KEY);
  },
};
