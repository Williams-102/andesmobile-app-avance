// src/app/(tabs)/perfil.tsx
// Pestaña Perfil de Usuario conectada a usePerfilController y perfilStyles (Clean Architecture)

import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { usePerfilController } from '@/controllers/usePerfilController';
import { perfilStyles } from '@/styles/perfil.styles';

export default function PerfilScreen() {
  const {
    usuario,
    estaAutenticado,
    cargando,
    handleCerrarSesion,
    handleIrALogin,
    handleIrARegistro,
  } = usePerfilController();

  if (cargando) {
    return (
      <View style={perfilStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={perfilStyles.loadingTexto}>Sincronizando perfil con el servidor...</Text>
      </View>
    );
  }

  return (
    <View style={perfilStyles.container}>
      {/* Tarjeta de Perfil Reactiva */}
      <View style={perfilStyles.avatarContainer}>
        <Image
          source={{
            uri:
              usuario?.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
          }}
          style={perfilStyles.avatar}
        />
        <Text style={perfilStyles.nombre}>
          {estaAutenticado ? usuario?.nombre : 'Visitante Anónimo'}
        </Text>
        <Text style={perfilStyles.rol}>
          {estaAutenticado ? usuario?.email : 'Sin sesión activa'}
        </Text>

        {estaAutenticado && usuario?.cipColegiatura && (
          <View style={perfilStyles.cipBadge}>
            <Text style={perfilStyles.cipText}>Colegiatura: {usuario.cipColegiatura} · CIP</Text>
          </View>
        )}
      </View>

      {/* Opciones disponibles */}
      <View style={perfilStyles.opcionesCard}>
        <TouchableOpacity
          style={perfilStyles.opcionFila}
          onPress={() => Alert.alert('Certificaciones', 'Tus certificados con firma digital CIP se cargarán aquí.')}
        >
          <Ionicons name="ribbon-outline" size={20} color="#38BDF8" />
          <Text style={perfilStyles.opcionTexto}>Mis Certificaciones</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={perfilStyles.opcionFila}
          onPress={() => Alert.alert('Boletas', 'Historial tributario de compras y facturación electrónica.')}
        >
          <Ionicons name="document-text-outline" size={20} color="#38BDF8" />
          <Text style={perfilStyles.opcionTexto}>Historial de Boletas</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={perfilStyles.opcionFila}
          onPress={() => Alert.alert('Ajustes', 'Preferencias de cuenta y notificaciones.')}
        >
          <Ionicons name="settings-outline" size={20} color="#38BDF8" />
          <Text style={perfilStyles.opcionTexto}>Ajustes de Cuenta</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Botón condicional según estado de autenticación */}
      {estaAutenticado ? (
        <TouchableOpacity style={perfilStyles.botonCerrar} onPress={handleCerrarSesion}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} style={{ marginRight: 8 }} />
          <Text style={perfilStyles.textoBoton}>Cerrar Sesión</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ gap: 12, marginTop: 20 }}>
          <TouchableOpacity style={perfilStyles.botonIniciar} onPress={handleIrALogin}>
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={perfilStyles.textoBotonIniciar}>Iniciar Sesión de Alumno</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[perfilStyles.botonIniciar, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#0284C7', marginTop: 0 }]}
            onPress={handleIrARegistro}
          >
            <Ionicons name="person-add-outline" size={18} color="#0284C7" style={{ marginRight: 8 }} />
            <Text style={[perfilStyles.textoBotonIniciar, { color: '#0284C7' }]}>Crear Cuenta de Alumno</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
