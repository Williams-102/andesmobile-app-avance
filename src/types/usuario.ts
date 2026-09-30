// src/types/usuario.ts
// Definición de modelo de Usuario y Autenticación preparado para Base de Datos (Módulos 05 y 06)

export interface Usuario {
  id: string; // UUID o ID primario en Base de Datos
  nombre: string;
  email: string;
  rol: 'alumno' | 'docente' | 'admin';
  avatarUrl?: string;
  telefono?: string;
  cipColegiatura?: string; // N° Registro Colegio de Ingenieros del Perú
  ciudad?: string;
  pais?: string;
  activo?: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface AuthContextType {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  cargando: boolean;
  login: (email: string, nombre?: string) => Promise<void>;
  registro: (datos: {
    nombre: string;
    email: string;
    cipColegiatura?: string;
    telefono?: string;
  }) => Promise<void>;
  logout: () => void;
  actualizarPerfil: (datos: Partial<Usuario>) => void;
}
