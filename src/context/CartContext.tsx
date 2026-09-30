// src/context/CartContext.tsx
// Gestión de Estado Global del Carrito de Compras (Módulo 05 - Láminas 19 a 23)

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { ItemCarrito, CartContextType } from '../types/carrito';

// 1. Creación del Canal de Contexto tipado
const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
}

// 2. Proveedor Global del Carrito
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Estado reactivo: lista de cursos en el carrito
  const [items, setItems] = useState<ItemCarrito[]>([
    {
      id: '1',
      titulo: 'Desarrollo de Apps Móviles con React Native & Expo',
      precio: 149.90,
      instructor: 'Exar Williams Atao',
      categoria: 'Móvil',
      duracion: '120 hrs',
      imagenUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
      fechaAgregado: new Date().toISOString(),
    },
  ]);

  // Verificar si un curso ya está en el carrito
  const estaEnCarrito = useCallback(
    (id: string) => {
      return items.some((item) => item.id === id);
    },
    [items]
  );

  // Agregar curso al carrito (evita duplicados de un mismo curso académico)
  const agregarProducto = useCallback(
    (nuevoItem: ItemCarrito): boolean => {
      if (items.some((item) => item.id === nuevoItem.id)) {
        return false; // Ya estaba en el carrito
      }
      setItems((prev) => [
        ...prev,
        {
          ...nuevoItem,
          fechaAgregado: nuevoItem.fechaAgregado || new Date().toISOString(),
        },
      ]);
      return true;
    },
    [items]
  );

  // Eliminar curso individual del carrito
  const eliminarProducto = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Vaciar carrito (ej: luego de pagar o cancelar)
  const limpiarCarrito = useCallback(() => {
    setItems([]);
  }, []);

  // Cálculos reactivos y memorizados con useMemo (Lámina 21)
  const cantidadTotal = useMemo(() => items.length, [items]);

  const total = useMemo(() => {
    return items.reduce((acumulado, item) => acumulado + item.precio, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return total / 1.18;
  }, [total]);

  const igv = useMemo(() => {
    return total - subtotal;
  }, [total, subtotal]);

  // Objeto de valor global memorizado
  const value = useMemo(
    () => ({
      items,
      cantidadTotal,
      total,
      subtotal,
      igv,
      agregarProducto,
      eliminarProducto,
      limpiarCarrito,
      estaEnCarrito,
    }),
    [items, cantidadTotal, total, subtotal, igv, agregarProducto, eliminarProducto, limpiarCarrito, estaEnCarrito]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 3. Hook Personalizado de Consumo Seguro (Custom Hook)
export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      '❌ useCart debe ser utilizado dentro de un <CartProvider>. ' +
      'Asegúrate de envolver tu app en app/_layout.tsx.'
    );
  }

  return context;
}
