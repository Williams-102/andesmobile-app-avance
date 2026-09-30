// src/app/(auth)/login.tsx
// Pantalla de Inicio de Sesión dedicada (Módulo 05)

import React from 'react';
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
import { authStyles } from '@/styles/auth.styles';
import { useAuthController } from '@/controllers/useAuthController';

export default function LoginScreen() {
  const {
    cargando,
    errorMsg,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    handleRellenarDemo,
    handleLoginSubmit,
    handleIrARegistro,
    handleVolver,
  } = useAuthController();

  return (
    <SafeAreaView style={authStyles.authContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#070D18" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={authStyles.authContent} showsVerticalScrollIndicator={false}>
          {/* Botón Volver */}
          <TouchableOpacity style={authStyles.backBtn} onPress={handleVolver} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#38BDF8" />
            <Text style={authStyles.backBtnText}>Volver</Text>
          </TouchableOpacity>

          {/* Encabezado */}
          <View style={authStyles.authHeader}>
            <Text style={authStyles.authTitle}>Acceso al Campus</Text>
            <Text style={authStyles.authSubtitle}>
              Ingresa tus credenciales para sincronizar tus cursos y certificados.
            </Text>
          </View>

          {/* Mensaje de Error */}
          {errorMsg ? (
            <View style={authStyles.errorCard}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={authStyles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Formulario */}
          <View style={authStyles.formCard}>
            <View style={authStyles.inputGroup}>
              <Text style={authStyles.inputLabel}>CORREO INSTITUCIONAL</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#64748B" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="alumno@codeandes.edu.pe"
                  placeholderTextColor="#64748B"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={authStyles.inputGroup}>
              <Text style={authStyles.inputLabel}>CONTRASEÑA</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#64748B"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Tarjeta de Relleno Rápido Demo para Clase */}
            <View style={authStyles.demoCard}>
              <Text style={authStyles.demoCardText}>¿Probando en clase?</Text>
              <TouchableOpacity style={authStyles.demoFillBtn} onPress={handleRellenarDemo}>
                <Text style={authStyles.demoFillBtnText}>⚡ Rellenar Demo</Text>
              </TouchableOpacity>
            </View>

            {/* Botón de Enviar */}
            <TouchableOpacity
              style={authStyles.submitBtn}
              activeOpacity={0.85}
              onPress={handleLoginSubmit}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={authStyles.submitBtnText}>Ingresar al Campus</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Enlace para ir a Registro */}
          <View style={authStyles.switchAuthRow}>
            <Text style={authStyles.switchAuthText}>¿Aún no tienes una cuenta?</Text>
            <TouchableOpacity onPress={handleIrARegistro}>
              <Text style={authStyles.switchAuthLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
