// src/constants/StorageKeys.ts
// Nomenclatura oficial versionada para persistencia en disco

export const STORAGE_KEYS = {
  AUTH_USER: '@andes:auth_user:v1',        // Datos del estudiante logueado
  AUTH_TOKEN: '@andes:auth_token:v1',      // Token de sesión
  CART_ITEMS: '@andes:cart_items:v1',      // Carrito de compras permanente
  OFFLINE_QUEUE: '@andes:offline_queue:v1',// Cola FIFO de transacciones offline
  THEME_PREFERENCE: '@andes:theme:v1',     // Preferencia de tema Dark/Light
  BOLETAS: '@andes:boletas:v1',            // Historial local de boletas y compras
  CACHE_CURSOS: '@andes:cache_cursos:v1',  // Copia local de cursos para respaldo offline
};

