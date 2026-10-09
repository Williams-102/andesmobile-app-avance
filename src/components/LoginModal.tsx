// src/components/LoginModal.tsx
// Componente de Modal Flotante para Autenticación de Usuario (Módulo 05)

import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { perfilStyles } from '@/styles/perfil.styles';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  email: string;
  onChangeEmail: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
  errorMsg?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  onSubmit,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  errorMsg,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={perfilStyles.modalOverlay}
      >
        <View style={perfilStyles.modalContent}>
          {/* Header del Modal */}
          <View style={perfilStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="school-outline" size={22} color="#00B4D8" />
              <Text style={perfilStyles.modalTitle}>Campus Virtual</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={perfilStyles.modalCloseBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={perfilStyles.modalSubtitle}>
            Ingresa con tus credenciales de estudiante de Code Andes Academy.
          </Text>

          {/* Mensaje de Error si aplica */}
          {errorMsg ? (
            <View
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                padding: 10,
                borderRadius: 8,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <Text style={{ color: '#FCA5A5', fontSize: 12 }}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Campo: Correo Electrónico */}
          <View style={perfilStyles.inputGroup}>
            <Text style={perfilStyles.inputLabel}>Correo Institucional</Text>
            <TextInput
              style={perfilStyles.inputField}
              placeholder="alumno@codeandes.edu.pe"
              placeholderTextColor="#71717A"
              value={email}
              onChangeText={onChangeEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Campo: Contraseña */}
          <View style={perfilStyles.inputGroup}>
            <Text style={perfilStyles.inputLabel}>Contraseña</Text>
            <TextInput
              style={perfilStyles.inputField}
              placeholder="••••••••"
              placeholderTextColor="#71717A"
              value={password}
              onChangeText={onChangePassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Botón de Enviar */}
          <TouchableOpacity
            style={perfilStyles.modalSubmitBtn}
            onPress={onSubmit}
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={perfilStyles.modalSubmitText}>Ingresar al Campus</Text>
          </TouchableOpacity>

          {/* Tarjeta de ayuda para clase */}
          <View style={[perfilStyles.demoHintCard, { flexDirection: 'row', alignItems: 'center' }]}>
            <Ionicons name="information-circle-outline" size={16} color="#38BDF8" style={{ marginRight: 6 }} />
            <Text style={[perfilStyles.demoHintText, { flex: 1 }]}>
              Modo Clase: Credenciales demo precargadas para probar la reactividad en vivo.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
