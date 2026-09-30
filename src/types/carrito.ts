// src/types/carrito.ts
// Modelo de datos para Items de Carrito, Pedidos y Transacciones (Módulos 05 y 06)

export interface ItemCarrito {
  id: string; // ID del curso (Foreign Key a Cursos)
  titulo: string;
  precio: number;
  precioRegular?: number;
  instructor?: string;
  imagenUrl?: string;
  categoria?: string;
  duracion?: string;
  fechaAgregado?: string;
}

export interface CartContextType {
  items: ItemCarrito[];
  cantidadTotal: number;
  total: number;
  subtotal: number;
  igv: number;
  agregarProducto: (item: ItemCarrito) => boolean;
  eliminarProducto: (id: string) => void;
  limpiarCarrito: () => void;
  estaEnCarrito: (id: string) => boolean;
}

// Estructura para registrar una orden / matrícula en Base de Datos (SQLite / Supabase)
export interface OrdenMatricula {
  id: string; // UUID de orden
  usuarioId: string; // FK a Usuario
  items: ItemCarrito[];
  subtotal: number;
  igv: number;
  total: number;
  metodoPago: 'Yape' | 'Plin' | 'Tarjeta' | 'Transferencia';
  estadoPago: 'pendiente' | 'aprobado' | 'rechazado';
  codigoOperacion?: string;
  fechaCreacion: string;
}
