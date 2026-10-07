// src/app/(auth)/welcome.tsx
// Pantalla de Bienvenida y Onboarding institucional (Módulo 05)

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authStyles } from '@/styles/auth.styles';
import { useAuthController } from '@/controllers/useAuthController';

export default function WelcomeScreen() {
  const { handleIrALogin, handleIrARegistro, handleContinuarComoInvitado } = useAuthController();

  return (
    <SafeAreaView style={authStyles.welcomeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#070D18" />

      <ScrollView contentContainerStyle={authStyles.welcomeContent} showsVerticalScrollIndicator={false}>
        {/* Sección Hero Superior */}
        <View style={authStyles.welcomeHero}>
          <View style={authStyles.welcomeLogoBadge}>
            <Ionicons name="school" size={44} color="#00B4D8" />
          </View>

          <Text style={authStyles.welcomeTitle}>
            Aprende a Crear Apps con <Text style={authStyles.welcomeHighlight}>React Native & Expo</Text>
          </Text>

          <Text style={authStyles.welcomeDesc}>
            Formación especializada de alto nivel con arquitecturas escalables, TypeScript estricto y respaldo del Colegio de Ingenieros del Perú.
          </Text>
        </View>

        {/* Grupo de Botones de Acción */}
        <View style={authStyles.welcomeActions}>
          <TouchableOpacity
            style={authStyles.btnPrimary}
            activeOpacity={0.85}
            onPress={handleIrALogin}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={authStyles.btnPrimaryText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={authStyles.btnSecondary}
            activeOpacity={0.8}
            onPress={handleIrARegistro}
          >
            <Text style={authStyles.btnSecondaryText}>Crear Cuenta Nueva</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={authStyles.btnGuest}
            activeOpacity={0.7}
            onPress={handleContinuarComoInvitado}
          >
            <Text style={authStyles.btnGuestText}>Explorar catálogo como invitado →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
