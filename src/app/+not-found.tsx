// src/app/+not-found.tsx
// Manejo elegante de rutas 404 (Lámina 21 de Módulo 04)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ruta no encontrada' }} />
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={80} color={Colors.danger} />
        <Text style={styles.codigo}>404</Text>
        <Text style={styles.titulo}>¡Oops! Esta pantalla no existe</Text>
        <Text style={styles.subtitulo}>
          El enlace que abriste no corresponde a ninguna ruta de Andes Mobile App.
        </Text>
        <Link href="/" style={styles.enlace}>
          <Text style={styles.enlaceTexto}>Volver al Catálogo Principal</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  codigo: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.text,
    marginTop: 12,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  enlace: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  enlaceTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
