import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { SyncEngine } from '../services/SyncEngine';

/**
 * Componente centinela para auto-sincronizar transacciones encoladas en FIFO
 * tan pronto como el dispositivo recupera la conexión a internet
 */
function SyncSentinel() {
  const { isConnected } = useNetworkStatus();

  useEffect(() => {
    if (isConnected) {
      SyncEngine.procesarCola().then(({ procesados }) => {
        if (procesados > 0) {
          console.log(`[SyncSentinel] ⚡ ${procesados} transacciones offline sincronizadas.`);
          Alert.alert(
            '¡Sincronización Exitosa! 🌐🎉',
            `Se ${
              procesados === 1
                ? 'ha validado y sincronizado con éxito 1 matrícula'
                : `han validado y sincronizado con éxito ${procesados} matrículas`
            } que realizaste mientras estabas en modo offline.\n\nTus cursos ya están registrados en el sistema.`
          );
        }
      });
    }
  }, [isConnected]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* 🌐 Nivel 1: Proveedor de Autenticación de Usuario con AsyncStorage */}
      <AuthProvider>
        {/* 🛒 Nivel 2: Proveedor de Carrito de Compras con AsyncStorage */}
        <CartProvider>
          {/* 📡 Centinela de sincronización automática de cola FIFO */}
          <SyncSentinel />

          {/* ⚠️ Banner visual flotante en modo Offline */}
          <OfflineBanner />

          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.surface,
              },
              headerTintColor: '#38BDF8',
              headerTitleStyle: {
                fontWeight: 'bold',
                color: Colors.text,
              },
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: Colors.background,
              },
            }}
          >
            {/* 0. Pantalla de Splash Screen inicial */}
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />

            {/* 1. Flujo de Autenticación & Onboarding (Welcome, Login, Registro) */}
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />

            {/* 2. Grupo de pestañas principales */}
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />

            {/* 2. Pantallas de detalle de producto/curso con navegación Stack */}
            <Stack.Screen
              name="producto/[id]"
              options={{
                title: 'Detalle de Producto',
                headerBackTitle: 'Atrás',
                animation: 'slide_from_right',
              }}
            />

            <Stack.Screen
              name="curso/[id]"
              options={{
                title: 'Detalle del Curso',
                headerBackTitle: 'Atrás',
                animation: 'slide_from_right',
              }}
            />

            {/* 3. Pantalla de error 404 */}
            <Stack.Screen
              name="+not-found"
              options={{
                title: 'Página no encontrada',
                presentation: 'modal',
              }}
            />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
