// src/components/AdminPanelModal.tsx
// Portal de Administración de Cursos y Catálogo (Módulo 07 - CRUD en Tiempo Real con Supabase Cloud)

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CursosSupabaseService } from '../services/CursosSupabaseService';
import { Curso } from '../types/curso';

interface AdminPanelModalProps {
  visible: boolean;
  onClose: () => void;
  onCatalogoModificado?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  visible,
  onClose,
  onCatalogoModificado,
}) => {
  const [cargando, setCargando] = useState<boolean>(false);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState<boolean>(false);

  // Estado para edición rápida de precio
  const [cursoEditandoId, setCursoEditandoId] = useState<string | null>(null);
  const [precioEditado, setPrecioEditado] = useState<string>('');
  const [precioRegularEditado, setPrecioRegularEditado] = useState<string>('');

  // Formulario de Subida de Nuevo Curso
  const [titulo, setTitulo] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('Móvil');
  const [precio, setPrecio] = useState<string>('149.90');
  const [precioRegular, setPrecioRegular] = useState<string>('249.90');
  const [horas, setHoras] = useState<string>('120');
  const [docente, setDocente] = useState<string>('Ing. Exar Williams Atao (CIP)');
  const [descripcion, setDescripcion] = useState<string>('');
  const [imagenUrl, setImagenUrl] = useState<string>(
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600'
  );

  // Cargar cursos en vivo desde Supabase
  const recargarCursos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await CursosSupabaseService.obtenerCursos();
      setCursos(data);
    } catch (err) {
      console.error('[AdminPanel] Error al obtener cursos:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      recargarCursos();
    }
  }, [visible, recargarCursos]);

  // =========================================================================
  // 1. CREATE: Subir un nuevo curso a Supabase Cloud
  // =========================================================================
  const handlePublicarCurso = async () => {
    if (!titulo.trim()) {
      Alert.alert('Falta Información', 'Ingresa el nombre o título del curso.');
      return;
    }
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Precio Inválido', 'Ingresa un precio de venta mayor a 0.');
      return;
    }

    const slug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const horasNum = parseInt(horas, 10) || 100;
    const precioRegNum = parseFloat(precioRegular) || precioNum * 1.5;

    setCargando(true);
    const resultado = await CursosSupabaseService.crearCurso({
      id: slug || `curso-${Date.now()}`,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || 'Especialización profesional certificada de Code Andes Academy.',
      precio: precioNum,
      precio_regular: precioRegNum,
      horas: horasNum,
      rating: 5.0,
      nivel: 'Intermedio',
      categoria: categoria.trim() || 'Móvil',
      docente: docente.trim() || 'Ing. Exar Williams Atao',
      imagen_url: imagenUrl.trim(),
      activo: true,
    });
    setCargando(false);

    if (resultado.exito) {
      Alert.alert('🚀 ¡Curso Publicado!', `"${titulo}" ya está disponible en el catálogo de los alumnos.`);
      setMostrarFormNuevo(false);
      setTitulo('');
      setDescripcion('');
      await recargarCursos();
      onCatalogoModificado?.();
    } else {
      Alert.alert('Error en Supabase', resultado.mensaje);
    }
  };

  // =========================================================================
  // 2. UPDATE: Modificar precio de venta de un curso en Supabase
  // =========================================================================
  const handleGuardarPrecio = async (id: string) => {
    const nuevo = parseFloat(precioEditado);
    if (isNaN(nuevo) || nuevo < 0) {
      Alert.alert('Precio Inválido', 'Ingresa un valor numérico válido.');
      return;
    }

    const nuevoReg = precioRegularEditado ? parseFloat(precioRegularEditado) : undefined;

    setCargando(true);
    const res = await CursosSupabaseService.actualizarPrecio(id, nuevo, nuevoReg);
    setCargando(false);

    if (res.exito) {
      Alert.alert('✅ Precio Actualizado', `El nuevo precio del curso es S/ ${nuevo.toFixed(2)}.`);
      setCursoEditandoId(null);
      setPrecioEditado('');
      setPrecioRegularEditado('');
      await recargarCursos();
      onCatalogoModificado?.();
    } else {
      Alert.alert('Error', res.mensaje);
    }
  };

  // =========================================================================
  // 3. DELETE: Retirar curso del catálogo (Soft Delete para proteger boletas)
  // =========================================================================
  const handleRetirarCurso = (id: string, nombreCurso: string) => {
    Alert.alert(
      'Retirar Curso del Catálogo',
      `¿Deseas retirar "${nombreCurso}" de la vista de los estudiantes?\n\n(Se aplicará borrado lógico "Soft Delete" para mantener intacto el historial de compras).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Retirar del App',
          style: 'destructive',
          onPress: async () => {
            setCargando(true);
            const res = await CursosSupabaseService.eliminarCurso(id, false);
            setCargando(false);
            if (res.exito) {
              Alert.alert('Retirado', `El curso ha sido ocultado del catálogo.`);
              await recargarCursos();
              onCatalogoModificado?.();
            } else {
              Alert.alert('Error', res.mensaje);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Encabezado del Portal de Administración */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.adminIconWrapper}>
                <Ionicons name="settings-sharp" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Portal de Administración</Text>
                <Text style={styles.headerSubtitle}>Gestión de Cursos & Precios en Supabase</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Barra de Estado / Recarga */}
          <View style={styles.statusBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>
                {cursos.length} cursos activos en PostgreSQL Cloud
              </Text>
            </View>
            <TouchableOpacity onPress={recargarCursos} style={styles.refreshMiniBtn}>
              <Ionicons name="reload" size={14} color="#38BDF8" />
              <Text style={styles.refreshMiniText}>Refrescar</Text>
            </TouchableOpacity>
          </View>

          {cargando && (
            <View style={styles.loadingBar}>
              <ActivityIndicator size="small" color="#F59E0B" />
              <Text style={styles.loadingText}>Sincronizando con Supabase...</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            {/* BOTÓN: + Subir Nuevo Curso */}
            <TouchableOpacity
              style={[styles.botonSubir, mostrarFormNuevo && styles.botonSubirActivo]}
              onPress={() => setMostrarFormNuevo(!mostrarFormNuevo)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={mostrarFormNuevo ? 'chevron-up-circle' : 'add-circle'}
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.botonSubirText}>
                {mostrarFormNuevo ? 'Cerrar Formulario' : '+ Subir Nuevo Curso al App'}
              </Text>
            </TouchableOpacity>

            {/* FORMULARIO DE CREACIÓN (CREATE) */}
            {mostrarFormNuevo && (
              <View style={styles.formularioCard}>
                <Text style={styles.formularioTitle}>🚀 Registrar Nuevo Curso en el Catálogo</Text>
                <Text style={styles.formularioSub}>
                  Los estudiantes verán este curso reflejado de inmediato en su pantalla.
                </Text>

                <Text style={styles.label}>TÍTULO DEL CURSO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Microservicios con Docker y Go"
                  placeholderTextColor="#64748B"
                  value={titulo}
                  onChangeText={setTitulo}
                />

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>CATEGORÍA</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Móvil, Backend, Cloud..."
                      placeholderTextColor="#64748B"
                      value={categoria}
                      onChangeText={setCategoria}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>HORAS ACADÉMICAS</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="120"
                      placeholderTextColor="#64748B"
                      value={horas}
                      onChangeText={setHoras}
                    />
                  </View>
                </View>

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>PRECIO OFERTA (S/)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="149.90"
                      placeholderTextColor="#64748B"
                      value={precio}
                      onChangeText={setPrecio}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>PRECIO REGULAR (S/)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="250.00"
                      placeholderTextColor="#64748B"
                      value={precioRegular}
                      onChangeText={setPrecioRegular}
                    />
                  </View>
                </View>

                <Text style={styles.label}>DOCENTE ASIGNADO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ing. Exar Williams Atao (CIP)"
                  placeholderTextColor="#64748B"
                  value={docente}
                  onChangeText={setDocente}
                />

                <Text style={styles.label}>DESCRIPCIÓN DEL PROGRAMA</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  multiline
                  placeholder="Temas principales que dominará el alumno..."
                  placeholderTextColor="#64748B"
                  value={descripcion}
                  onChangeText={setDescripcion}
                />

                <Text style={styles.label}>URL DE LA IMAGEN DE PORTADA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://images.unsplash.com/..."
                  placeholderTextColor="#64748B"
                  value={imagenUrl}
                  onChangeText={setImagenUrl}
                />

                <TouchableOpacity
                  style={styles.btnPublicarSubmit}
                  onPress={handlePublicarCurso}
                  disabled={cargando}
                >
                  <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.btnPublicarSubmitText}>Publicar en Supabase (INSERT)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* LISTADO DE CURSOS EN VIVO (READ, UPDATE, DELETE) */}
            <Text style={styles.sectionHeader}>Cursos Publicados en el App ({cursos.length})</Text>

            {cursos.map((c) => (
              <View key={c.id} style={styles.cursoCard}>
                <View style={styles.cursoHeaderRow}>
                  <Image source={{ uri: c.imagenUrl }} style={styles.cursoThumbnail} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cursoTitulo} numberOfLines={2}>
                      {c.titulo}
                    </Text>
                    <Text style={styles.cursoMeta}>
                      {c.categoria} · {c.duracion || '120 hrs'} · {c.docente}
                    </Text>
                    <View style={styles.preciosRow}>
                      <Text style={styles.precioInversion}>S/ {c.inversion.toFixed(2)}</Text>
                      {c.precioRegular ? (
                        <Text style={styles.precioRegularTachado}>
                          S/ {c.precioRegular.toFixed(2)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                {/* Sub-panel para editar precio */}
                {cursoEditandoId === c.id ? (
                  <View style={styles.editorPrecioCard}>
                    <Text style={styles.editorPrecioTitle}>Editar Precio del Curso:</Text>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <TextInput
                        style={styles.editorInput}
                        keyboardType="numeric"
                        placeholder="Precio Venta S/"
                        placeholderTextColor="#64748B"
                        value={precioEditado}
                        onChangeText={setPrecioEditado}
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.btnGuardarPrecio}
                        onPress={() => handleGuardarPrecio(c.id)}
                      >
                        <Text style={styles.btnGuardarPrecioText}>Guardar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.btnCancelarPrecio}
                        onPress={() => setCursoEditandoId(null)}
                      >
                        <Text style={styles.btnCancelarPrecioText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.accionesRow}>
                    <TouchableOpacity
                      style={styles.btnAccionEditar}
                      onPress={() => {
                        setCursoEditandoId(c.id);
                        setPrecioEditado(c.inversion.toString());
                        setPrecioRegularEditado(c.precioRegular?.toString() || '');
                      }}
                    >
                      <Ionicons name="pricetag-outline" size={14} color="#38BDF8" />
                      <Text style={styles.btnAccionEditarText}>Editar Precio</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnAccionEliminar}
                      onPress={() => handleRetirarCurso(c.id, c.titulo)}
                    >
                      <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      <Text style={styles.btnAccionEliminarText}>Retirar del App</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#070D18',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    minHeight: '75%',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  adminIconWrapper: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0A1222',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  refreshMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshMiniText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  loadingText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  botonSubir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  botonSubirActivo: {
    backgroundColor: '#334155',
  },
  botonSubirText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  formularioCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 20,
  },
  formularioTitle: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  formularioSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 14,
  },
  label: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#070D18',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  btnPublicarSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 4,
  },
  btnPublicarSubmitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionHeader: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  cursoCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  cursoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  cursoTitulo: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  cursoMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  preciosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  precioInversion: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '800',
  },
  precioRegularTachado: {
    color: '#64748B',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  accionesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  btnAccionEditar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  btnAccionEditarText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  btnAccionEliminar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  btnAccionEliminarText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  editorPrecioCard: {
    backgroundColor: '#070D18',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  editorPrecioTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  editorInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  btnGuardarPrecio: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnGuardarPrecioText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  btnCancelarPrecio: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnCancelarPrecioText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
