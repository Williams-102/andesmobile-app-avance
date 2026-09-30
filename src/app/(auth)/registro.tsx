// src/app/(auth)/registro.tsx
// Pantalla de Registro de Alumno dedicada (Módulo 05)

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

export default function RegistroScreen() {
  const {
    cargando,
    errorMsg,
    regNombre,
    setRegNombre,
    regEmail,
    setRegEmail,
    regPassword,
    setRegPassword,
    regCip,
    setRegCip,
    handleRegistroSubmit,
    handleIrALogin,
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
            <Text style={authStyles.authTitle}>Crear Cuenta de Alumno</Text>
            <Text style={authStyles.authSubtitle}>
              Únete al programa de especializaciones de Code Andes Academy.
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
              <Text style={authStyles.inputLabel}>NOMBRE COMPLETO</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#64748B" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Ej: Juan Pérez Morales"
                  placeholderTextColor="#64748B"
                  value={regNombre}
                  onChangeText={setRegNombre}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={authStyles.inputGroup}>
              <Text style={authStyles.inputLabel}>CORREO ELECTRÓNICO</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#64748B" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="alumno@codeandes.edu.pe"
                  placeholderTextColor="#64748B"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={authStyles.inputGroup}>
              <Text style={authStyles.inputLabel}>N° COLEGIATURA CIP (OPCIONAL)</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="ribbon-outline" size={18} color="#64748B" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Ej: CIP-304921"
                  placeholderTextColor="#64748B"
                  value={regCip}
                  onChangeText={setRegCip}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={authStyles.inputGroup}>
              <Text style={authStyles.inputLabel}>CONTRASEÑA</Text>
              <View style={authStyles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={authStyles.inputIcon} />
                <TextInput
                  style={authStyles.textInput}
                  placeholder="Mínimo 4 caracteres"
                  placeholderTextColor="#64748B"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Botón de Enviar */}
            <TouchableOpacity
              style={authStyles.submitBtn}
              activeOpacity={0.85}
              onPress={handleRegistroSubmit}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={authStyles.submitBtnText}>Completar Registro</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Enlace para ir a Login */}
          <View style={authStyles.switchAuthRow}>
            <Text style={authStyles.switchAuthText}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity onPress={handleIrALogin}>
              <Text style={authStyles.switchAuthLink}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
