// src/controllers/useCatalogoController.ts
// Controlador de lógica de negocio, filtros y búsqueda para la pantalla de Catálogo (Módulos 02 y 03)

import { useState, useMemo, useCallback } from 'react';
import { CURSOS_MOCK } from '@/constants/cursosData';

export const CATEGORIAS = ['Todos', 'Móvil', 'Backend', 'Pagos', 'Seguridad'] as const;
export type CategoriaTipo = typeof CATEGORIAS[number];

export function useCatalogoController() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const filteredCursos = useMemo(() => {
    return CURSOS_MOCK.filter((curso) => {
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
  }, [selectedCategory, searchQuery]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return {
    isDarkMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredCursos,
    toggleTheme,
    categorias: CATEGORIAS,
  };
}
