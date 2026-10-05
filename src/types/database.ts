// src/types/database.ts
// Interfaces TypeScript espejo de las tablas de PostgreSQL en Supabase (Módulo 07)

export interface UsuarioDB {
  id: string; // UUID
  email: string;
  nombre: string;
  rol: 'alumno' | 'docente' | 'admin';
  cip_colegiatura?: string | null;
  avatar_url?: string | null;
  creado_en?: string;
  actualizado_en?: string;
}

export interface CursoDB {
  id: string; // ej: 'react-native-expo'
  titulo: string;
  descripcion: string;
  precio: number;
  precio_regular?: number;
  horas: number;
  rating: number;
  nivel: string;
  categoria: string;
  docente: string;
  imagen_url: string;
  activo: boolean;
  creado_en?: string;
}

export interface MatriculaDB {
  id: string; // 'BOL-2026-XXXX'
  usuario_id: string | null;
  total: number;
  subtotal: number;
  igv: number;
  metodo_pago: string;
  estado: 'pendiente' | 'completado' | 'cancelado';
  ticket_offline_id?: string;
  fecha?: string;
}

export interface MatriculaItemDB {
  id?: string;
  matricula_id: string;
  curso_id: string;
  precio_unitario: number;
  creado_en?: string;
}
