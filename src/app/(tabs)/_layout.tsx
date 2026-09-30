// src/app/(tabs)/_layout.tsx
// Pestañas inferiores nativas (Bottom Navigation Bar) con Badge Dinámico reactivo y Safe Area Insets (Módulo 05)

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';

export default function TabsLayout() {
  // 🛒 Consumo del estado global para actualizar el badge en tiempo real
  const { cantidadTotal } = useCart();
  
  // 🛡️ Safe Area Insets para evitar que los botones del sistema Android (cuadrado, círculo, triángulo) tapen la barra
  const insets = useSafeAreaInsets();

  const extraBottomPadding = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 8 : 0);
  const tabHeight = Platform.OS === 'ios' ? 88 : 64 + extraBottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#38BDF8', // Celeste vibrante de alto contraste
        tabBarInactiveTintColor: '#94A3B8', // Gris claro legible
        headerStyle: {
          backgroundColor: '#18181B',
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#FFFFFF',
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#121214',
          borderTopColor: '#27272A',
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: Platform.OS === 'ios' ? 26 : Math.max(extraBottomPadding, 8),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* 1. Pestaña: Cursos / Catálogo */}
      <Tabs.Screen
        name="catalogo"
        options={{
          headerShown: false,
          title: 'Catálogo',
          tabBarLabel: 'Cursos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'school' : 'school-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Pestaña: Explorar */}
      <Tabs.Screen
        name="explore"
        options={{
          headerShown: false,
          title: 'Explorar',
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Pestaña: Carrito con Badge Dinámico Reactivo (Módulo 05) */}
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Mi Carrito',
          tabBarLabel: 'Carrito',
          tabBarBadge: cantidadTotal > 0 ? cantidadTotal : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Pestaña: Mi Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Mi Cuenta',
          tabBarLabel: 'Mi Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
