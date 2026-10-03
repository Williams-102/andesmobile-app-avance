// src/types/offline.ts
// Tipos para la Cola FIFO y Arquitectura Offline First

export interface AccionOffline {
  id: string;              // UUID único del ticket
  tipo: 'INSCRIPCION_CURSO' | 'ACTUALIZAR_PERFIL';
  payload: any;            // Datos del evento
  timestamp: number;       // Date.now()
  intentos: number;        // Contador de reintentos
}

export interface NetworkStatus {
  isConnected: boolean;
  isOffline: boolean;
  connectionType: string;
}
