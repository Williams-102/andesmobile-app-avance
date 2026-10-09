// src/components/CheckoutModal.tsx
// Modal de Checkout interactivo con Yape, Plin, Tarjeta Bancaria, QR Dinamico y subida de Vouchers (Modulo 09)

import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { checkoutStyles } from '../styles/checkout.styles';
import { Boleta, BoletaItem } from '../types/boleta';
import { useNotification } from '../context/NotificationContext';
import { VouchersSupabaseService } from '../services/VouchersSupabaseService';
import { BoletasService } from '../services/BoletasService';
import { MatriculasSupabaseService } from '../services/MatriculasSupabaseService';
import { SyncEngine } from '../services/SyncEngine';
import { useAuth } from '../context/AuthContext';
import {
  PaymentValidationService,
  ConfiguracionCuentasPago,
  CONFIGURACION_PAGO_POR_DEFECTO,
} from '../services/PaymentValidationService';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  items: BoletaItem[];
  total: number;
  subtotal: number;
  igv: number;
  isOffline: boolean;
  onPagoCompletado: (boleta: Boleta) => void;
}

export type MetodoPagoTipo = 'yape' | 'plin' | 'tarjeta';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  onClose,
  items,
  total,
  subtotal,
  igv,
  isOffline,
  onPagoCompletado,
}) => {
  const { showToast } = useNotification();
  const { usuario } = useAuth();

  // Estados reactivos del modal
  const [metodo, setMetodo] = useState<MetodoPagoTipo>('yape');
  const [cargando, setCargando] = useState<boolean>(false);

  // Configuracion de cuentas receptoras (personalizable en clase)
  const [configCuentas, setConfigCuentas] = useState<ConfiguracionCuentasPago>(CONFIGURACION_PAGO_POR_DEFECTO);
  const [mostrarConfigCuentas, setMostrarConfigCuentas] = useState<boolean>(false);
  const [editYapeNumero, setEditYapeNumero] = useState<string>(CONFIGURACION_PAGO_POR_DEFECTO.yapeNumero);
  const [editYapeTitular, setEditYapeTitular] = useState<string>(CONFIGURACION_PAGO_POR_DEFECTO.yapeTitular);
  const [editPlinNumero, setEditPlinNumero] = useState<string>(CONFIGURACION_PAGO_POR_DEFECTO.plinNumero);
  const [editPlinTitular, setEditPlinTitular] = useState<string>(CONFIGURACION_PAGO_POR_DEFECTO.plinTitular);
  const [editTarjetaCuenta, setEditTarjetaCuenta] = useState<string>(CONFIGURACION_PAGO_POR_DEFECTO.tarjetaCuentaDestino);
  const [editTarjetaTitular, setEditTarjetaTitular] = useState<string>(CONFIGURACION_PAGO_POR_DEFECTO.tarjetaTitularDestino);
  const [editCci, setEditCci] = useState<string>(CONFIGURACION_PAGO_POR_DEFECTO.cciDestino);

  // Estados para Yape y Plin
  const [celularEmisor, setCelularEmisor] = useState<string>('');
  const [voucherUri, setVoucherUri] = useState<string | null>(null);
  const [voucherBase64, setVoucherBase64] = useState<string | null>(null);
  const [numeroOperacion, setNumeroOperacion] = useState<string>('');

  // Estados para Tarjeta Bancaria
  const [tarjetaNumero, setTarjetaNumero] = useState<string>('');
  const [tarjetaExpiracion, setTarjetaExpiracion] = useState<string>('');
  const [tarjetaCvv, setTarjetaCvv] = useState<string>('');
  const [tarjetaTitular, setTarjetaTitular] = useState<string>('');

  // Cargar configuracion persistida al abrir el modal
  useEffect(() => {
    if (visible) {
      PaymentValidationService.obtenerConfiguracion().then((cfg) => {
        setConfigCuentas(cfg);
        setEditYapeNumero(cfg.yapeNumero);
        setEditYapeTitular(cfg.yapeTitular);
        setEditPlinNumero(cfg.plinNumero);
        setEditPlinTitular(cfg.plinTitular);
        setEditTarjetaCuenta(cfg.tarjetaCuentaDestino);
        setEditTarjetaTitular(cfg.tarjetaTitularDestino);
        setEditCci(cfg.cciDestino);
      });
    }
  }, [visible]);

  // Guardar configuracion de cuentas personalizada
  const handleGuardarConfigCuentas = async () => {
    const nueva: ConfiguracionCuentasPago = {
      yapeNumero: editYapeNumero.trim() || CONFIGURACION_PAGO_POR_DEFECTO.yapeNumero,
      yapeTitular: editYapeTitular.trim() || CONFIGURACION_PAGO_POR_DEFECTO.yapeTitular,
      yapeBanco: CONFIGURACION_PAGO_POR_DEFECTO.yapeBanco,
      plinNumero: editPlinNumero.trim() || CONFIGURACION_PAGO_POR_DEFECTO.plinNumero,
      plinTitular: editPlinTitular.trim() || CONFIGURACION_PAGO_POR_DEFECTO.plinTitular,
      plinBanco: CONFIGURACION_PAGO_POR_DEFECTO.plinBanco,
      tarjetaCuentaDestino: editTarjetaCuenta.trim() || CONFIGURACION_PAGO_POR_DEFECTO.tarjetaCuentaDestino,
      tarjetaTitularDestino: editTarjetaTitular.trim() || CONFIGURACION_PAGO_POR_DEFECTO.tarjetaTitularDestino,
      tarjetaBancoDestino: CONFIGURACION_PAGO_POR_DEFECTO.tarjetaBancoDestino,
      cciDestino: editCci.trim() || CONFIGURACION_PAGO_POR_DEFECTO.cciDestino,
    };
    await PaymentValidationService.guardarConfiguracion(nueva);
    setConfigCuentas(nueva);
    setMostrarConfigCuentas(false);
    showToast({
      type: 'success',
      title: 'Cuentas Actualizadas',
      message: 'Los datos de cobro han sido guardados para esta y futuras sesiones.',
    });
  };

  // Restablecer configuracion de cuentas a valores institucionales
  const handleRestablecerConfigCuentas = async () => {
    const def = await PaymentValidationService.restablecerConfiguracionPorDefecto();
    setConfigCuentas(def);
    setEditYapeNumero(def.yapeNumero);
    setEditYapeTitular(def.yapeTitular);
    setEditPlinNumero(def.plinNumero);
    setEditPlinTitular(def.plinTitular);
    setEditTarjetaCuenta(def.tarjetaCuentaDestino);
    setEditTarjetaTitular(def.tarjetaTitularDestino);
    setEditCci(def.cciDestino);
    setMostrarConfigCuentas(false);
    showToast({
      type: 'info',
      title: 'Cuentas Restablecidas',
      message: 'Se restauraron los numeros oficiales de Code Andes Academy.',
    });
  };

  // Informacion del receptor segun metodo y configuracion
  const infoReceptor = useMemo(() => {
    if (metodo === 'yape') {
      return {
        nombreMetodo: 'YAPE',
        numero: configCuentas.yapeNumero,
        titular: configCuentas.yapeTitular,
        banco: configCuentas.yapeBanco,
        qrTag: 'QR OFICIAL YAPE',
      };
    }
    if (metodo === 'plin') {
      return {
        nombreMetodo: 'PLIN',
        numero: configCuentas.plinNumero,
        titular: configCuentas.plinTitular,
        banco: configCuentas.plinBanco,
        qrTag: 'QR OFICIAL PLIN',
      };
    }
    return {
      nombreMetodo: 'TARJETA BANCARIA',
      numero: configCuentas.tarjetaCuentaDestino,
      titular: configCuentas.tarjetaTitularDestino,
      banco: configCuentas.tarjetaBancoDestino,
      cci: configCuentas.cciDestino,
      qrTag: 'PASARELA VISA / MC',
    };
  }, [metodo, configCuentas]);

  // URL del QR Dinamico generado segun cuenta de destino y monto exacto
  const qrUrl = useMemo(() => {
    const dest = (metodo === 'yape' ? configCuentas.yapeNumero : configCuentas.plinNumero).replace(/\s/g, '');
    const dataQr = `PAGO_${metodo.toUpperCase()}_A_${dest}_MONTO_${total.toFixed(2)}_ORDEN_${Date.now()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(dataQr)}`;
  }, [metodo, total, configCuentas]);

  // Detector de franquicia de tarjeta
  const tipoTarjeta = useMemo(() => {
    return PaymentValidationService.detectarFranquicia(tarjetaNumero);
  }, [tarjetaNumero]);

  // Validacion Luhn en tiempo real de la tarjeta
  const validacionTarjetaLuhn = useMemo(() => {
    const limpio = tarjetaNumero.replace(/\s/g, '');
    if (limpio.length < 13) return null;
    return PaymentValidationService.validarNumeroTarjeta(tarjetaNumero);
  }, [tarjetaNumero]);

  // Copiar numero al portapapeles
  const handleCopiarNumero = async (numero: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(numero);
      }
    } catch (e) {
      // Ignorar fallback
    }
    showToast({
      type: 'info',
      title: 'Numero Copiado',
      message: `Se copio el telefono ${numero} al portapapeles.`,
    });
  };

  // Selector de imagen desde la galeria con Expo ImagePicker
  const handleSeleccionarGaleria = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast({
          type: 'warning',
          title: 'Permiso Denegado',
          message: 'Se requiere acceso a la galeria para seleccionar el comprobante.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVoucherUri(result.assets[0].uri);
        setVoucherBase64(result.assets[0].base64 || null);
        showToast({
          type: 'success',
          title: 'Comprobante Adjuntado',
          message: 'La captura del voucher ha sido cargada correctamente.',
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error de Seleccion',
        message: 'No se pudo abrir la galeria de fotos.',
      });
    }
  };

  // Tomar foto con la camara con Expo ImagePicker
  const handleTomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast({
          type: 'warning',
          title: 'Permiso Denegado',
          message: 'Se requiere acceso a la camara para fotografiar el voucher.',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVoucherUri(result.assets[0].uri);
        setVoucherBase64(result.assets[0].base64 || null);
        showToast({
          type: 'success',
          title: 'Foto Capturada',
          message: 'Comprobante fotografiado con exito.',
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error de Camara',
        message: 'No se pudo iniciar la camara fotografica.',
      });
    }
  };

  // Boton para rellenar comprobante y operacion demo (Yape / Plin) para evaluacion en clase
  const handleRellenarVoucherDemo = () => {
    const demoOp = String(Math.floor(100000 + Math.random() * 900000));
    setVoucherUri('https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600');
    setVoucherBase64(null);
    setCelularEmisor('984 512 603');
    setNumeroOperacion(demoOp);
    showToast({
      type: 'info',
      title: 'Datos Demo de Pago Cargados',
      message: `Celular (984 512 603) y N° de operacion (${demoOp}) asignados para pruebas.`,
    });
  };

  // Boton para rellenar tarjeta demo de prueba que cumple estrictamente el algoritmo de Luhn
  const handleRellenarTarjetaDemo = () => {
    setTarjetaNumero('4242 4242 4242 4242'); // Tarjeta Visa real valida (Luhn checksum correcto)
    setTarjetaExpiracion('12/28');
    setTarjetaCvv('842');
    setTarjetaTitular(usuario?.nombre ? usuario.nombre.toUpperCase() : 'ESTUDIANTE ANDES');
    showToast({
      type: 'info',
      title: 'Tarjeta Demo Cargada',
      message: 'Tarjeta Visa de pruebas con Checksum Luhn valido cargada para evaluacion rapida.',
    });
  };

  // Formateo reactivo del numero de tarjeta (grupos de 4)
  const handleCambioTarjetaNumero = (texto: string) => {
    const soloNumeros = texto.replace(/\D/g, '').slice(0, 16);
    const agrupado = soloNumeros.match(/.{1,4}/g)?.join(' ') || soloNumeros;
    setTarjetaNumero(agrupado);
  };

  // Formateo reactivo de fecha de expiracion (MM/AA)
  const handleCambioExpiracion = (texto: string) => {
    const soloNumeros = texto.replace(/\D/g, '').slice(0, 4);
    if (soloNumeros.length >= 3) {
      setTarjetaExpiracion(`${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`);
    } else {
      setTarjetaExpiracion(soloNumeros);
    }
  };

  // Procesamiento del pago con validaciones financieras reales (sin datos ficticios)
  const handleProcesarPago = async () => {
    // 1. Validacion estricta para Yape y Plin
    if (metodo === 'yape' || metodo === 'plin') {
      const valCel = PaymentValidationService.validarCelularPeru(celularEmisor);
      if (!valCel.esValido) {
        showToast({
          type: 'warning',
          title: 'Celular Invalido',
          message: valCel.mensaje || 'Ingresa un numero de celular peruano de 9 digitos que inicie con 9.',
        });
        return;
      }

      const valOp = PaymentValidationService.validarNumeroOperacion(numeroOperacion);
      if (!valOp.esValido) {
        showToast({
          type: 'warning',
          title: 'N° de Operacion Invalido',
          message: valOp.mensaje || 'Ingresa el numero de operacion bancaria autentico.',
        });
        return;
      }

      if (!voucherUri) {
        showToast({
          type: 'warning',
          title: 'Comprobante Requerido',
          message: 'Adjunta una captura de tu pago o presiona "Rellenar Comprobante Demo" para evaluar.',
        });
        return;
      }
    }

    // 2. Validacion estricta para Tarjeta Bancaria (Algoritmo de Luhn, fecha y CVV)
    if (metodo === 'tarjeta') {
      const valTarjeta = PaymentValidationService.validarNumeroTarjeta(tarjetaNumero);
      if (!valTarjeta.esValido) {
        showToast({
          type: 'warning',
          title: 'Tarjeta Invalida',
          message: valTarjeta.mensaje || 'El numero de tarjeta no cumple el algoritmo bancario (Luhn / Mod 10).',
        });
        return;
      }

      const valFecha = PaymentValidationService.validarFechaExpiracion(tarjetaExpiracion);
      if (!valFecha.esValido) {
        showToast({
          type: 'warning',
          title: 'Vencimiento Invalido',
          message: valFecha.mensaje || 'Ingresa una fecha de vigencia valida en formato MM/AA.',
        });
        return;
      }

      const valCvv = PaymentValidationService.validarCVV(tarjetaCvv, tipoTarjeta);
      if (!valCvv.esValido) {
        showToast({
          type: 'warning',
          title: 'CVV Invalido',
          message: valCvv.mensaje || 'Ingresa los digitos de seguridad del reverso de la tarjeta.',
        });
        return;
      }

      const valTitular = PaymentValidationService.validarTitularTarjeta(tarjetaTitular);
      if (!valTitular.esValido) {
        showToast({
          type: 'warning',
          title: 'Titular Invalido',
          message: valTitular.mensaje || 'Ingresa el nombre y apellido del titular como figura en la tarjeta.',
        });
        return;
      }
    }

    setCargando(true);

    try {
      let urlVoucherFinal: string | undefined = undefined;

      // Subir voucher a Supabase Storage si es Yape o Plin
      if ((metodo === 'yape' || metodo === 'plin') && voucherUri) {
        const subida = await VouchersSupabaseService.subirComprobante(
          voucherUri,
          metodo,
          voucherBase64 || undefined
        );
        urlVoucherFinal = subida.url;
      }

      const randomCorrelativo = Math.floor(1000 + Math.random() * 9000);
      const idMatricula = `BOL-2026-${randomCorrelativo}`;
      const serieMatricula = `B001-${String(randomCorrelativo).padStart(6, '0')}`;

      // Metodo de pago 100% dinamico
      const metodoTexto =
        metodo === 'yape'
          ? 'Yape'
          : metodo === 'plin'
          ? 'Plin'
          : `Tarjeta (${tipoTarjeta})`;

      const ultimosDigitos =
        metodo === 'tarjeta'
          ? tarjetaNumero.replace(/\s/g, '').slice(-4)
          : undefined;

      const opFinal = numeroOperacion.trim() || undefined;

      // Si estamos en modo Offline First: Encolar en SyncEngine
      if (isOffline) {
        const ticketId = await SyncEngine.encolar({
          tipo: 'INSCRIPCION_CURSO',
          payload: {
            items,
            total,
            metodoPago: metodoTexto,
            numeroOperacion: opFinal,
            voucherUrl: urlVoucherFinal,
            ultimosDigitosTarjeta: ultimosDigitos,
            usuarioId: usuario?.id || null,
            clienteNombre: usuario?.nombre || 'Estudiante Code Andes',
            clienteEmail: usuario?.email || '',
            fecha: new Date().toISOString(),
          },
        });

        // Registrar boleta local asociada al alumno
        const boletaOffline = await BoletasService.registrarBoleta({
          id: idMatricula,
          serie: serieMatricula,
          cursos: items,
          total,
          subtotal,
          igv,
          metodoPago: metodoTexto,
          numeroOperacion: opFinal,
          voucherUrl: urlVoucherFinal,
          ultimosDigitosTarjeta: ultimosDigitos,
          usuarioId: usuario?.id || null,
          clienteNombre: usuario?.nombre || 'Estudiante Code Andes',
          clienteEmail: usuario?.email || '',
          estado: 'SINCRONIZADO_OFFLINE',
          ticketOfflineId: ticketId,
        });

        setCargando(false);
        onClose();
        onPagoCompletado(boletaOffline);

        showToast({
          type: 'success',
          title: 'Matricula Guardada Offline',
          message: `Ticket: ${ticketId}. Boleta ${serieMatricula} emitida y guardada localmente.`,
          duration: 4500,
        });
        return;
      }

      // Flujo Online: Registrar en Supabase PostgreSQL
      const matriculaPayload = {
        id: idMatricula,
        usuario_id: usuario?.id || null,
        total,
        subtotal,
        igv,
        metodo_pago: metodoTexto,
        numero_operacion: opFinal || null,
        voucher_url: urlVoucherFinal || null,
        banco_origen: metodo.toUpperCase(),
        ultimos_digitos_tarjeta: ultimosDigitos || null,
        estado: 'completado' as const,
      };

      const itemsPayload = items.map((it) => ({
        curso_id: it.id,
        precio_unitario: it.precio,
      }));

      await MatriculasSupabaseService.crearMatricula(matriculaPayload, itemsPayload);

      // Registrar boleta en almacenamiento local con los datos reales del alumno autenticado
      const boletaOnline = await BoletasService.registrarBoleta({
        id: idMatricula,
        serie: serieMatricula,
        cursos: items,
        total,
        subtotal,
        igv,
        metodoPago: metodoTexto,
        numeroOperacion: opFinal,
        voucherUrl: urlVoucherFinal,
        ultimosDigitosTarjeta: ultimosDigitos,
        usuarioId: usuario?.id || null,
        clienteNombre: usuario?.nombre || 'Estudiante Code Andes',
        clienteEmail: usuario?.email || '',
        estado: 'COMPLETADO_ONLINE',
      });

      setCargando(false);
      onClose();
      onPagoCompletado(boletaOnline);

      showToast({
        type: 'success',
        title: 'Pago Confirmado',
        message: `Boleta ${serieMatricula} emitida exitosamente (${metodoTexto}).`,
        duration: 4000,
      });
    } catch (err: any) {
      setCargando(false);
      showToast({
        type: 'error',
        title: 'Error de Transaccion',
        message: err?.message || 'No se pudo completar el procesamiento del pago.',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={checkoutStyles.modalOverlay}>
        <View style={checkoutStyles.modalContent}>
          {/* Cabecera del Modal */}
          <View style={checkoutStyles.header}>
            <View>
              <Text style={checkoutStyles.headerTitle}>Pasarela de Pagos</Text>
              <Text style={checkoutStyles.headerSubtitle}>
                Matricula e Inscripcion Digital 2026
              </Text>
            </View>
            <TouchableOpacity style={checkoutStyles.botonCerrar} onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={checkoutStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Tarjeta de Resumen Economico */}
            <View style={checkoutStyles.resumenMontoCard}>
              <View>
                <Text style={checkoutStyles.resumenMontoLabel}>Monto Total a Pagar</Text>
                <Text style={checkoutStyles.resumenMontoItems}>
                  {items.length} {items.length === 1 ? 'curso seleccionado' : 'cursos seleccionados'}
                </Text>
              </View>
              <Text style={checkoutStyles.resumenMontoValor}>S/ {total.toFixed(2)}</Text>
            </View>

            {/* Boton para Desplegar Configuracion de Cuentas Destino */}
            <TouchableOpacity
              style={checkoutStyles.botonConfigCuentas}
              onPress={() => setMostrarConfigCuentas(!mostrarConfigCuentas)}
            >
              <Ionicons
                name={mostrarConfigCuentas ? 'chevron-up-outline' : 'settings-outline'}
                size={14}
                color={Colors.primary}
              />
              <Text style={checkoutStyles.botonConfigCuentasTexto}>
                {mostrarConfigCuentas
                  ? 'Ocultar Configuracion de Cuentas'
                  : 'Configurar Cuentas de Cobro (Yape, Plin, Tarjeta)'}
              </Text>
            </TouchableOpacity>

            {/* Panel Desplegable de Configuracion de Cuentas Destino */}
            {mostrarConfigCuentas && (
              <View style={checkoutStyles.configCard}>
                <Text style={checkoutStyles.configTitulo}>Ajustes de Cuentas Receptoras</Text>
                <Text style={checkoutStyles.configSubtitulo}>
                  Configura a que numero o cuenta bancaria se dirigen los pagos de los estudiantes en clase:
                </Text>

                <View style={checkoutStyles.configSeccionGrupo}>
                  <Text style={checkoutStyles.configLabel}>Numero Celular Yape Destino:</Text>
                  <TextInput
                    style={checkoutStyles.configInput}
                    value={editYapeNumero}
                    onChangeText={setEditYapeNumero}
                    placeholder="960 952 665"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={checkoutStyles.configSeccionGrupo}>
                  <Text style={checkoutStyles.configLabel}>Titular de la Cuenta Yape:</Text>
                  <TextInput
                    style={checkoutStyles.configInput}
                    value={editYapeTitular}
                    onChangeText={setEditYapeTitular}
                    placeholder="Nombre del Titular Yape"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={checkoutStyles.configSeccionGrupo}>
                  <Text style={checkoutStyles.configLabel}>Numero Celular Plin Destino:</Text>
                  <TextInput
                    style={checkoutStyles.configInput}
                    value={editPlinNumero}
                    onChangeText={setEditPlinNumero}
                    placeholder="960 444 777"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={checkoutStyles.configSeccionGrupo}>
                  <Text style={checkoutStyles.configLabel}>Titular de la Cuenta Plin:</Text>
                  <TextInput
                    style={checkoutStyles.configInput}
                    value={editPlinTitular}
                    onChangeText={setEditPlinTitular}
                    placeholder="Nombre del Titular Plin"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={checkoutStyles.configSeccionGrupo}>
                  <Text style={checkoutStyles.configLabel}>Cuenta Corriente / Tarjeta de Abono:</Text>
                  <TextInput
                    style={checkoutStyles.configInput}
                    value={editTarjetaCuenta}
                    onChangeText={setEditTarjetaCuenta}
                    placeholder="193-9821049-0-44"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={checkoutStyles.configSeccionGrupo}>
                  <Text style={checkoutStyles.configLabel}>Codigo de Cuenta Interbancario (CCI):</Text>
                  <TextInput
                    style={checkoutStyles.configInput}
                    value={editCci}
                    onChangeText={setEditCci}
                    placeholder="002-193009821049044-12"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={checkoutStyles.configBotonesRow}>
                  <TouchableOpacity
                    style={checkoutStyles.botonGuardarConfig}
                    onPress={handleGuardarConfigCuentas}
                  >
                    <Text style={checkoutStyles.botonGuardarConfigTexto}>Guardar Cuentas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={checkoutStyles.botonResetConfig}
                    onPress={handleRestablecerConfigCuentas}
                  >
                    <Text style={checkoutStyles.botonResetConfigTexto}>Por Defecto</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Selector de Metodo de Pago (Tabs) */}
            <View style={checkoutStyles.tabsContainer}>
              <TouchableOpacity
                style={[
                  checkoutStyles.tabBoton,
                  metodo === 'yape' && checkoutStyles.tabBotonActivoYape,
                ]}
                onPress={() => setMetodo('yape')}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={16}
                  color={metodo === 'yape' ? '#FFFFFF' : Colors.textMuted}
                />
                <Text
                  style={[
                    checkoutStyles.tabTexto,
                    metodo === 'yape' && checkoutStyles.tabTextoActivo,
                  ]}
                >
                  Yape
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  checkoutStyles.tabBoton,
                  metodo === 'plin' && checkoutStyles.tabBotonActivoPlin,
                ]}
                onPress={() => setMetodo('plin')}
              >
                <Ionicons
                  name="flash-outline"
                  size={16}
                  color={metodo === 'plin' ? '#FFFFFF' : Colors.textMuted}
                />
                <Text
                  style={[
                    checkoutStyles.tabTexto,
                    metodo === 'plin' && checkoutStyles.tabTextoActivo,
                  ]}
                >
                  Plin
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  checkoutStyles.tabBoton,
                  metodo === 'tarjeta' && checkoutStyles.tabBotonActivoTarjeta,
                ]}
                onPress={() => setMetodo('tarjeta')}
              >
                <Ionicons
                  name="card-outline"
                  size={16}
                  color={metodo === 'tarjeta' ? '#FFFFFF' : Colors.textMuted}
                />
                <Text
                  style={[
                    checkoutStyles.tabTexto,
                    metodo === 'tarjeta' && checkoutStyles.tabTextoActivo,
                  ]}
                >
                  Tarjeta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Indicador de Metodo Activo */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor:
                  metodo === 'yape'
                    ? 'rgba(116, 34, 132, 0.15)'
                    : metodo === 'plin'
                    ? 'rgba(2, 132, 199, 0.15)'
                    : 'rgba(59, 130, 246, 0.15)',
                marginBottom: 14,
                borderWidth: 1,
                borderColor:
                  metodo === 'yape'
                    ? '#742284'
                    : metodo === 'plin'
                    ? '#0284C7'
                    : '#3B82F6',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color:
                    metodo === 'yape'
                      ? '#E9D5FF'
                      : metodo === 'plin'
                      ? '#7DD3FC'
                      : '#93C5FD',
                }}
              >
                Metodo Activo: {infoReceptor.nombreMetodo}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  color: Colors.secondary,
                }}
              >
                S/ {total.toFixed(2)}
              </Text>
            </View>

            {/* VISTA 1 & 2: YAPE Y PLIN */}
            {(metodo === 'yape' || metodo === 'plin') && (
              <View>
                {/* Seccion QR Dinamico */}
                <View style={checkoutStyles.seccionQR}>
                  <View style={checkoutStyles.qrWrapper}>
                    <Image source={{ uri: qrUrl }} style={checkoutStyles.qrImage} />
                    <View
                      style={[
                        checkoutStyles.qrTag,
                        metodo === 'yape'
                          ? checkoutStyles.qrTagYape
                          : checkoutStyles.qrTagPlin,
                      ]}
                    >
                      <Text style={checkoutStyles.qrTagTexto}>{infoReceptor.qrTag}</Text>
                    </View>
                  </View>
                </View>

                {/* Tarjeta de Cuenta y Boton Copiar */}
                <View style={checkoutStyles.infoCuentaCard}>
                  <View style={checkoutStyles.infoFila}>
                    <Text style={checkoutStyles.infoLabel}>Banco / Servicio:</Text>
                    <Text style={checkoutStyles.infoValor}>{infoReceptor.banco || infoReceptor.nombreMetodo}</Text>
                  </View>
                  <View style={checkoutStyles.infoFila}>
                    <Text style={checkoutStyles.infoLabel}>Titular de la Cuenta:</Text>
                    <Text style={checkoutStyles.infoValor}>{infoReceptor.titular}</Text>
                  </View>
                  <View style={checkoutStyles.numeroCopiarFila}>
                    <Text style={checkoutStyles.numeroTexto}>{infoReceptor.numero}</Text>
                    <TouchableOpacity
                      style={checkoutStyles.botonCopiar}
                      onPress={() => handleCopiarNumero(infoReceptor.numero)}
                    >
                      <Ionicons name="copy-outline" size={14} color={Colors.primary} />
                      <Text style={checkoutStyles.botonCopiarTexto}>Copiar</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Boton Didactico para Cargar Comprobante Demo */}
                <TouchableOpacity
                  style={[
                    checkoutStyles.botonDemoTarjeta,
                    {
                      borderColor: metodo === 'yape' ? 'rgba(116, 34, 132, 0.4)' : 'rgba(2, 132, 199, 0.4)',
                      backgroundColor: metodo === 'yape' ? 'rgba(116, 34, 132, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                    },
                  ]}
                  onPress={handleRellenarVoucherDemo}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={16}
                    color={metodo === 'yape' ? '#D8B4FE' : '#38BDF8'}
                  />
                  <Text
                    style={[
                      checkoutStyles.botonDemoTarjetaTexto,
                      { color: metodo === 'yape' ? '#E9D5FF' : '#7DD3FC' },
                    ]}
                  >
                    Rellenar Comprobante Demo (Prueba Rapida)
                  </Text>
                </TouchableOpacity>

                {/* Seccion de Carga de Comprobante (Voucher) */}
                <Text style={checkoutStyles.seccionTitulo}>
                  Adjuntar Comprobante de Pago
                </Text>

                <View style={checkoutStyles.voucherBox}>
                  {voucherUri ? (
                    <View style={checkoutStyles.voucherPreviewContainer}>
                      <Image
                        source={{ uri: voucherUri }}
                        style={checkoutStyles.voucherPreviewImage}
                      />
                      <TouchableOpacity
                        style={checkoutStyles.voucherBotonCambiar}
                        onPress={() => setVoucherUri(null)}
                      >
                        <Ionicons name="trash-outline" size={14} color={Colors.danger} />
                        <Text style={checkoutStyles.voucherBotonCambiarTexto}>
                          Quitar Foto
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons
                        name="image-outline"
                        size={36}
                        color={Colors.textMuted}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: Colors.textMuted,
                          marginTop: 6,
                          textAlign: 'center',
                        }}
                      >
                        Sube la captura de tu {metodo.toUpperCase()} o presiona "Rellenar Comprobante Demo"
                      </Text>
                      <View style={checkoutStyles.voucherBotonesRow}>
                        <TouchableOpacity
                          style={checkoutStyles.botonPicker}
                          onPress={handleSeleccionarGaleria}
                        >
                          <Ionicons name="images-outline" size={16} color={Colors.text} />
                          <Text style={checkoutStyles.botonPickerTexto}>Galeria</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={checkoutStyles.botonPicker}
                          onPress={handleTomarFoto}
                        >
                          <Ionicons name="camera-outline" size={16} color={Colors.text} />
                          <Text style={checkoutStyles.botonPickerTexto}>Camara</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                {/* Input Celular Emisor */}
                <View style={checkoutStyles.inputGrupo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={checkoutStyles.inputLabel}>
                      Tu Celular Emisor ({metodo === 'yape' ? 'Yape' : 'Plin'})
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: '700' }}>
                      {celularEmisor.replace(/\s/g, '').length}/9 digitos
                    </Text>
                  </View>
                  <TextInput
                    style={checkoutStyles.input}
                    placeholder="Ej: 984 512 603"
                    placeholderTextColor={Colors.textMuted}
                    value={celularEmisor}
                    onChangeText={(val) => setCelularEmisor(val.replace(/[^0-9]/g, '').slice(0, 9))}
                    keyboardType="phone-pad"
                    maxLength={9}
                  />
                </View>

                {/* Input Numero de Operacion */}
                <View style={checkoutStyles.inputGrupo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={checkoutStyles.inputLabel}>
                      Numero de Operacion Bancaria
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: '700' }}>
                      {numeroOperacion ? `${numeroOperacion.length} digitos` : 'Requerido'}
                    </Text>
                  </View>
                  <TextInput
                    style={checkoutStyles.input}
                    placeholder="Ej: 048291"
                    placeholderTextColor={Colors.textMuted}
                    value={numeroOperacion}
                    onChangeText={(val) => setNumeroOperacion(val.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>
            )}

            {/* VISTA 3: TARJETA BANCARIA */}
            {metodo === 'tarjeta' && (
              <View>
                {/* Datos de Abono y Cuenta de Destino */}
                <View style={checkoutStyles.bancoDestinoCard}>
                  <View style={checkoutStyles.bancoDestinoFila}>
                    <Text style={checkoutStyles.infoLabel}>Banco Receptor:</Text>
                    <Text style={checkoutStyles.infoValor}>{configCuentas.tarjetaBancoDestino}</Text>
                  </View>
                  <View style={checkoutStyles.bancoDestinoFila}>
                    <Text style={checkoutStyles.infoLabel}>Cuenta Corriente:</Text>
                    <Text style={checkoutStyles.infoValor}>{configCuentas.tarjetaCuentaDestino}</Text>
                  </View>
                  <View style={checkoutStyles.bancoDestinoFila}>
                    <Text style={checkoutStyles.infoLabel}>CCI Interbancario:</Text>
                    <Text style={checkoutStyles.infoValor}>{configCuentas.cciDestino}</Text>
                  </View>
                </View>

                {/* Previsualizacion Visual de Tarjeta de Credito / Debito */}
                <View style={checkoutStyles.tarjetaCard}>
                  <View style={checkoutStyles.tarjetaCabecera}>
                    <View style={checkoutStyles.tarjetaChip} />
                    <Text style={checkoutStyles.tarjetaMarcaTexto}>{tipoTarjeta}</Text>
                  </View>
                  <Text style={checkoutStyles.tarjetaNumeroTexto}>
                    {tarjetaNumero || '•••• •••• •••• ••••'}
                  </Text>
                  <View style={checkoutStyles.tarjetaPie}>
                    <Text style={checkoutStyles.tarjetaTitularTexto}>
                      {tarjetaTitular || 'TITULAR DE LA TARJETA'}
                    </Text>
                    <Text style={checkoutStyles.tarjetaExpiracionTexto}>
                      {tarjetaExpiracion || 'MM/AA'}
                    </Text>
                  </View>
                </View>

                {/* Boton de Autocompletado Rapido para Evaluacion en Clase */}
                <TouchableOpacity
                  style={checkoutStyles.botonDemoTarjeta}
                  onPress={handleRellenarTarjetaDemo}
                >
                  <Ionicons name="sparkles-outline" size={16} color="#60A5FA" />
                  <Text style={checkoutStyles.botonDemoTarjetaTexto}>
                    Rellenar Tarjeta Demo (Luhn Valido)
                  </Text>
                </TouchableOpacity>

                {/* Inputs del Formulario de Tarjeta */}
                <View style={checkoutStyles.inputGrupo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                    <Text style={checkoutStyles.inputLabel}>Numero de Tarjeta (16 digitos)</Text>
                    {validacionTarjetaLuhn ? (
                      validacionTarjetaLuhn.esValido ? (
                        <View style={checkoutStyles.badgeLuhnValido}>
                          <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                          <Text style={[checkoutStyles.badgeLuhnTexto, { color: '#10B981' }]}>
                            {tipoTarjeta} - Luhn Valido
                          </Text>
                        </View>
                      ) : (
                        <View style={checkoutStyles.badgeLuhnInvalido}>
                          <Ionicons name="alert-circle" size={12} color="#EF4444" />
                          <Text style={[checkoutStyles.badgeLuhnTexto, { color: '#EF4444' }]}>
                            Luhn Invalido
                          </Text>
                        </View>
                      )
                    ) : (
                      <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: '700' }}>
                        {tipoTarjeta} ({tarjetaNumero.replace(/\s/g, '').length}/16)
                      </Text>
                    )}
                  </View>
                  <TextInput
                    style={checkoutStyles.input}
                    placeholder="4242 4242 4242 4242"
                    placeholderTextColor={Colors.textMuted}
                    value={tarjetaNumero}
                    onChangeText={handleCambioTarjetaNumero}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </View>

                <View style={checkoutStyles.tarjetaInputsFila}>
                  <View style={[checkoutStyles.inputGrupo, { flex: 1 }]}>
                    <Text style={checkoutStyles.inputLabel}>Vencimiento</Text>
                    <TextInput
                      style={checkoutStyles.input}
                      placeholder="MM/AA"
                      placeholderTextColor={Colors.textMuted}
                      value={tarjetaExpiracion}
                      onChangeText={handleCambioExpiracion}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>

                  <View style={[checkoutStyles.inputGrupo, { flex: 1 }]}>
                    <Text style={checkoutStyles.inputLabel}>CVV</Text>
                    <TextInput
                      style={checkoutStyles.input}
                      placeholder="123"
                      placeholderTextColor={Colors.textMuted}
                      value={tarjetaCvv}
                      onChangeText={(t) => setTarjetaCvv(t.replace(/\D/g, '').slice(0, 4))}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                    />
                  </View>
                </View>

                <View style={checkoutStyles.inputGrupo}>
                  <Text style={checkoutStyles.inputLabel}>Nombre del Titular</Text>
                  <TextInput
                    style={checkoutStyles.input}
                    placeholder="Como figura en la tarjeta"
                    placeholderTextColor={Colors.textMuted}
                    value={tarjetaTitular}
                    onChangeText={setTarjetaTitular}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            )}

            {/* Boton Principal de Procesamiento */}
            <TouchableOpacity
              style={[
                checkoutStyles.botonProcesar,
                cargando && checkoutStyles.botonProcesarDeshabilitado,
              ]}
              onPress={handleProcesarPago}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                  <Text style={checkoutStyles.botonProcesarTexto}>
                    Confirmar Pago con {metodo === 'yape' ? 'Yape' : metodo === 'plin' ? 'Plin' : 'Tarjeta'} (S/ {total.toFixed(2)})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
