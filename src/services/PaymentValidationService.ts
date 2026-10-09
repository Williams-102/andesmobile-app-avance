// src/services/PaymentValidationService.ts
// Servicio de validación financiera real (Algoritmo de Luhn, fechas, CVV, celulares Perú)
// y gestión de configuración de cuentas receptoras para el Módulo 09.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_CONFIG_PAGOS = '@andes_configuracion_cuentas_pago_v1';

export interface ConfiguracionCuentasPago {
  yapeNumero: string;
  yapeTitular: string;
  yapeBanco: string;
  yapeQrImagen?: string;
  plinNumero: string;
  plinTitular: string;
  plinBanco: string;
  plinQrImagen?: string;
  tarjetaCuentaDestino: string;
  tarjetaTitularDestino: string;
  tarjetaBancoDestino: string;
  cciDestino: string;
}

export const CONFIGURACION_PAGO_POR_DEFECTO: ConfiguracionCuentasPago = {
  yapeNumero: '916 694 173',
  yapeTitular: 'Exar Williams Atao Paucar',
  yapeBanco: 'Banco de Credito del Peru (BCP)',
  plinNumero: '916 694 173',
  plinTitular: 'Code Andes Academy S.A.C.',
  plinBanco: 'BBVA / Interbank',
  tarjetaCuentaDestino: '193-9821049-0-44',
  tarjetaTitularDestino: 'Code Andes Academy S.A.C.',
  tarjetaBancoDestino: 'BCP Cta. Cte. Soles',
  cciDestino: '002-193009821049044-12',
};

export interface ValidacionResultado {
  esValido: boolean;
  mensaje?: string;
  franquicia?: string;
}

