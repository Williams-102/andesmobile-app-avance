// src/services/PerformanceMonitorService.ts
// Servicio de telemetria y diagnostico de rendimiento en tiempo real (FPS, render times, memory).
// Modulo 10: Optimizacion, Ciberseguridad Movil y Pruebas en Hardware Real.
// Code Andes Academy - Docente: Ing. Exar Williams Atao Paucar (CIP Reg. 304921)
// CERO EMOJIS O EMOTICONES.

export interface MetricaComponente {
  nombre: string;
  totalRenders: number;
  duracionPromedioMs: number;
  duracionMaximaMs: number;
  ultimosTiemposMs: number[];
  cuadrosLentosDetectados: number; // Tiempos superiores a 16.6ms (perdida de 60 FPS)
}

export interface DiagnosticoRendimientoGlobal {
  fpsEstimados: number;
  totalComponentesMonitoreados: number;
  totalRendersGlobales: number;
  totalCuadrosLentos: number;
  componentes: MetricaComponente[];
  memoriaEstimadaMb?: number;
  estadoSalud: 'OPTIMO' | 'ACEPTABLE' | 'DEGRADADO';
}

const registroComponentes: Map<string, MetricaComponente> = new Map();
let oyentes: Array<(diag: DiagnosticoRendimientoGlobal) => void> = [];

export const PerformanceMonitorService = {
  /**
   * Registra un ciclo de renderizado de un componente para auditar su rendimiento.
   */
  registrarRender(nombreComponente: string, duracionMs: number): void {
    let metrica = registroComponentes.get(nombreComponente);

    if (!metrica) {
      metrica = {
        nombre: nombreComponente,
        totalRenders: 0,
        duracionPromedioMs: 0,
        duracionMaximaMs: 0,
        ultimosTiemposMs: [],
        cuadrosLentosDetectados: 0,
      };
      registroComponentes.set(nombreComponente, metrica);
    }

    metrica.totalRenders += 1;
    if (duracionMs > metrica.duracionMaximaMs) {
      metrica.duracionMaximaMs = Number(duracionMs.toFixed(2));
    }

    // Un frame a 60 FPS dura 16.66ms. Todo render que supere este tiempo produce un jank (lag visual).
    if (duracionMs > 16.66) {
      metrica.cuadrosLentosDetectados += 1;
    }

    metrica.ultimosTiemposMs.push(Number(duracionMs.toFixed(2)));
    if (metrica.ultimosTiemposMs.length > 20) {
      metrica.ultimosTiemposMs.shift();
    }

    const suma = metrica.ultimosTiemposMs.reduce((acc, t) => acc + t, 0);
    metrica.duracionPromedioMs = Number((suma / metrica.ultimosTiemposMs.length).toFixed(2));

    this.notificarOyentes();
  },

  /**
   * Obtiene el diagnostico global consolidado de rendimiento de la aplicacion.
   */
  obtenerDiagnostico(): DiagnosticoRendimientoGlobal {
    const lista = Array.from(registroComponentes.values());
    const totalRenders = lista.reduce((acc, m) => acc + m.totalRenders, 0);
    const totalCuadrosLentos = lista.reduce((acc, m) => acc + m.cuadrosLentosDetectados, 0);

    // Estimacion de FPS basada en porcentaje de cuadros lentos
    let fpsEstimados = 60;
    if (totalRenders > 0) {
      const porcentajeLentos = (totalCuadrosLentos / totalRenders) * 100;
      if (porcentajeLentos > 20) fpsEstimados = 45;
      if (porcentajeLentos > 50) fpsEstimados = 30;
      if (porcentajeLentos > 75) fpsEstimados = 20;
    }

    // Estimacion de consumo de memoria en navegadores compatibles
    let memoriaMb: number | undefined = undefined;
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      memoriaMb = Number(((performance as any).memory.usedJSHeapSize / (1024 * 1024)).toFixed(1));
    }

    let estadoSalud: 'OPTIMO' | 'ACEPTABLE' | 'DEGRADADO' = 'OPTIMO';
    if (fpsEstimados < 45 || totalCuadrosLentos > 15) {
      estadoSalud = 'DEGRADADO';
    } else if (fpsEstimados < 60 || totalCuadrosLentos > 5) {
      estadoSalud = 'ACEPTABLE';
    }

    return {
      fpsEstimados,
      totalComponentesMonitoreados: lista.length,
      totalRendersGlobales: totalRenders,
      totalCuadrosLentos,
      componentes: lista.sort((a, b) => b.duracionMaximaMs - a.duracionMaximaMs),
      memoriaEstimadaMb: memoriaMb,
      estadoSalud,
    };
  },

  /**
   * Reinicia los contadores para una nueva sesion de profiling.
   */
  limpiar(): void {
    registroComponentes.clear();
    this.notificarOyentes();
  },

  /**
   * Permite que componentes de interfaz se suscriban a actualizaciones en tiempo real.
   */
  suscribir(callback: (diag: DiagnosticoRendimientoGlobal) => void): () => void {
    oyentes.push(callback);
    callback(this.obtenerDiagnostico());
    return () => {
      oyentes = oyentes.filter(cb => cb !== callback);
    };
  },

  notificarOyentes(): void {
    const diag = this.obtenerDiagnostico();
    oyentes.forEach(cb => {
      try {
        cb(diag);
      } catch {}
    });
  },
};
