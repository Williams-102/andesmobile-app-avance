// src/app/(tabs)/perfil.tsx
// Pestaña Perfil de Usuario conectada a usePerfilController y perfilStyles (Clean Architecture)

import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { usePerfilController } from '@/controllers/usePerfilController';
import { useNotification } from '@/context/NotificationContext';
import { perfilStyles } from '@/styles/perfil.styles';
import { AdminPanelModal } from '@/components/AdminPanelModal';
import { BoletaModal } from '@/components/BoletaModal';
import { CertificadosModal, AjustesCuentaModal } from '@/components';

export default function PerfilScreen() {
  const [modalAdminVisible, setModalAdminVisible] = React.useState(false);
  const { showToast } = useNotification();
  const {
    usuario,
    estaAutenticado,
    cargando,
    boletas,
    modalBoletasVisible,
    cargandoBoletas,
    boletaSeleccionada,
    setBoletaSeleccionada,
    modalCertificadosVisible,
    modalAjustesVisible,
    handleCerrarSesion,
    handleIrALogin,
    handleIrARegistro,
    handleAbrirBoletas,
    handleCerrarBoletas,
    handleAbrirCertificados,
    handleCerrarCertificados,
    handleAbrirAjustes,
    handleCerrarAjustes,
    handlePerfilActualizado,
    handleLimpiarHistorialBoletas,
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

        {estaAutenticado && (
          <View
            style={[
              perfilStyles.cipBadge,
              usuario?.rol === 'admin'
                ? { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B' }
                : usuario?.rol === 'docente'
                ? { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38BDF8' }
                : { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' },
            ]}
          >
            <Text
              style={[
                perfilStyles.cipText,
                {
                  color:
                    usuario?.rol === 'admin'
                      ? '#F59E0B'
                      : usuario?.rol === 'docente'
                      ? '#38BDF8'
                      : '#10B981',
                },
              ]}
            >
              {usuario?.rol === 'admin'
                ? 'ROL: ADMINISTRADOR'
                : usuario?.rol === 'docente'
                ? `DOCENTE CIP: ${usuario?.cipColegiatura || 'Colegiado'}`
                : `ALUMNO: ${usuario?.cipColegiatura || 'Estudiante'}`}
            </Text>
          </View>
        )}
      </View>


      {/* Opciones disponibles */}
      <View style={perfilStyles.opcionesCard}>
        {/* Acceso al Portal Administrativo de Cursos (Solo Admin) */}
        {estaAutenticado && usuario?.rol === 'admin' && (
          <TouchableOpacity
            style={[
              perfilStyles.opcionFila,
              {
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                borderWidth: 1,
                borderColor: '#F59E0B',
                borderRadius: 10,
                marginBottom: 6,
              },
            ]}
            onPress={() => setModalAdminVisible(true)}
          >
            <Ionicons name="shield-checkmark" size={22} color="#F59E0B" />
            <Text
              style={[
                perfilStyles.opcionTexto,
                {
                  color: '#F59E0B',
                  fontWeight: '800',
                },
              ]}
            >
              Portal Admin (Subir & Gestionar Cursos)
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
          </TouchableOpacity>
        )}


        <TouchableOpacity
          style={perfilStyles.opcionFila}
          onPress={handleAbrirCertificados}
        >
          <Ionicons name="ribbon-outline" size={20} color="#38BDF8" />
          <Text style={perfilStyles.opcionTexto}>Mis Certificaciones</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>


        {/* Historial de Boletas conectado a AsyncStorage */}
        <TouchableOpacity
          style={perfilStyles.opcionFila}
          onPress={handleAbrirBoletas}
        >
          <Ionicons name="document-text-outline" size={20} color="#38BDF8" />
          <Text style={perfilStyles.opcionTexto}>Historial de Boletas</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={perfilStyles.opcionFila}
          onPress={handleAbrirAjustes}
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

      {/* Modal Historial de Boletas Persistente */}
      <Modal
        visible={modalBoletasVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCerrarBoletas}
      >
        <View style={perfilStyles.modalOverlay}>
          <View style={[perfilStyles.modalContent, { maxHeight: '85%' }]}>
            <View style={perfilStyles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="receipt-outline" size={22} color="#38BDF8" />
                <Text style={perfilStyles.modalTitle}>Historial de Boletas</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {boletas.length > 0 && (
                  <TouchableOpacity onPress={handleLimpiarHistorialBoletas} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={{ color: Colors.danger, fontSize: 12, fontWeight: '700' }}>Limpiar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleCerrarBoletas} style={perfilStyles.modalCloseBtn}>
                  <Ionicons name="close" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={perfilStyles.modalSubtitle}>
              Comprobantes de matrícula y compras guardados en tu almacenamiento local.
            </Text>

            {cargandoBoletas ? (
              <ActivityIndicator size="small" color="#38BDF8" style={{ marginVertical: 20 }} />
            ) : boletas.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Ionicons name="document-outline" size={44} color={Colors.textMuted} />
                <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 10, textAlign: 'center', lineHeight: 18 }}>
                  Aún no tienes boletas registradas.{'\n'}Tus compras online o sincronizadas desde offline aparecerán aquí.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
                {boletas.map((boleta) => (
                  <TouchableOpacity
                    key={boleta.id}
                    onPress={() => setBoletaSeleccionada(boleta)}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: '#0F172A',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: '#1E293B',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ color: '#38BDF8', fontWeight: '800', fontSize: 13, fontFamily: 'monospace' }}>
                        {boleta.serie || boleta.id}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          backgroundColor:
                            boleta.estado === 'COMPLETADO_ONLINE'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(56, 189, 248, 0.2)',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: boleta.estado === 'COMPLETADO_ONLINE' ? '#10B981' : '#38BDF8',
                        }}
                      >
                        <Ionicons
                          name={boleta.estado === 'COMPLETADO_ONLINE' ? 'cloud-done-outline' : 'sync-outline'}
                          size={11}
                          color={boleta.estado === 'COMPLETADO_ONLINE' ? '#10B981' : '#38BDF8'}
                        />
                        <Text
                          style={{
                            color: boleta.estado === 'COMPLETADO_ONLINE' ? '#10B981' : '#38BDF8',
                            fontSize: 10,
                            fontWeight: '700',
                          }}
                        >
                          {boleta.estado === 'COMPLETADO_ONLINE' ? 'Online' : 'Sincronizado'}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 11 }} numberOfLines={1}>
                        Alumno: <Text style={{ color: '#E2E8F0', fontWeight: '600' }}>{boleta.clienteNombre || 'Estudiante Code Andes'}</Text>
                      </Text>
                      <Text style={{ color: Colors.textMuted, fontSize: 10 }}>
                        {new Date(boleta.fecha).toLocaleString('es-PE')}
                      </Text>
                    </View>

                    {/* Lista de Cursos */}
                    <View style={{ borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 6, marginBottom: 6 }}>
                      {boleta.cursos.map((c, i) => (
                        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                          <Text style={{ color: '#E2E8F0', fontSize: 11, flex: 1, paddingRight: 6 }} numberOfLines={1}>
                            • {c.titulo}
                          </Text>
                          <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }}>
                            S/ {c.precio.toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 6 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 11 }}>Total Pagado ({boleta.metodoPago}):</Text>
                      <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 12 }}>
                        S/ {boleta.total.toFixed(2)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 6, gap: 4 }}>
                      <Text style={{ color: '#38BDF8', fontSize: 11, fontWeight: '600' }}>Ver Boleta Digital</Text>
                      <Ionicons name="receipt-outline" size={13} color="#38BDF8" />
                    </View>

                    {boleta.ticketOfflineId && (
                      <Text style={{ color: '#64748B', fontSize: 9, marginTop: 4, fontStyle: 'italic' }}>
                        Ticket origen: {boleta.ticketOfflineId}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[perfilStyles.modalSubmitBtn, { marginTop: 14 }]}
              onPress={handleCerrarBoletas}
            >
              <Text style={perfilStyles.modalSubmitText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Gestión Administrativa (CRUD Supabase & Roles) */}
      <AdminPanelModal
        visible={modalAdminVisible}
        onClose={() => setModalAdminVisible(false)}
      />

      {/* Modal de Boleta Electrónica Digital Seleccionada (Módulo 09) */}
      <BoletaModal
        visible={!!boletaSeleccionada}
        boleta={boletaSeleccionada}
        onCerrar={() => setBoletaSeleccionada(null)}
      />

      {/* Modal de Certificaciones Oficiales CIP */}
      <CertificadosModal
        visible={modalCertificadosVisible}
        onClose={handleCerrarCertificados}
        usuario={usuario}
        boletas={boletas}
      />

      {/* Modal de Ajustes de Cuenta y Perfil */}
      <AjustesCuentaModal
        visible={modalAjustesVisible}
        onClose={handleCerrarAjustes}
        usuario={usuario}
        onPerfilActualizado={handlePerfilActualizado}
      />
    </View>
  );
}
