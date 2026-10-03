// src/types/boleta.ts
// Definición de modelo para Boletas Digitales y Comprobantes de Matrícula (Módulo 06)

export interface BoletaItem {
  id: string;
  titulo: string;
  precio: number;
}

export interface Boleta {
  id: string;                          // N° Boleta (ej: BOL-2026-4821)
  fecha: string;                       // ISO Date String
  cursos: BoletaItem[];                // Cursos adquiridos
  total: number;                       // Monto total en Soles (S/)
  metodoPago: string;                  // 'Yape / Plin / Tarjeta'
  estado: 'COMPLETADO_ONLINE' | 'SINCRONIZADO_OFFLINE';
  ticketOfflineId?: string;            // ID del ticket si provino de la cola offline
}
