// src/controllers/useCatalogoController.ts
// Controlador de lógica de negocio, filtros, búsqueda y consumo de Supabase para la pantalla de Catálogo (Módulos 02, 03 y 07)

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Curso } from '../types/curso';
import { CursosSupabaseService } from '../services/CursosSupabaseService';

export const CATEGORIAS = ['Todos', 'Móvil', 'Backend', 'Cloud', 'Pagos', 'Seguridad'] as const;
export type CategoriaTipo = typeof CATEGORIAS[number];

export function useCatalogoController() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Estado dinámico conectado a la Base de Datos en Supabase Cloud
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const cargarCursos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefrescando(true);
    else setCargando(true);

    try {
      const data = await CursosSupabaseService.obtenerCursos();
      setCursos(data);
    } catch (e) {
      console.error('[useCatalogoController] Error cargando cursos de Supabase:', e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarCursos();
  }, [cargarCursos]);

  const filteredCursos = useMemo(() => {
    return cursos.filter((curso) => {
      const matchCategory =
        selectedCategory === 'Todos' || curso.categoria === selectedCategory;
      const queryLower = searchQuery.toLowerCase().trim();
      const matchSearch =
        !queryLower ||
        curso.titulo.toLowerCase().includes(queryLower) ||
        curso.docente.toLowerCase().includes(queryLower) ||
        curso.categoria.toLowerCase().includes(queryLower);
      return matchCategory && matchSearch;
    });
  }, [cursos, selectedCategory, searchQuery]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const handleRefrescar = useCallback(() => {
    cargarCursos(true);
  }, [cargarCursos]);

  return {
    isDarkMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredCursos,
    cargando,
    refrescando,
    handleRefrescar,
    toggleTheme,
    categorias: CATEGORIAS,
  };
}
