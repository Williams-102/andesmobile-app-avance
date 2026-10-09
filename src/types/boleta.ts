// src/types/boleta.ts
// Definicion de modelo para Boletas Digitales y Comprobantes de Matricula (Modulos 06, 07, 08 y 09)

export interface BoletaItem {
  id: string;
  titulo: string;
  precio: number;
}

export interface Boleta {
  id: string;                          // N° Boleta (ej: BOL-2026-4821)
  serie: string;                       // Serie legal (ej: B001-00004821)
  fecha: string;                       // ISO Date String
  cursos: BoletaItem[];                // Cursos adquiridos
  total: number;                       // Monto total en Soles (S/)
  subtotal: number;                    // Base imponible (Total / 1.18)
  igv: number;                         // IGV 18% (Total - Subtotal)
  metodoPago: string;                  // 'Yape' | 'Plin' | 'Tarjeta de Credito / Debito'
  numeroOperacion?: string;            // Numero de operacion bancaria
  voucherUrl?: string;                 // URL del comprobante en Supabase Storage
  bancoOrigen?: string;                // 'Yape' | 'Plin' | 'BCP' | 'Interbank' | 'Visa' | 'Mastercard'
  ultimosDigitosTarjeta?: string;      // Ej: '4242'
  clienteNombre?: string;              // Nombre del alumno
  clienteEmail?: string;               // Correo del alumno
  rucEmisor: string;                   // '20612345678'
  razonSocialEmisor: string;           // 'Code Andes Academy S.A.C.'
  estado: 'COMPLETADO_ONLINE' | 'SINCRONIZADO_OFFLINE';
  ticketOfflineId?: string;            // ID del ticket si provino de la cola offline
}
