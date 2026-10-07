// src/app/(auth)/recuperar-password.tsx
// Pantalla de Recuperación de Contraseña con Supabase Auth & JWT (Módulo 08)

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authStyles } from '@/styles/auth.styles';
import { AuthServiceSupabase } from '@/services/AuthServiceSupabase';

export default function RecuperarPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  const handleSolicitarRestablecimiento = async () => {
    setMensajeError('');
    setMensajeExito('');

    if (!email.trim()) {
      setMensajeError('Por favor ingresa tu correo institucional.');
      return;
    }

    setCargando(true);
    try {
      const res = await AuthServiceSupabase.recuperarPassword(email.trim());
      if (res.exito) {
        setMensajeExito(res.mensaje || 'Se ha enviado un enlace de recuperación a tu correo.');
      } else {
        setMensajeError(res.mensaje || 'No se pudo enviar el correo.');
      }
    } catch {
      setMensajeError('Error de conexión con el servidor de Supabase.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.authContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#070D18" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={authStyles.authContent} showsVerticalScrollIndicator={false}>
          {/* Botón Volver */}
          <TouchableOpacity
            style={authStyles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#38BDF8" />
            <Text style={authStyles.backBtnText}>Volver al Login</Text>
          </TouchableOpacity>

          {/* Encabezado */}
          <View style={authStyles.authHeader}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                borderWidth: 1,
                borderColor: '#38BDF8',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons name="key-outline" size={28} color="#38BDF8" />
            </View>
            <Text style={authStyles.authTitle}>Recuperar Contraseña</Text>
            <Text style={authStyles.authSubtitle}>
              Ingresa el correo asociado a tu cuenta para recibir un enlace de restablecimiento seguro.
            </Text>
          </View>

          {/* Alertas */}
          {mensajeError ? (
            <View style={authStyles.errorCard}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={authStyles.errorText}>{mensajeError}</Text>
            </View>
          ) : null}

          {mensajeExito ? (
            <View
              style={[
                authStyles.errorCard,
                {
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  borderColor: '#10B981',
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[authStyles.errorText, { color: '#6EE7B7' }]}>
                {mensajeExito}
              </Text>
            </View>
          ) : null}

          {/* Formulario */}
          <View style={authStyles.formCard}>
            <View style={authStyles.inputGroup}>
              <Text style={authStyles.inputLabel}>CORREO INSTITUCIONAL REGISTRADO</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#64748B" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="alumno@codeandes.edu.pe"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Botón de Enviar */}
            <TouchableOpacity
              style={authStyles.submitBtn}
              activeOpacity={0.85}
              onPress={handleSolicitarRestablecimiento}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={authStyles.submitBtnText}>Enviar Enlace de Recuperación</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 16, alignItems: 'center' }}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                ¿Recordaste tu contraseña?{' '}
                <Text style={{ color: '#38BDF8', fontWeight: '700' }}>Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
