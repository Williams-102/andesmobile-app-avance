// src/types/curso.ts
// Definición de entidad Curso con campos extendidos para Base de Datos relacional / Supabase

export interface Curso {
  id: string; // UUID o ID primario (ej: '1', 'c-001')
  codigo?: string; // Código de catálogo (ej: 'ANDES-RN-01')
  titulo: string;
  subtitulo?: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  rating: number;
  totalResenas?: number;
  duracion: string; // ej: '120 hrs'
  totalHorasAcademicas?: number;
  docente: string;
  docenteBio?: string;
  docenteFoto?: string;
  inversion: number;
  precioRegular?: number;
  moneda?: 'PEN' | 'USD';
  categoria: 'Móvil' | 'Backend' | 'Pagos' | 'Seguridad';
  modalidad?: 'Virtual en vivo' | 'Grabado' | 'Híbrido';
  imagenUrl: string;
  descripcion: string;
  requisitos: string[];
  temario?: string[];
  fechaInicio?: string;
  estado?: 'disponible' | 'proximamente' | 'agotado';
  creadoEn?: string;
  actualizadoEn?: string;
}
