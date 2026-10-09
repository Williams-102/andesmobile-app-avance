// src/components/TarjetaProducto.tsx
// Componente de Tarjeta de Curso con estilos desacoplados (Clean Architecture)

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Curso } from '../types/curso';
import { getTarjetaProductoStyles } from '@/styles/tarjetaProducto.styles';

interface TarjetaProductoProps {
  curso: Curso;
  isDarkMode?: boolean;
}

export const TarjetaProducto: React.FC<TarjetaProductoProps> = ({
  curso,
  isDarkMode = true,
}) => {
  const router = useRouter();
  const styles = getTarjetaProductoStyles(isDarkMode);

  const handlePressDetalle = () => {
    // Navegación imperativa hacia la ruta dinámica de Módulo 04: /curso/[id]
    router.push({
      pathname: '/curso/[id]',
      params: {
        id: curso.id,
        titulo: curso.titulo,
        precio: curso.inversion.toFixed(2),
        instructor: curso.docente,
      },
    });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePressDetalle}>
        <Image source={{ uri: curso.imagenUrl }} style={styles.imagen} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{curso.nivel}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {curso.rating} · {curso.duracion}
            </Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={handlePressDetalle}>
          <Text style={styles.titulo}>{curso.titulo}</Text>
        </TouchableOpacity>
        <Text style={styles.docente}>{curso.docente}</Text>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.inversionLabel}>Inversión</Text>
            <Text style={styles.precio}>S/ {curso.inversion.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.botonDetalle}
            activeOpacity={0.8}
            onPress={handlePressDetalle}
          >
            <Text style={styles.botonTexto}>Ver Detalle →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
