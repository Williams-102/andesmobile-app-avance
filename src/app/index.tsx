// src/app/index.tsx
// Pantalla de Splash Screen animada (Módulo 05)
// Carga inicial del ecosistema móvil y bifurcación según estado de sesión

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { splashStyles } from '@/styles/splash.styles';

export default function SplashScreen() {
  const router = useRouter();
  const { estaAutenticado } = useAuth();

  useEffect(() => {
    // Simulación de carga del entorno, fuentes y caché (1.8 segundos)
    const timer = setTimeout(() => {
      if (estaAutenticado) {
        router.replace('/(tabs)/catalogo');
      } else {
        router.replace('/(auth)/welcome');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [estaAutenticado, router]);

  return (
    <View style={splashStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06152B" />

      {/* Emblema corporativo oficial */}
      <View style={splashStyles.logoCard}>
        <Ionicons name="layers" size={54} color="#00B4D8" />
      </View>

      <Text style={splashStyles.brandTitle}>CODE ANDES</Text>
      <Text style={splashStyles.brandSubtitle}>ACADEMY &bull; MÓVIL 2026</Text>

      {/* Indicador de carga nativo */}
      <View style={splashStyles.loaderGroup}>
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text style={splashStyles.loadingText}>Iniciando entorno reactivo...</Text>
      </View>

      {/* Pie institucional */}
      <View style={splashStyles.footer}>
        <Text style={splashStyles.footerText}>Andes Mobile App &bull; Versión 1.0.0</Text>
      </View>
    </View>
  );
}