export const PaymentValidationService = {
  /**
   * Obtiene la configuración de cuentas de destino persistida o retorna la predeterminada.
   */
  async obtenerConfiguracion(): Promise<ConfiguracionCuentasPago> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_CONFIG_PAGOS);
      if (data) {
        return { ...CONFIGURACION_PAGO_POR_DEFECTO, ...JSON.parse(data) };
      }
    } catch (err) {
      console.warn('[PaymentValidationService] Error al leer configuracion de cuentas:', err);
    }
    return CONFIGURACION_PAGO_POR_DEFECTO;
  },

  /**
   * Guarda una nueva configuración de cuentas de destino en almacenamiento local.
   */
  async guardarConfiguracion(config: ConfiguracionCuentasPago): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CONFIG_PAGOS, JSON.stringify(config));
      return true;
    } catch (err) {
      console.warn('[PaymentValidationService] Error al guardar configuracion de cuentas:', err);
      return false;
    }
  },

  /**
   * Restablece la configuración de cuentas a los valores institucionales por defecto.
   */
  async restablecerConfiguracionPorDefecto(): Promise<ConfiguracionCuentasPago> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_CONFIG_PAGOS);
    } catch (err) {
      // Ignorar
    }
    return CONFIGURACION_PAGO_POR_DEFECTO;
  },

  /**
   * Detecta la franquicia de la tarjeta según los primeros dígitos (IIN / BIN).
   */
  detectarFranquicia(numero: string): 'VISA' | 'MASTERCARD' | 'AMEX' | 'DINERS' | 'TARJETA' {
    const limpio = numero.replace(/\D/g, '');
    if (limpio.startsWith('4')) return 'VISA';
    if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(limpio)) return 'MASTERCARD';
    if (/^3[47]/.test(limpio)) return 'AMEX';
    if (/^3(?:0[0-5]|[68]\d)/.test(limpio)) return 'DINERS';
    return 'TARJETA';
  },

  /**
   * Valida un número de tarjeta bancaria mediante el Algoritmo de Luhn (Módulo 10).
   * No acepta datos ficticios o números aleatorios que no cumplan el checksum bancario.
   */
  validarNumeroTarjeta(numero: string): ValidacionResultado {
    const limpio = numero.replace(/\D/g, '');
    const franquicia = this.detectarFranquicia(limpio);

    if (limpio.length < 13 || limpio.length > 19) {
      return {
        esValido: false,
        franquicia,
        mensaje: `Longitud invalida (${limpio.length} digitos). Las tarjetas bancarias contienen entre 14 y 16 digitos.`,
      };
    }

    // Comprobar si son todos digitos repetidos triviales (ej: 0000000000000000)
    if (/^(\d)\1+$/.test(limpio)) {
      return {
        esValido: false,
        franquicia,
        mensaje: 'Numero de tarjeta no valido. No se permiten digitos identicos repetidos.',
      };
    }

    // Algoritmo de Luhn (Mod 10)
    let suma = 0;
    let duplicar = false;

    for (let i = limpio.length - 1; i >= 0; i--) {
      let digito = parseInt(limpio.charAt(i), 10);
      if (duplicar) {
        digito *= 2;
        if (digito > 9) {
          digito -= 9;
        }
      }
      suma += digito;
      duplicar = !duplicar;
    }

    if (suma % 10 !== 0) {
      return {
        esValido: false,
        franquicia,
        mensaje: 'El numero de tarjeta no supera el algoritmo de validacion bancaria (Luhn / Modulo 10). Verifica los digitos.',
      };
    }

    return {
      esValido: true,
      franquicia,
    };
  },

  /**
   * Valida la fecha de expiración en formato MM/AA.
   * Comprueba que el mes esté entre 01 y 12 y que no esté vencida respecto a la fecha actual.
   */
  validarFechaExpiracion(expiracion: string): ValidacionResultado {
    const limpio = expiracion.trim();
    const match = limpio.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);

    if (!match) {
      return {
        esValido: false,
        mensaje: 'Formato de expiracion invalido. Debe ser MM/AA con dos digitos de mes (01-12) y dos de ano.',
      };
    }

    const mes = parseInt(match[1], 10);
    const anoDosDigitos = parseInt(match[2], 10);
    const anoCompleto = 2000 + anoDosDigitos;

    const fechaActual = new Date();
    const anoActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1; // 1-indexado

    if (anoCompleto < anoActual || (anoCompleto === anoActual && mes < mesActual)) {
      return {
        esValido: false,
        mensaje: `La tarjeta se encuentra vencida (${limpio}). Ingresa una fecha de vigencia posterior a la actual.`,
      };
    }

    if (anoCompleto > anoActual + 15) {
      return {
        esValido: false,
        mensaje: 'El ano de vencimiento excede el periodo comercial admitido (maximo 15 anos).',
      };
    }

    return { esValido: true };
  },

  /**
   * Valida el código de seguridad CVV / CVC.
   */
  validarCVV(cvv: string, franquicia: string = 'TARJETA'): ValidacionResultado {
    const limpio = cvv.trim();
    if (!/^\d+$/.test(limpio)) {
      return {
        esValido: false,
        mensaje: 'El codigo CVV debe contener unicamente digitos numericos.',
      };
    }

    if (franquicia === 'AMEX') {
      if (limpio.length !== 4) {
        return {
          esValido: false,
          mensaje: 'Las tarjetas American Express requieren un codigo de seguridad de 4 digitos al frente.',
        };
      }
    } else {
      if (limpio.length !== 3) {
        return {
          esValido: false,
          mensaje: 'El codigo CVV del reverso de la tarjeta debe contener exactamente 3 digitos.',
        };
      }
    }

    return { esValido: true };
  },

  /**
   * Valida el nombre del titular de la tarjeta.
   */
  validarTitularTarjeta(titular: string): ValidacionResultado {
    const limpio = titular.trim();
    if (limpio.length < 5) {
      return {
        esValido: false,
        mensaje: 'Ingresa el nombre completo del titular como figura impreso en la tarjeta.',
      };
    }

    const palabras = limpio.split(/\s+/).filter(Boolean);
    if (palabras.length < 2) {
      return {
        esValido: false,
        mensaje: 'El titular debe contener al menos un nombre y un apellido.',
      };
    }

    if (/\d/.test(limpio)) {
      return {
        esValido: false,
        mensaje: 'El nombre del titular no puede contener digitos numericos.',
      };
    }

    return { esValido: true };
  },

  /**
   * Valida el número de celular de origen (Perú) para transferencias Yape o Plin.
   */
  validarCelularPeru(celular: string): ValidacionResultado {
    const limpio = celular.replace(/\s+/g, '').trim();
    if (!limpio) {
      return {
        esValido: false,
        mensaje: 'Ingresa el numero de celular desde el que realizaste el envio de dinero.',
      };
    }

    if (!/^9\d{8}$/.test(limpio)) {
      return {
        esValido: false,
        mensaje: `Numero de celular invalido (${limpio}). En Peru los numeros moviles inician con 9 y constan de 9 digitos.`,
      };
    }

    return { esValido: true };
  },

  /**
   * Valida el número de operación bancaria emitido por Yape o Plin.
   */
  validarNumeroOperacion(operacion: string): ValidacionResultado {
    const limpio = operacion.trim();
    if (!limpio) {
      return {
        esValido: false,
        mensaje: 'Ingresa el numero de operacion bancaria emitido en tu constancia.',
      };
    }

    if (!/^\d{6,10}$/.test(limpio)) {
      return {
        esValido: false,
        mensaje: `Numero de operacion no valido (${limpio}). Las transacciones bancarias contienen entre 6 y 10 digitos numericos.`,
      };
    }

    // Descartar secuencias triviales ficticias
    if (/^(\d)\1+$/.test(limpio) || limpio === '123456' || limpio === '1234567' || limpio === '12345678') {
      return {
        esValido: false,
        mensaje: 'Numero de operacion ficticio detectado. Ingresa el codigo autentico de tu recibo bancario.',
      };
    }

    return { esValido: true };
  },
};
