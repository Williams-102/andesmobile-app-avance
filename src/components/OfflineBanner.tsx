// src/components/OfflineBanner.tsx
// Banner visual de advertencia cuando la app entra en modo offline

import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';

export const OfflineBanner: React.FC = () => {
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  // Si hay internet, no ocupa espacio en pantalla
  if (!isOffline) return null;

  // Calculamos el espacio superior seguro para respetar la barra de estado (reloj, batería, notch)
  const topPadding = Platform.OS === 'android'
    ? Math.max(insets.top, RNStatusBar.currentHeight || 0) + 6
    : Math.max(insets.top, 12) + 4;

  return (
    <View style={[styles.banner, { paddingTop: topPadding }]}>
      <View style={styles.contenido}>
        <Ionicons name="cloud-offline-outline" size={17} color="#000000" style={{ marginRight: 6 }} />
        <Text style={styles.texto}>
          Modo Offline: Sin conexión. Tus compras y cambios se sincronizarán al volver.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F59E0B', // Ámbar de advertencia
    paddingBottom: 8,
    paddingHorizontal: 14,
    zIndex: 9999,
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
});

