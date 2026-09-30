// src/app/_layout.tsx
// Root Stack Layout con Proveedores de Estado Global Reactivo (Módulos 04 y 05)

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* 🌐 Nivel 1: Proveedor de Autenticación de Usuario */}
      <AuthProvider>
        {/* 🛒 Nivel 2: Proveedor de Carrito de Compras */}
        <CartProvider>
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
