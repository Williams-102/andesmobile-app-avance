// src/app/curso/[id].tsx
// Pantalla de Detalle Dinámico de Curso conectada a useCursoDetalleController y cursoDetalleStyles (Clean Architecture)

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCursoDetalleController } from '@/controllers/useCursoDetalleController';
import { cursoDetalleStyles } from '@/styles/cursoDetalle.styles';

export default function DetalleCursoScreen() {
  const {
    id,
    titulo,
    precio,
    instructor,
    cursoEncontrado,
    yaEnCarrito,
    handleAgregarAlCarrito,
    handleRegresar,
    handleCompartir,
  } = useCursoDetalleController();

  return (
    <>
      {/* Configuración dinámica de la barra de navegación del Stack */}
      <Stack.Screen
        options={{
          title: titulo ? `Curso: ${titulo.slice(0, 22)}...` : 'Detalle del Curso',
          headerRight: () => (
            <TouchableOpacity onPress={handleCompartir} style={{ padding: 6 }}>
              <Ionicons name="share-social-outline" size={22} color="#38BDF8" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={cursoDetalleStyles.container} showsVerticalScrollIndicator={false}>
        {/* Banner de la imagen de portada */}
        {cursoEncontrado?.imagenUrl && (
          <Image source={{ uri: cursoEncontrado.imagenUrl }} style={cursoDetalleStyles.banner} />
        )}

        {/* Insignia con el ID y nivel */}
        <View style={cursoDetalleStyles.badge}>
          <Text style={cursoDetalleStyles.badgeText}>ID: #{id} · {cursoEncontrado?.nivel || 'Especialización'}</Text>
        </View>

        {/* Título grande del curso */}
        <Text style={cursoDetalleStyles.titulo}>{titulo}</Text>
        <Text style={cursoDetalleStyles.instructor}>Dictado por: {instructor}</Text>

        {/* Caja de Inversión destacada */}
        <View style={cursoDetalleStyles.precioCaja}>
          <Text style={cursoDetalleStyles.precioEtiqueta}>Inversión al Contado</Text>
          <Text style={cursoDetalleStyles.precioValor}>S/ {precio}</Text>
          <Text style={cursoDetalleStyles.precioSub}>Incluye IGV y emisión de certificado oficial CIP</Text>
        </View>

        {/* Descripción del curso */}
        <Text style={cursoDetalleStyles.seccionTitulo}>Descripción del Módulo</Text>
        <Text style={cursoDetalleStyles.descripcion}>
          {cursoEncontrado?.descripcion ||
            'Este módulo forma parte del programa integral de especialización móvil. Aprenderás a trabajar con estándares de la industria, arquitecturas escalables y despliegue continuo.'}
        </Text>

        {/* Requisitos previos */}
        <Text style={cursoDetalleStyles.seccionTitulo}>Requisitos Previos</Text>
        {(cursoEncontrado?.requisitos || [
          'Fundamentos de JavaScript / TypeScript',
          'Computadora con Node.js instalado',
          'Smartphone para pruebas en tiempo real con Expo Go',
        ]).map((req, index) => (
          <View key={index} style={cursoDetalleStyles.reqFila}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={cursoDetalleStyles.reqTexto}>{req}</Text>
          </View>
        ))}

        {/* Respaldo institucional CIP */}
        <View style={cursoDetalleStyles.cipCard}>
          <Ionicons name="ribbon-outline" size={24} color="#38BDF8" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={cursoDetalleStyles.cipTitle}>Certificación Universitaria & CIP</Text>
            <Text style={cursoDetalleStyles.cipSub}>Válido para concursos públicos y privados del Colegio de Ingenieros del Perú.</Text>
          </View>
        </View>

        {/* Botón principal conectado al Estado Global */}
        <TouchableOpacity
          style={[cursoDetalleStyles.botonComprar, yaEnCarrito && cursoDetalleStyles.botonEnCarrito]}
          activeOpacity={0.85}
          onPress={handleAgregarAlCarrito}
        >
          <Ionicons
            name={yaEnCarrito ? 'checkmark-circle-outline' : 'cart-outline'}
            size={22}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={cursoDetalleStyles.botonComprarTexto}>
            {yaEnCarrito ? 'En el Carrito (Ver)' : 'Inscribirme / Agregar al Carrito'}
          </Text>
        </TouchableOpacity>

        {/* Botón para regresar con router.back() */}
        <TouchableOpacity
          style={cursoDetalleStyles.botonVolver}
          activeOpacity={0.7}
          onPress={handleRegresar}
        >
          <Text style={cursoDetalleStyles.botonVolverTexto}>← Regresar al catálogo</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}
