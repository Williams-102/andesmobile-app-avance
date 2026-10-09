// src/app/(tabs)/carrito.tsx
// Pestana Carrito de Compras conectado a useCarritoController, CheckoutModal y BoletaModal (Modulos 05 al 09)

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useCarritoController } from '@/controllers/useCarritoController';
import { carritoStyles } from '@/styles/carrito.styles';
import { CheckoutModal, BoletaModal } from '@/components';

export default function CarritoScreen() {
  const {
    items,
    itemsBoleta,
    total,
    subtotal,
    igv,
    handleQuitarCurso,
    handleVaciarCarrito,
    handlePagar,
    handleIrAlCatalogo,
    isOffline,
    isCheckoutVisible,
    handleCerrarCheckout,
    handlePagoCompletado,
    boletaEmitida,
    isBoletaVisible,
    handleCerrarBoleta,
  } = useCarritoController();

  // Estado visual cuando el carrito esta vacio y no hay boleta recien emitida en pantalla
  if (items.length === 0 && !isBoletaVisible) {
    return (
      <View style={carritoStyles.vacioContainer}>
        <Ionicons name="cart-outline" size={72} color={Colors.textMuted} />
        <Text style={carritoStyles.tituloVacio}>Tu carrito esta vacio</Text>
        <Text style={carritoStyles.subtituloVacio}>
          Aun no has agregado ningun curso a tu lista de matricula. Explora nuestro catalogo y potencia tus habilidades.
        </Text>
        <TouchableOpacity
          style={carritoStyles.botonExplorar}
          onPress={handleIrAlCatalogo}
        >
          <Text style={carritoStyles.botonExplorarTexto}>Explorar Catalogo de Cursos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={carritoStyles.container}>
      <ScrollView contentContainerStyle={carritoStyles.content} showsVerticalScrollIndicator={false}>
        <View style={carritoStyles.headerFila}>
          <Text style={carritoStyles.encabezado}>Cursos Seleccionados ({items.length})</Text>
          <TouchableOpacity onPress={handleVaciarCarrito}>
            <Text style={carritoStyles.vaciarTexto}>Vaciar</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de cursos en el carrito */}
        {items.map((item) => (
          <View key={item.id} style={carritoStyles.itemCard}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={carritoStyles.itemTitulo}>{item.titulo}</Text>
              <Text style={carritoStyles.itemDocente}>Instructor: {item.instructor || 'Code Andes Academy'}</Text>
              <Text style={carritoStyles.itemPrecio}>S/ {item.precio.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={carritoStyles.botonQuitar}
              onPress={() => handleQuitarCurso(item.id, item.titulo)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={22} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Tarjeta de Resumen Economico */}
        <View style={carritoStyles.resumenCard}>
          <Text style={carritoStyles.resumenTitulo}>Resumen de Inversion</Text>
          <View style={carritoStyles.resumenFila}>
            <Text style={carritoStyles.resumenLabel}>Subtotal</Text>
            <Text style={carritoStyles.resumenValor}>S/ {subtotal.toFixed(2)}</Text>
          </View>
          <View style={carritoStyles.resumenFila}>
            <Text style={carritoStyles.resumenLabel}>IGV (18%)</Text>
            <Text style={carritoStyles.resumenValor}>S/ {igv.toFixed(2)}</Text>
          </View>
          <View style={[carritoStyles.resumenFila, carritoStyles.resumenTotalFila]}>
            <Text style={carritoStyles.resumenTotalLabel}>Total a Pagar</Text>
            <Text style={carritoStyles.resumenTotalValor}>S/ {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Boton de Checkout */}
        <TouchableOpacity style={carritoStyles.botonCheckout} onPress={handlePagar}>
          <Ionicons name="wallet-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={carritoStyles.botonCheckoutTexto}>Pagar con Yape / Plin / Tarjeta</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Checkout Interactivo (Modulo 09) */}
      <CheckoutModal
        visible={isCheckoutVisible}
        onClose={handleCerrarCheckout}
        items={itemsBoleta}
        total={total}
        subtotal={subtotal}
        igv={igv}
        isOffline={isOffline}
        onPagoCompletado={handlePagoCompletado}
      />

      {/* Modal de Boleta Electronica Digital con Desglose de IGV (Modulo 09) */}
      <BoletaModal
        visible={isBoletaVisible}
        boleta={boletaEmitida}
        onCerrar={handleCerrarBoleta}
      />
    </View>
  );
}
