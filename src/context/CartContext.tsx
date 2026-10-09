// src/context/CartContext.tsx
// Gestión de Estado Global del Carrito de Compras con Persistencia Offline en AsyncStorage (Módulo 06)

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ItemCarrito, CartContextType } from '../types/carrito';
import { StorageService } from '../services/StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';

// 1. Creación del Canal de Contexto tipado
const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
}

// 2. Proveedor Global del Carrito con Persistencia
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const estaInicializado = useRef(false);

  // Carga inicial desde AsyncStorage al arrancar la app
  useEffect(() => {
    let isMounted = true;
    const cargarCarrito = async () => {
      try {
        const guardados = await StorageService.get<ItemCarrito[]>(STORAGE_KEYS.CART_ITEMS, []);
        if (isMounted) {
          if (guardados && guardados.length > 0) {
            setItems(guardados);
          } else {
            // Producto demo inicial para que el alumno explore de inmediato
            const demoItem: ItemCarrito = {
              id: '1',
              titulo: 'Desarrollo de Apps Móviles con React Native & Expo',
              precio: 149.90,
              instructor: 'Exar Williams Atao',
              categoria: 'Móvil',
              duracion: '120 hrs',
              imagenUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
              fechaAgregado: new Date().toISOString(),
            };
            setItems([demoItem]);
            await StorageService.set(STORAGE_KEYS.CART_ITEMS, [demoItem]);
          }
          estaInicializado.current = true;
        }
      } catch (error) {
        console.error('[CartContext] Error cargando items de AsyncStorage:', error);
        if (isMounted) estaInicializado.current = true;
      }
    };

    cargarCarrito();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persistir en AsyncStorage en cada cambio reactivo (después de inicializar)
  useEffect(() => {
    if (estaInicializado.current) {
      StorageService.set(STORAGE_KEYS.CART_ITEMS, items);
    }
  }, [items]);

  // Verificar si un curso ya está en el carrito
  const estaEnCarrito = useCallback(
    (id: string) => {
      return items.some((item) => item.id === id);
    },
    [items]
  );

  // Agregar curso al carrito
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

  // Cálculos reactivos y memorizados con useMemo
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
      'useCart debe ser utilizado dentro de un <CartProvider>. ' +
      'Asegúrate de envolver tu app en app/_layout.tsx.'
    );
  }

  return context;
}
