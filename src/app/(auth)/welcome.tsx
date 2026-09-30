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

          <View style={authStyles.tagPill}>
            <Text style={authStyles.tagPillText}>Campus Móvil 2026</Text>
          </View>

          <Text style={authStyles.welcomeTitle}>
            Aprende a Crear Apps con <Text style={authStyles.welcomeHighlight}>React Native & Expo</Text>
          </Text>

          <Text style={authStyles.welcomeDesc}>
            Formación especializada de alto nivel con arquitecturas escalables, TypeScript estricto y respaldo del Colegio de Ingenieros del Perú.
          </Text>

          {/* Tarjeta de Características Clave */}
          <View style={authStyles.featureBox}>
            <View style={authStyles.featureRow}>
              <View style={authStyles.featureIconBox}>
                <Ionicons name="code-slash" size={18} color="#38BDF8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={authStyles.featureTextTitle}>Enfoque 100% Práctico</Text>
                <Text style={authStyles.featureTextSub}>Proyectos reales con código limpio e industria.</Text>
              </View>
            </View>

            <View style={authStyles.featureRow}>
              <View style={[authStyles.featureIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Ionicons name="ribbon" size={18} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={authStyles.featureTextTitle}>Certificación CIP</Text>
                <Text style={authStyles.featureTextSub}>Validez curricular por 120 horas académicas.</Text>
              </View>
            </View>

            <View style={authStyles.featureRow}>
              <View style={[authStyles.featureIconBox, { backgroundColor: 'rgba(255, 107, 0, 0.2)' }]}>
                <Ionicons name="cloud-done" size={18} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={authStyles.featureTextTitle}>Cloud & Supabase</Text>
                <Text style={authStyles.featureTextSub}>Bases de datos en tiempo real y pasarelas de pago.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Grupo de Botones de Acción */}
        <View style={authStyles.welcomeActions}>
          <TouchableOpacity
            style={authStyles.btnPrimary}
            activeOpacity={0.85}
            onPress={handleIrALogin}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={authStyles.btnPrimaryText}>Iniciar Sesión de Alumno</Text>
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
