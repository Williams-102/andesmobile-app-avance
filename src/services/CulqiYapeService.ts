// src/services/CulqiYapeService.ts
// Servicio de integración empresarial para cobros automatizados con Yape y pasarela Culqi (Credicorp / BCP).
// Diseñado para el Módulo 09 - Especialización en Desarrollo Móvil - Code Andes Academy.
// Docente: Ing. Exar Williams Atao Paucar (CIP Reg. 304921)
// CERO EMOJIS O EMOTICONES.

export interface CulqiYapeTokenRequest {
  celular: string;      // Numero celular asociado a la cuenta Yape (9 digitos)
  otp: string;          // Codigo de aprobacion temporal de 6 digitos generado en la app Yape
  monto: number;        // Monto en soles (ej. 150.00)
  email?: string;       // Correo de notificacion del estudiante / cliente
}

export interface CulqiTokenResponse {
  id: string;           // Token ID generado (ej. tkn_live_xxxxxxxx o tkn_test_xxxxxxxx)
  type: string;         // 'yape'
  creation_date: number;
  email?: string;
}

export interface CulqiChargeResponse {
  exito: boolean;
  transaccionId?: string;
  mensaje: string;
  codigoRespuesta?: string;
  montoCobrado?: number;
}

// Claves publicas predeterminadas (Sandbox para pruebas didacticas en clase)
const DEFAULT_CULQI_PUBLIC_KEY = process.env.EXPO_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_b8e5c32789123456';
const CULQI_API_URL = 'https://api.culqi.com/v2';

export const CulqiYapeService = {
  /**
   * Obtiene la clave publica configurada en las variables de entorno.
   * Regla de Seguridad: La Llave Publica (pk_...) solo tiene permisos de tokenizacion y
   * puede residir en el frontend movil. La Llave Privada (sk_...) DEBE residir en el backend.
   */
  obtenerLlavePublica(): string {
    return process.env.EXPO_PUBLIC_CULQI_PUBLIC_KEY || DEFAULT_CULQI_PUBLIC_KEY;
  },

  /**
   * Determina si el servicio opera en modo de pruebas (Sandbox) o en produccion comercial.
   */
  esModoPruebas(): boolean {
    const key = this.obtenerLlavePublica();
    return key.startsWith('pk_test_');
  },

  /**
   * Valida el formato del codigo de aprobacion (OTP) emitido en el aplicativo Yape.
   * El OTP de Yape siempre consta de 6 digitos numericos y expira en 90 a 120 segundos.
   */
  validarOtp(otp: string): { esValido: boolean; mensaje?: string } {
    const limpio = otp.trim();
    if (!limpio) {
      return { esValido: false, mensaje: 'Ingresa el codigo de aprobacion de 6 digitos emitido en tu app Yape.' };
    }
    if (!/^\d{6}$/.test(limpio)) {
      return { esValido: false, mensaje: 'El codigo de aprobacion de Yape debe tener exactamente 6 digitos numericos.' };
    }
    return { esValido: true };
  },

  /**
   * Tokeniza el cobro de Yape directamente contra la API de Culqi (Frontend).
   * Este paso no transfiere dinero aun; genera un tokenId seguro que se envia al backend.
   */
  async tokenizarYape(params: CulqiYapeTokenRequest): Promise<CulqiTokenResponse> {
    const validacionOtp = this.validarOtp(params.otp);
    if (!validacionOtp.esValido) {
      throw new Error(validacionOtp.mensaje);
    }

    const celularLimpio = params.celular.replace(/\D/g, '');
    if (celularLimpio.length !== 9 || !celularLimpio.startsWith('9')) {
      throw new Error('El numero celular receptor de Yape debe tener 9 digitos e iniciar con 9.');
    }

    const publicKey = this.obtenerLlavePublica();

    // Modo Sandbox Didactico para estudiantes sin credenciales bancarias de produccion
    if (params.otp === '123456' || publicKey.includes('123456')) {
      // Simular latencia de red bancaria (800ms)
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        id: `tkn_test_yape_${Date.now()}`,
        type: 'yape',
        creation_date: Math.floor(Date.now() / 1000),
        email: params.email || 'estudiante@codeandes.edu.pe',
      };
    }

    // Modo Real / Conectividad directa con Culqi API
    const montoCentimos = Math.round(params.monto * 100);

    const payload = {
      user_id: celularLimpio,
      otp: params.otp.trim(),
      amount: montoCentimos,
    };

    try {
      const response = await fetch(`${CULQI_API_URL}/tokens/yape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.user_message || data.merchant_message || 'Error al autenticar token con Yape Culqi.';
        throw new Error(errorMsg);
      }

      return {
        id: data.id,
        type: data.type || 'yape',
        creation_date: data.creation_date,
        email: data.email,
      };
    } catch (err: any) {
      console.warn('[CulqiYapeService] Error en tokenizacion:', err.message);
      throw err;
    }
  },

  /**
   * Procesa el cargo bancario definitivo delegando la transaccion al Backend (Supabase Edge Function).
   * La Edge Function utiliza la Secret Key (sk_...) guardada en Supabase Vault para debitar los fondos.
   */
  async procesarCargoEnBackend(params: {
    tokenId: string;
    monto: number;
    email: string;
    matriculaId?: string;
  }): Promise<CulqiChargeResponse> {
    // Si estamos en modo de pruebas didactico local
    if (params.tokenId.startsWith('tkn_test_')) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        exito: true,
        transaccionId: `chr_test_${Date.now().toString().slice(-8)}`,
        mensaje: 'Cobro procesado exitosamente en entorno de pruebas Sandbox.',
        codigoRespuesta: 'AUTORIZADA_200',
        montoCobrado: params.monto,
      };
    }

    // En produccion: Invocar la Edge Function de Supabase
    // POST https://<project-ref>.supabase.co/functions/v1/procesar-cargo-culqi
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables de entorno de Supabase no configuradas para procesar cargos.');
    }

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/procesar-cargo-culqi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          tokenId: params.tokenId,
          monto: params.monto,
          email: params.email,
          matriculaId: params.matriculaId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.exito) {
        return {
          exito: false,
          mensaje: data.mensaje || 'La transaccion fue rechazada por la entidad bancaria.',
          codigoRespuesta: data.codigo || 'ERROR_402',
        };
      }

      return {
        exito: true,
        transaccionId: data.transaccionId,
        mensaje: 'Pago completado con exito.',
        codigoRespuesta: 'AUTORIZADA_200',
        montoCobrado: params.monto,
      };
    } catch (err: any) {
      return {
        exito: false,
        mensaje: `Fallo de conexion con pasarela bancaria: ${err.message}`,
        codigoRespuesta: 'NETWORK_TIMEOUT',
      };
    }
  },
};
