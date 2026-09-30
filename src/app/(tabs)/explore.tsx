// src/app/(tabs)/explore.tsx
// Pestaña Explorar Especializaciones con estilos desacoplados (Clean Architecture)

import React from 'react';
import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { exploreStyles } from '@/styles/explore.styles';

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={exploreStyles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={exploreStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={exploreStyles.title}>Explorar Rutas</Text>
        <Text style={exploreStyles.subtitle}>
          Rutas de aprendizaje estructuradas según el estándar de Code Andes Academy
        </Text>

        <TouchableOpacity
          style={exploreStyles.card}
          activeOpacity={0.85}
          onPress={() => router.push('/curso/1')}
        >
          <View style={exploreStyles.badge}>
            <Text style={exploreStyles.badgeText}>Ruta Principal</Text>
          </View>
          <Text style={exploreStyles.cardTitle}>Especialización Móvil React Native 2026</Text>
          <Text style={exploreStyles.cardDesc}>
            Domina Expo SDK 57, TypeScript Estricto, Expo Router, Supabase, Pasarelas de Pagos y Publicación en Google Play / App Store.
          </Text>
          <View style={exploreStyles.footerRow}>
            <View style={exploreStyles.statItem}>
              <Ionicons name="time-outline" size={16} color="#00E676" />
              <Text style={exploreStyles.statText}>330 Horas</Text>
            </View>
            <View style={exploreStyles.statItem}>
              <Ionicons name="ribbon-outline" size={16} color="#38BDF8" />
              <Text style={exploreStyles.statText}>Certificado CIP</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={exploreStyles.card}
          activeOpacity={0.85}
          onPress={() => router.push('/curso/2')}
        >
          <View style={[exploreStyles.badge, { backgroundColor: '#10B981' }]}>
            <Text style={exploreStyles.badgeText}>Cloud & DB</Text>
          </View>
          <Text style={exploreStyles.cardTitle}>Backend Serverless con Supabase</Text>
          <Text style={exploreStyles.cardDesc}>
            Arquitectura de base de datos relacional PostgreSQL, autenticación JWT, Row Level Security y Edge Functions.
          </Text>
          <View style={exploreStyles.footerRow}>
            <View style={exploreStyles.statItem}>
              <Ionicons name="time-outline" size={16} color="#00E676" />
              <Text style={exploreStyles.statText}>80 Horas</Text>
            </View>
            <View style={exploreStyles.statItem}>
              <Ionicons name="flash-outline" size={16} color="#F59E0B" />
              <Text style={exploreStyles.statText}>Tiempo Real</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
