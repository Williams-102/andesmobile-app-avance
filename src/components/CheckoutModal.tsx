// src/components/CheckoutModal.tsx
// Modal de Checkout interactivo con Yape, Plin, Tarjeta Bancaria, QR Dinamico y subida de Vouchers (Modulo 09)

import React, { useState, useMemo } from 'react';
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

type MetodoPagoTipo = 'yape' | 'plin' | 'tarjeta';

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

  // Estados del modal
  const [metodo, setMetodo] = useState<MetodoPagoTipo>('yape');
  const [cargando, setCargando] = useState<boolean>(false);

  // Estados para Yape y Plin
  const [voucherUri, setVoucherUri] = useState<string | null>(null);
  const [numeroOperacion, setNumeroOperacion] = useState<string>('');

  // Estados para Tarjeta Bancaria
  const [tarjetaNumero, setTarjetaNumero] = useState<string>('');
  const [tarjetaExpiracion, setTarjetaExpiracion] = useState<string>('');
  const [tarjetaCvv, setTarjetaCvv] = useState<string>('');
  const [tarjetaTitular, setTarjetaTitular] = useState<string>('');

  // Informacion del receptor segun metodo
  const infoReceptor = useMemo(() => {
    if (metodo === 'yape') {
      return {
        numero: '960 952 665',
        titular: 'Anahi Torre (Code Andes)',
        qrTag: 'QR OFICIAL YAPE',
      };
    }
    if (metodo === 'plin') {
      return {
        numero: '960 444 777',
        titular: 'Code Andes Academy',
        qrTag: 'QR OFICIAL PLIN',
      };
    }
    return null;
  }, [metodo]);

  // URL del QR Dinamico generado
  const qrUrl = useMemo(() => {
    const dataQr = `PAGO_${metodo.toUpperCase()}_MONTO_${total.toFixed(2)}_ORDEN_${Date.now()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(dataQr)}`;
  }, [metodo, total]);

  // Detector de franquicia de tarjeta
  const tipoTarjeta = useMemo(() => {
    const cleaned = tarjetaNumero.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'VISA';
    if (cleaned.startsWith('5')) return 'MASTERCARD';
    if (cleaned.startsWith('3')) return 'AMEX';
    return 'TARJETA';
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVoucherUri(result.assets[0].uri);
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
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVoucherUri(result.assets[0].uri);
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

  // Boton para rellenar tarjeta demo de prueba durante la clase
  const handleRellenarTarjetaDemo = () => {
    setTarjetaNumero('4557 8821 9012 3456');
    setTarjetaExpiracion('12/28');
    setTarjetaCvv('842');
    setTarjetaTitular('ESTUDIANTE ANDES');
    showToast({
      type: 'info',
      title: 'Datos Demo Cargados',
      message: 'Tarjeta Visa de pruebas precargada para evaluacion rapida.',
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

  // Validacion de campos antes de procesar
  const formularioValido = useMemo(() => {
    if (metodo === 'yape' || metodo === 'plin') {
      return voucherUri !== null && numeroOperacion.trim().length >= 6;
    }
    if (metodo === 'tarjeta') {
      const limpia = tarjetaNumero.replace(/\s/g, '');
      return (
        limpia.length === 16 &&
        tarjetaExpiracion.length === 5 &&
        tarjetaCvv.length >= 3 &&
        tarjetaTitular.trim().length >= 3
      );
    }
    return false;
  }, [metodo, voucherUri, numeroOperacion, tarjetaNumero, tarjetaExpiracion, tarjetaCvv, tarjetaTitular]);

  // Procesamiento del pago
  const handleProcesarPago = async () => {
    if (!formularioValido) {
      showToast({
        type: 'warning',
        title: 'Datos Incompletos',
        message:
          metodo === 'tarjeta'
            ? 'Completa los 16 digitos de la tarjeta, expiracion y CVV.'
            : 'Debes adjuntar la foto del comprobante e ingresar el numero de operacion.',
      });
      return;
    }

    setCargando(true);

    try {
      let urlVoucherFinal: string | undefined = undefined;

      // 1. Si es Yape o Plin, subir voucher a Supabase Storage
      if ((metodo === 'yape' || metodo === 'plin') && voucherUri) {
        const subida = await VouchersSupabaseService.subirComprobante(voucherUri, metodo);
        urlVoucherFinal = subida.url;
      }

      const randomCorrelativo = Math.floor(1000 + Math.random() * 9000);
      const idMatricula = `BOL-2026-${randomCorrelativo}`;
      const serieMatricula = `B001-${String(randomCorrelativo).padStart(6, '0')}`;

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

      // 2. Si estamos en modo Offline First: Encolar en SyncEngine
      if (isOffline) {
        const ticketId = await SyncEngine.encolar({
          tipo: 'INSCRIPCION_CURSO',
          payload: {
            items,
            total,
            metodoPago: metodoTexto,
            numeroOperacion: numeroOperacion.trim() || undefined,
            voucherUrl: urlVoucherFinal,
            fecha: new Date().toISOString(),
          },
        });

        // Registrar boleta local
        const boletaOffline = await BoletasService.registrarBoleta({
          id: idMatricula,
          serie: serieMatricula,
          cursos: items,
          total,
          subtotal,
          igv,
          metodoPago: metodoTexto,
          numeroOperacion: numeroOperacion.trim() || undefined,
          voucherUrl: urlVoucherFinal,
          ultimosDigitosTarjeta: ultimosDigitos,
          estado: 'SINCRONIZADO_OFFLINE',
          ticketOfflineId: ticketId,
        });

        setCargando(false);
        onClose();
        onPagoCompletado(boletaOffline);

        showToast({
          type: 'success',
          title: 'Matricula Guardada Offline',
          message: `Ticket: ${ticketId}. Tu matricula y boleta se sincronizaran con Supabase al recuperar la red.`,
          duration: 4500,
        });
        return;
      }

      // 3. Flujo Online: Registrar en Supabase PostgreSQL
      const matriculaPayload = {
        id: idMatricula,
        usuario_id: null,
        total,
        subtotal,
        igv,
        metodo_pago: metodoTexto,
        numero_operacion: numeroOperacion.trim() || null,
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

      // 4. Registrar boleta en almacenamiento local
      const boletaOnline = await BoletasService.registrarBoleta({
        id: idMatricula,
        serie: serieMatricula,
        cursos: items,
        total,
        subtotal,
        igv,
        metodoPago: metodoTexto,
        numeroOperacion: numeroOperacion.trim() || undefined,
        voucherUrl: urlVoucherFinal,
        ultimosDigitosTarjeta: ultimosDigitos,
        estado: 'COMPLETADO_ONLINE',
      });

      setCargando(false);
      onClose();
      onPagoCompletado(boletaOnline);

      showToast({
        type: 'success',
        title: 'Pago Confirmado',
        message: `Boleta ${serieMatricula} emitida con exito. Tus cursos han sido activados.`,
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

            {/* VISTA 1 & 2: YAPE Y PLIN */}
            {(metodo === 'yape' || metodo === 'plin') && infoReceptor && (
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
                        Sube la captura de pantalla de tu {metodo.toUpperCase()} para validar la matricula
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

                {/* Input Numero de Operacion */}
                <View style={checkoutStyles.inputGrupo}>
                  <Text style={checkoutStyles.inputLabel}>
                    Numero de Operacion Bancaria (Min. 6 digitos)
                  </Text>
                  <TextInput
                    style={checkoutStyles.input}
                    placeholder="Ej: 048291"
                    placeholderTextColor={Colors.textMuted}
                    value={numeroOperacion}
                    onChangeText={setNumeroOperacion}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </View>
            )}

            {/* VISTA 3: TARJETA BANCARIA */}
            {metodo === 'tarjeta' && (
              <View>
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
                    Rellenar Tarjeta Demo de Prueba
                  </Text>
                </TouchableOpacity>

                {/* Inputs del Formulario de Tarjeta */}
                <View style={checkoutStyles.inputGrupo}>
                  <Text style={checkoutStyles.inputLabel}>Numero de Tarjeta (16 digitos)</Text>
                  <TextInput
                    style={checkoutStyles.input}
                    placeholder="4557 0000 0000 0000"
                    placeholderTextColor={Colors.textMuted}
                    value={tarjetaNumero}
                    onChangeText={handleCambioTarjetaNumero}
                    keyboardType="numeric"
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
                      keyboardType="numeric"
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
                      keyboardType="numeric"
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
                (!formularioValido || cargando) && checkoutStyles.botonProcesarDeshabilitado,
              ]}
              onPress={handleProcesarPago}
              disabled={!formularioValido || cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                  <Text style={checkoutStyles.botonProcesarTexto}>
                    Confirmar Pago y Emitir Boleta (S/ {total.toFixed(2)})
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
