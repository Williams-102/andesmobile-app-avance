// src/components/AjustesCuentaModal.tsx
// Modal de Ajustes de Cuenta, edicion de perfil, cambio de avatar y preferencias de usuario (Modulo 05 al 09)

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { Usuario } from '../types/usuario';
import { UsuariosSupabaseService } from '../services/UsuariosSupabaseService';
import { StorageServiceSupabase } from '../services/StorageServiceSupabase';
import { useNotification } from '../context/NotificationContext';

interface AjustesCuentaModalProps {
  visible: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onPerfilActualizado: (usuario: Usuario) => void;
}

export const AjustesCuentaModal: React.FC<AjustesCuentaModalProps> = ({
  visible,
  onClose,
  usuario,
  onPerfilActualizado,
}) => {
  const { showToast } = useNotification();

  // Estados del formulario de perfil
  const [nombre, setNombre] = useState<string>('');
  const [cipColegiatura, setCipColegiatura] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [subiendoFoto, setSubiendoFoto] = useState<boolean>(false);

  // Estados de preferencias de aplicacion
  const [notificaciones, setNotificaciones] = useState<boolean>(true);
  const [sincronizacionAuto, setSincronizacionAuto] = useState<boolean>(true);
  const [modoOscuro, setModoOscuro] = useState<boolean>(true);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || '');
      setCipColegiatura(usuario.cipColegiatura || '');
      setAvatarUrl(usuario.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200');
    }
  }, [usuario, visible]);

  const handleSeleccionarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast({
          type: 'warning',
          title: 'Permiso Denegado',
          message: 'Se requiere acceso a la galeria para seleccionar tu foto de perfil.',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        setAvatarUrl(localUri);

        // Subir a Supabase Storage si esta disponible
        setSubiendoFoto(true);
        const subida = await StorageServiceSupabase.subirImagenCurso(
          localUri,
          `avatar_${usuario?.id || 'usr'}_${Date.now()}.jpg`
        );
        setSubiendoFoto(false);

        if (subida.exito && subida.url) {
          setAvatarUrl(subida.url);
          showToast({
            type: 'success',
            title: 'Foto Actualizada',
            message: 'Tu nuevo avatar se encuentra listo.',
          });
        }
      }
    } catch (e) {
      setSubiendoFoto(false);
      showToast({
        type: 'error',
        title: 'Error de Galeria',
        message: 'No se pudo cargar la imagen seleccionada.',
      });
    }
  };

  const handleGuardarCambios = async () => {
    if (!usuario?.id) {
      showToast({
        type: 'warning',
        title: 'Sin Sesion Activa',
        message: 'Inicia sesion para actualizar los datos de tu cuenta.',
      });
      return;
    }

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      showToast({
        type: 'warning',
        title: 'Nombre Requerido',
        message: 'Ingresa tu nombre completo para los certificados.',
      });
      return;
    }

    setCargando(true);
    try {
      const res = await UsuariosSupabaseService.actualizarPerfil(usuario.id, {
        nombre: nombreLimpio,
        cipColegiatura: cipColegiatura.trim(),
        avatarUrl,
      });

      setCargando(false);

      if (res.exito && res.usuario) {
        onPerfilActualizado(res.usuario);
        showToast({
          type: 'success',
          title: 'Ajustes Guardados',
          message: 'Tu perfil y preferencias han sido actualizados con exito.',
        });
        onClose();
      } else {
        showToast({
          type: 'error',
          title: 'Error al Guardar',
          message: res.mensaje || 'No se pudieron actualizar los ajustes.',
        });
      }
    } catch (err: any) {
      setCargando(false);
      showToast({
        type: 'error',
        title: 'Excepcion',
        message: err?.message || 'Error inesperado al guardar ajustes.',
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Cabecera */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="settings-sharp" size={20} color="#38BDF8" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Ajustes de Cuenta</Text>
                <Text style={styles.headerSubtitle}>Preferencias y datos de alumno</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* Seccion de Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                {subiendoFoto && (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="small" color="#38BDF8" />
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.btnCambiarFoto}
                onPress={handleSeleccionarFoto}
                activeOpacity={0.8}
                disabled={subiendoFoto}
              >
                <Ionicons name="camera-outline" size={15} color="#38BDF8" style={{ marginRight: 6 }} />
                <Text style={styles.btnCambiarFotoText}>Cambiar Foto de Perfil</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs de Perfil */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo (para certificados CIP)</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Williams Atao Paucar"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CIP Colegiatura o Codigo de Alumno</Text>
              <TextInput
                style={styles.input}
                value={cipColegiatura}
                onChangeText={setCipColegiatura}
                placeholder="Ej: CIP-304921 o ALUMNO-2026"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electronico (Cuenta Vinculada)</Text>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                  {usuario?.email || 'alumno@codeandes.edu.pe'}
                </Text>
                <Ionicons name="lock-closed" size={14} color="#64748B" />
              </View>
            </View>

            {/* Preferencias de la Aplicacion */}
            <View style={styles.seccionCard}>
              <Text style={styles.seccionTitulo}>Preferencias de la Plataforma</Text>

              <View style={styles.preferenciaFila}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.preferenciaLabel}>Notificaciones de Clases en Vivo</Text>
                  <Text style={styles.preferenciaSub}>Avisos de inicio de modulo y sesiones en tiempo real</Text>
                </View>
                <Switch
                  value={notificaciones}
                  onValueChange={setNotificaciones}
                  trackColor={{ false: '#334155', true: '#0284C7' }}
                  thumbColor={notificaciones ? '#38BDF8' : '#94A3B8'}
                />
              </View>

              <View style={styles.preferenciaFila}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.preferenciaLabel}>Sincronizacion Offline Automatica</Text>
                  <Text style={styles.preferenciaSub}>Descarga de cursos para estudio sin internet</Text>
                </View>
                <Switch
                  value={sincronizacionAuto}
                  onValueChange={setSincronizacionAuto}
                  trackColor={{ false: '#334155', true: '#0284C7' }}
                  thumbColor={sincronizacionAuto ? '#38BDF8' : '#94A3B8'}
                />
              </View>

              <View style={[styles.preferenciaFila, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.preferenciaLabel}>Interfaz Modo Oscuro</Text>
                  <Text style={styles.preferenciaSub}>Tema visual adaptado para reduccion de fatiga ocular</Text>
                </View>
                <Switch
                  value={modoOscuro}
                  onValueChange={setModoOscuro}
                  trackColor={{ false: '#334155', true: '#0284C7' }}
                  thumbColor={modoOscuro ? '#38BDF8' : '#94A3B8'}
                />
              </View>
            </View>

            {/* Credenciales del Sistema */}
            <View style={styles.infoSistema}>
              <Text style={styles.infoSistemaTexto}>Code Andes Mobile App · Version 2.5.0</Text>
              <Text style={styles.infoSistemaSub}>Motor PostgreSQL Supabase & AsyncStorage Offline</Text>
            </View>
          </ScrollView>

          {/* Botones de Accion */}
          <View style={styles.botonesRow}>
            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnGuardar}
              onPress={handleGuardarCambios}
              activeOpacity={0.85}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-sharp" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.btnGuardarText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  closeBtn: {
    padding: 6,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#38BDF8',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCambiarFoto: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  btnCambiarFotoText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  inputDisabled: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  seccionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  seccionTitulo: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  preferenciaFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  preferenciaLabel: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  preferenciaSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  infoSistema: {
    alignItems: 'center',
    marginVertical: 8,
  },
  infoSistemaTexto: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  infoSistemaSub: {
    color: '#475569',
    fontSize: 9,
    marginTop: 2,
  },
  botonesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCancelarText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 13,
  },
  btnGuardar: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGuardarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
