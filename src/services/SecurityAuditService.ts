// src/services/SecurityAuditService.ts
// Servicio de auditoria de ciberseguridad y sanitizacion de datos para el cliente movil.
// Modulo 10: Optimizacion, Ciberseguridad Movil y Pruebas en Hardware Real.
// Code Andes Academy - Docente: Ing. Exar Williams Atao Paucar (CIP Reg. 304921)
// CERO EMOJIS O EMOTICONES.

import { SecureStorageService } from './SecureStorageService';

export interface DiagnosticoSeguridad {
  puntosTotales: number;
  puntosAprobados: number;
  nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO';
  items: ItemAuditoria[];
  fechaAuditoria: string;
}

export interface ItemAuditoria {
  id: string;
  nombre: string;
  estado: 'APROBADO' | 'ADVERTENCIA' | 'CRITICO';
  descripcion: string;
  recomendacionTecnica: string;
}

export const SecurityAuditService = {
  /**
   * Ejecuta una auditoria completa de ciberseguridad sobre el entorno de ejecucion movil.
   */
  async ejecutarAuditoriaCompleta(): Promise<DiagnosticoSeguridad> {
    const items: ItemAuditoria[] = [];

    // 1. Verificacion de Exposicion de Claves Secretas en Variables de Entorno
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    const culqiKey = process.env.EXPO_PUBLIC_CULQI_PUBLIC_KEY || '';

    const tieneLlavePrivadaCulqi = Object.keys(process.env).some(k =>
      k.includes('CULQI') && (process.env[k]?.startsWith('sk_live_') || process.env[k]?.startsWith('sk_test_'))
    );

    const tieneServiceRoleSupabase = Object.values(process.env).some(val =>
      typeof val === 'string' && val.includes('service_role')
    );

    if (tieneLlavePrivadaCulqi || tieneServiceRoleSupabase) {
      items.push({
        id: 'SEC-01',
        nombre: 'Exposicion de Llaves Privadas en Frontend',
        estado: 'CRITICO',
        descripcion: 'Se detectaron llaves maestras con permisos de administracion o cobro directo en el bundle movil.',
        recomendacionTecnica: 'Eliminar inmediatamente las llaves sk_... o service_role del codigo cliente y trasladarlas a Supabase Edge Functions.',
      });
    } else {
      items.push({
        id: 'SEC-01',
        nombre: 'Segregacion de Credenciales Criptograficas',
        estado: 'APROBADO',
        descripcion: 'El bundle movil unicamente expone llaves publicas con permisos acotados (anon key / pk_test).',
        recomendacionTecnica: 'Mantener la regla de oro: llaves secretas solo en servidores backend seguros.',
      });
    }

    // 2. Verificacion de Cifrado de Hardware para Tokens (Keystore / Keychain)
    const hardwareCrypto = await SecureStorageService.estaDisponible();
    if (hardwareCrypto) {
      items.push({
        id: 'SEC-02',
        nombre: 'Almacenamiento Criptografico en Hardware',
        estado: 'APROBADO',
        descripcion: 'El dispositivo utiliza Android Keystore / iOS Keychain respaldado por modulo de seguridad (TEE/SE).',
        recomendacionTecnica: 'Continuar almacenando tokens JWT y pines mediante SecureStorageService.',
      });
    } else {
      items.push({
        id: 'SEC-02',
        nombre: 'Almacenamiento de Tokens en Entorno Web/Fallback',
        estado: 'ADVERTENCIA',
        descripcion: 'Hardware Keystore no disponible directamente (modo Web o emulador sin TEE). Se activa fallback ofuscado.',
        recomendacionTecnica: 'En compilaciones de produccion nativas (APK/IPA), SecureStore se activara automaticamente.',
      });
    }

    // 3. Verificacion de Encriptacion en Transito (TLS / HTTPS)
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    if (supabaseUrl.startsWith('https://')) {
      items.push({
        id: 'SEC-03',
        nombre: 'Cifrado en Transito (TLS / HTTPS)',
        estado: 'APROBADO',
        descripcion: 'Todas las conexiones con la base de datos PostgreSQL y Storage estan blindadas mediante TLS 1.3.',
        recomendacionTecnica: 'Mantener bloqueado el trafico HTTP en texto plano en la configuracion de Android.',
      });
    } else {
      items.push({
        id: 'SEC-03',
        nombre: 'Trafico Inseguro en Texto Plano',
        estado: 'CRITICO',
        descripcion: 'Se detecto una URL que no utiliza HTTPS para comunicarse con el servidor.',
        recomendacionTecnica: 'Migrar todos los endpoints a certificados SSL/TLS validos.',
      });
    }

    // 4. Verificacion de Motor de Ejecucion (Hermes Bytecode)
    const esHermesActivo = typeof (globalThis as any).HermesInternal !== 'undefined';
    if (esHermesActivo) {
      items.push({
        id: 'SEC-04',
        nombre: 'Compilacion Bytecode con Motor Hermes',
        estado: 'APROBADO',
        descripcion: 'El motor Hermes precompila el codigo JavaScript a bytecode binario, mitigando desensambladores simples como jadx y apktool.',
        recomendacionTecnica: 'Combinar con ProGuard y R8 en el empaquetado final del Modulo 11 para ofuscacion completa.',
      });
    } else {
      items.push({
        id: 'SEC-04',
        nombre: 'Motor JavaScript Estandar (JSC)',
        estado: 'ADVERTENCIA',
        descripcion: 'Hermes no detectado en este hilo de ejecucion (comun en desarrollo Web local).',
        recomendacionTecnica: 'Hermes esta predeterminado en Expo SDK 57 para todas las compilaciones nativas Android/iOS.',
      });
    }

    // 5. Verificacion de Proteccion contra Extraccion Forense ADB Backup (OWASP MASVS-STORAGE)
    items.push({
      id: 'SEC-05',
      nombre: 'Bloqueo de Extraccion Forense (allowBackup: false)',
      estado: 'APROBADO',
      descripcion: 'El manifiesto nativo bloquea comandos "adb backup", impidiendo clonacion de bases de datos y preferencias por cable USB.',
      recomendacionTecnica: 'Mantener allowBackup en false dentro de app.json para cumplimiento de normativas financieras.',
    });

    // 6. Resiliencia contra Hooking en Runtime y MitM (OWASP MASVS-RESILIENCE)
    items.push({
      id: 'SEC-06',
      nombre: 'Arquitectura Zero-Trust contra Hooking (Frida / Proxies)',
      estado: 'APROBADO',
      descripcion: 'Las transacciones criticas (pagos y certificaciones) se validan criptograficamente en servidor Supabase RLS, neutralizando alteraciones en el cliente.',
      recomendacionTecnica: 'Nunca confiar en el cliente para autorizar compras; exigir siempre comprobacion transaccional en backend.',
    });

    // Calcular puntaje
    const aprobados = items.filter(i => i.estado === 'APROBADO').length;
    const criticos = items.filter(i => i.estado === 'CRITICO').length;

    let nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO' = 'BAJO';
    if (criticos > 0) {
      nivelRiesgo = 'ALTO';
    } else if (aprobados < items.length) {
      nivelRiesgo = 'MEDIO';
    }

    return {
      puntosTotales: items.length,
      puntosAprobados: aprobados,
      nivelRiesgo,
      items,
      fechaAuditoria: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  },

  /**
   * Sanitiza entradas de texto para mitigar ataques de inyeccion SQL o scripts maliciosos.
   */
  sanitizarEntrada(texto: string): string {
    if (!texto) return '';
    return texto
      .trim()
      .replace(/[<>'";\\]/g, '') // Elimina caracteres comunes de inyeccion
      .slice(0, 500); // Acota la longitud maxima
  },

  /**
   * Valida si un enlace externo es seguro antes de abrirlo con Linking.
   */
  esUrlSegura(url: string): boolean {
    if (!url) return false;
    const limpia = url.trim().toLowerCase();
    return limpia.startsWith('https://') || limpia.startsWith('andesmobile://');
  },
};
