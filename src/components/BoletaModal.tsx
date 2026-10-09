// src/components/BoletaModal.tsx
// Modal de visualizacion de Boleta Electronica Digital con desglose formal de IGV (Modulo 09)

import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Boleta } from '../types/boleta';
import { boletaStyles } from '../styles/boleta.styles';
import { useNotification } from '../context/NotificationContext';

interface BoletaModalProps {
  visible: boolean;
  boleta: Boleta | null;
  onCerrar: () => void;
}

export const BoletaModal: React.FC<BoletaModalProps> = ({
  visible,
  boleta,
  onCerrar,
}) => {
  const { showToast } = useNotification();

  if (!boleta) return null;

  const handleCompartir = async () => {
    try {
      const mensaje = `Code Andes Academy - Boleta ${boleta.serie}\nTotal: S/ ${boleta.total.toFixed(2)}\nMetodo: ${boleta.metodoPago}\nFecha: ${new Date(boleta.fecha).toLocaleString()}`;
      await Share.share({
        message: mensaje,
        title: `Boleta ${boleta.serie}`,
      });
    } catch (error) {
      showToast({
        type: 'info',
        title: 'Boleta Guardada',
        message: 'Tu comprobante esta registrado en el historial de tu perfil.',
      });
    }
  };

  const fechaFormateada = new Date(boleta.fecha).toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <View style={boletaStyles.modalOverlay}>
        <View style={boletaStyles.modalContainer}>
          <ScrollView
            contentContainerStyle={boletaStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Cuadro de RUC y Serie Legal */}
            <View style={boletaStyles.rucBox}>
              <Text style={boletaStyles.rucTexto}>R.U.C. {boleta.rucEmisor}</Text>
              <Text style={boletaStyles.boletaTipoTexto}>BOLETA DE VENTA ELECTRONICA</Text>
              <Text style={boletaStyles.serieTexto}>N° {boleta.serie}</Text>
            </View>

            {/* Cabecera Institucional */}
            <View style={boletaStyles.empresaHeader}>
              <Text style={boletaStyles.empresaNombre}>{boleta.razonSocialEmisor}</Text>
              <Text style={boletaStyles.empresaSubtitulo}>
                Especializacion en Desarrollo de Aplicaciones Moviles 2026
              </Text>
              <Text style={boletaStyles.empresaDireccion}>
                Av. Los Precursores 1040, Santiago de Surco, Lima - Peru
              </Text>
            </View>

            {/* Datos del Cliente y Emision */}
            <View style={boletaStyles.datosClienteCard}>
              <View style={boletaStyles.datoFila}>
                <Text style={boletaStyles.datoLabel}>Fecha de Emision:</Text>
                <Text style={boletaStyles.datoValor}>{fechaFormateada}</Text>
              </View>
              <View style={boletaStyles.datoFila}>
                <Text style={boletaStyles.datoLabel}>Cliente:</Text>
                <Text style={boletaStyles.datoValor}>
                  {boleta.clienteNombre || 'Estudiante Code Andes'}
                </Text>
              </View>
              {boleta.clienteEmail ? (
                <View style={boletaStyles.datoFila}>
                  <Text style={boletaStyles.datoLabel}>Correo:</Text>
                  <Text style={boletaStyles.datoValor}>{boleta.clienteEmail}</Text>
                </View>
              ) : null}
              <View style={boletaStyles.datoFila}>
                <Text style={boletaStyles.datoLabel}>Moneda:</Text>
                <Text style={boletaStyles.datoValor}>Soles (PEN)</Text>
              </View>
            </View>

            {/* Encabezado de Items */}
            <View style={boletaStyles.tablaItemsHeader}>
              <Text style={boletaStyles.colDescripcionHeader}>Descripcion del Curso</Text>
              <Text style={boletaStyles.colPrecioHeader}>Importe</Text>
            </View>

            {/* Lista de Cursos */}
            {boleta.cursos.map((curso, idx) => (
              <View key={`${curso.id}-${idx}`} style={boletaStyles.itemFila}>
                <Text style={boletaStyles.itemDescripcion}>{curso.titulo}</Text>
                <Text style={boletaStyles.itemPrecio}>S/ {curso.precio.toFixed(2)}</Text>
              </View>
            ))}

            {/* Desglose Tributario de Totales */}
            <View style={boletaStyles.totalesContainer}>
              <View style={boletaStyles.totalFila}>
                <Text style={boletaStyles.totalLabel}>Operaciones Gravadas (Subtotal):</Text>
                <Text style={boletaStyles.totalValor}>S/ {boleta.subtotal.toFixed(2)}</Text>
              </View>
              <View style={boletaStyles.totalFila}>
                <Text style={boletaStyles.totalLabel}>I.G.V. (18.00%):</Text>
                <Text style={boletaStyles.totalValor}>S/ {boleta.igv.toFixed(2)}</Text>
              </View>
              <View style={[boletaStyles.totalFila, boletaStyles.totalFinalFila]}>
                <Text style={boletaStyles.totalFinalLabel}>Importe Total a Pagar:</Text>
                <Text style={boletaStyles.totalFinalValor}>S/ {boleta.total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Detalle de Pago Realizado */}
            <View style={boletaStyles.pagoDetalleCard}>
              <Text style={boletaStyles.pagoDetalleTexto}>
                <Text style={{ fontWeight: '700' }}>Forma de Pago: </Text>
                {boleta.metodoPago}
              </Text>
              {boleta.numeroOperacion ? (
                <Text style={boletaStyles.pagoDetalleTexto}>
                  <Text style={{ fontWeight: '700' }}>N° de Operacion: </Text>
                  {boleta.numeroOperacion}
                </Text>
              ) : null}
              {boleta.ultimosDigitosTarjeta ? (
                <Text style={boletaStyles.pagoDetalleTexto}>
                  <Text style={{ fontWeight: '700' }}>Tarjeta: </Text>
                  •••• •••• •••• {boleta.ultimosDigitosTarjeta}
                </Text>
              ) : null}
              <Text style={boletaStyles.pagoDetalleTexto}>
                <Text style={{ fontWeight: '700' }}>Estado de Emision: </Text>
                {boleta.estado === 'COMPLETADO_ONLINE' ? 'Emitido y Sincronizado Online' : 'Asegurado en Cola Local'}
              </Text>
            </View>

            {/* Botones de Accion */}
            <View style={boletaStyles.botonesAccion}>
              <TouchableOpacity
                style={boletaStyles.botonSecundario}
                onPress={handleCompartir}
              >
                <Text style={boletaStyles.botonSecundarioTexto}>Compartir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={boletaStyles.botonPrimario}
                onPress={onCerrar}
              >
                <Text style={boletaStyles.botonPrimarioTexto}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
