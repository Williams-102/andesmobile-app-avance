// src/controllers/useCursoDetalleController.ts
// Controlador de lógica de negocio para la pantalla de Detalle Dinámico de Curso (Módulos 04, 05 y 07 - Supabase)

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { CursosSupabaseService } from '../services/CursosSupabaseService';
import { Curso } from '../types/curso';
import { CURSOS_MOCK } from '@/constants/cursosData';

export function useCursoDetalleController() {
  const router = useRouter();
  const { agregarProducto, estaEnCarrito } = useCart();

  const params = useLocalSearchParams<{
    id: string;
    titulo?: string;
    precio?: string;
    instructor?: string;
  }>();

  // Coerción segura de parámetros de ruta
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [cursoEncontrado, setCursoEncontrado] = useState<Curso | undefined>(
    () => CURSOS_MOCK.find((c) => c.id === id)
  );

  useEffect(() => {
    let isMounted = true;
    if (id) {
      CursosSupabaseService.obtenerCursoPorId(String(id)).then((c) => {
        if (isMounted && c) setCursoEncontrado(c);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const titulo = Array.isArray(params.titulo)
    ? params.titulo[0]
    : params.titulo || cursoEncontrado?.titulo || 'Curso Especializado';

  const precio = Array.isArray(params.precio)
    ? params.precio[0]
    : params.precio || (cursoEncontrado ? cursoEncontrado.inversion.toFixed(2) : '149.90');

  const instructor = Array.isArray(params.instructor)
    ? params.instructor[0]
    : params.instructor || cursoEncontrado?.docente || 'Exar Williams Atao';

  const yaEnCarrito = estaEnCarrito(String(id));

  const handleAgregarAlCarrito = useCallback(() => {
    if (yaEnCarrito) {
      Alert.alert(
        'Curso ya en el Carrito',
        `"${titulo}" ya se encuentra agregado en tu carrito de compras.`,
        [
          { text: 'Seguir explorando', style: 'cancel' },
          { text: 'Ver Carrito 🛒', onPress: () => router.push('/(tabs)/carrito') },
        ]
      );
      return;
    }

    const exito = agregarProducto({
      id: String(id),
      titulo: String(titulo),
      precio: parseFloat(String(precio)),
      instructor: String(instructor),
      categoria: cursoEncontrado?.categoria,
      duracion: cursoEncontrado?.duracion,
      imagenUrl: cursoEncontrado?.imagenUrl,
    });

    if (exito) {
      Alert.alert(
        '¡Agregado al Carrito! 🛒',
        `"${titulo}" ha sido agregado exitosamente a tu orden de matrícula.`,
        [
          { text: 'Seguir explorando', style: 'cancel' },
          { text: 'Ir al Carrito 🛒', onPress: () => router.push('/(tabs)/carrito') },
        ]
      );
    }
  }, [yaEnCarrito, titulo, id, precio, instructor, cursoEncontrado, agregarProducto, router]);

  const handleRegresar = useCallback(() => {
    router.back();
  }, [router]);

  const handleCompartir = useCallback(() => {
    Alert.alert('Compartir', `Enlace oficial de curso #${id}: andesmobile://curso/${id}`);
  }, [id]);

  return {
    id,
    titulo,
    precio,
    instructor,
    cursoEncontrado,
    yaEnCarrito,
    handleAgregarAlCarrito,
    handleRegresar,
    handleCompartir,
  };
}
