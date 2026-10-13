// src/hooks/usePerformanceProfiler.ts
// Hook de React para medir y registrar los tiempos de renderizado de componentes criticos.
// Modulo 10: Optimizacion, Ciberseguridad Movil y Pruebas en Hardware Real.
// Code Andes Academy - Docente: Ing. Exar Williams Atao Paucar (CIP Reg. 304921)
// CERO EMOJIS O EMOTICONES.

import { useEffect, useRef } from 'react';
import { PerformanceMonitorService } from '../services/PerformanceMonitorService';

/**
 * Hook para monitorear el tiempo de renderizado de un componente y detectar frames lentos.
 * @param nombreComponente Nombre identificador para el reporte de telemetria.
 */
export const usePerformanceProfiler = (nombreComponente: string) => {
  const inicioRef = useRef<number>(Date.now());

  // Antes de pintar
  inicioRef.current = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();

  useEffect(() => {
    // Despues del montaje o actualizacion del DOM/Host Component
    const fin = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    const duracion = fin - inicioRef.current;

    PerformanceMonitorService.registrarRender(nombreComponente, duracion);
  });
};
