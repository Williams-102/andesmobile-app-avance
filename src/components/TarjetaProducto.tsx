// src/components/TarjetaProducto.tsx
// Componente de Tarjeta de Curso optimizado con React.memo, useCallback y profiling.
// Modulo 10: Optimizacion, Ciberseguridad Movil y Pruebas en Hardware Real.
// Code Andes Academy - Docente: Ing. Exar Williams Atao Paucar (CIP Reg. 304921)
// CERO EMOJIS O EMOTICONES.

import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Curso } from '../types/curso';
import { getTarjetaProductoStyles } from '@/styles/tarjetaProducto.styles';
import { usePerformanceProfiler } from '../hooks/usePerformanceProfiler';

interface TarjetaProductoProps {
  curso: Curso;
  isDarkMode?: boolean;
}

const TarjetaProductoComponent: React.FC<TarjetaProductoProps> = ({
  curso,
  isDarkMode = true,
}) => {
  // Telemetria de profiling en tiempo real
  usePerformanceProfiler('TarjetaProducto');

  const router = useRouter();

  // Optimizacion 1: Memorizar los estilos para evitar recomputaciones innecesarias
  const styles = useMemo(() => getTarjetaProductoStyles(isDarkMode), [isDarkMode]);

  // Optimizacion 2: Memorizar la funcion de navegacion para mantener referencia estable
  const handlePressDetalle = useCallback(() => {
    router.push({
      pathname: '/curso/[id]',
      params: {
        id: curso.id,
        titulo: curso.titulo,
        precio: curso.inversion.toFixed(2),
        instructor: curso.docente,
      },
    });
  }, [router, curso.id, curso.titulo, curso.inversion, curso.docente]);

  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePressDetalle}>
        <Image
          source={{ uri: curso.imagenUrl }}
          style={styles.imagen}
          resizeMode="cover"
        />
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
          <Text style={styles.titulo} numberOfLines={2}>{curso.titulo}</Text>
        </TouchableOpacity>
        <Text style={styles.docente}>{curso.docente}</Text>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.inversionLabel}>Inversion</Text>
            <Text style={styles.precio}>S/ {curso.inversion.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.botonDetalle}
            activeOpacity={0.8}
            onPress={handlePressDetalle}
          >
            <Text style={styles.botonTexto}>Ver Detalle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Optimizacion 3: Comparador estricto con React.memo para evitar re-renderizados si el curso no cambio
export const TarjetaProducto = React.memo(
  TarjetaProductoComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.isDarkMode === nextProps.isDarkMode &&
      prevProps.curso.id === nextProps.curso.id &&
      prevProps.curso.inversion === nextProps.curso.inversion &&
      prevProps.curso.titulo === nextProps.curso.titulo &&
      prevProps.curso.imagenUrl === nextProps.curso.imagenUrl
    );
  }
);
