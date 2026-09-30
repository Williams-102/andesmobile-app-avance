// src/app/(auth)/_layout.tsx
// Stack Layout para pantallas de Autenticación y Bienvenida (Módulo 05)

import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#070D18',
        },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
    </Stack>
  );
}
