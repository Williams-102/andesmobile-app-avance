// src/components/AdminPanelModal.tsx
// Panel Administrativo Completo para Docente y Admin (Módulo 07 - CRUD con Supabase & PostgreSQL)

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
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CursosSupabaseService } from '../services/CursosSupabaseService';
import { UsuariosSupabaseService } from '../services/UsuariosSupabaseService';
import { Curso } from '../types/curso';
import { Usuario } from '../types/usuario';
import { Colors } from '../constants/Colors';

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
  const [tab, setTab] = useState<'cursos' | 'usuarios'>('cursos');
  const [cargando, setCargando] = useState<boolean>(false);

  // Estados de Cursos
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState<boolean>(false);
  const [cursoEditandoId, setCursoEditandoId] = useState<string | null>(null);
  const [nuevoPrecioInput, setNuevoPrecioInput] = useState<string>('');

  // Formulario nuevo curso
  const [nuevoId, setNuevoId] = useState<string>('');
  const [nuevoTitulo, setNuevoTitulo] = useState<string>('');
  const [nuevaDesc, setNuevaDesc] = useState<string>('');
  const [nuevoPrecio, setNuevoPrecio] = useState<string>('149.90');
  const [nuevoPrecioReg, setNuevoPrecioReg] = useState<string>('250.00');
  const [nuevaCat, setNuevaCat] = useState<string>('Móvil');
  const [nuevasHoras, setNuevasHoras] = useState<string>('120');

  // Estados de Usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Cargar datos en vivo desde Supabase
  const recargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [cursosCloud, usuariosCloud] = await Promise.all([
        CursosSupabaseService.obtenerCursos(),
        UsuariosSupabaseService.obtenerTodos(),
      ]);
      setCursos(cursosCloud);
      setUsuarios(usuariosCloud);
    } catch (err) {
      console.error('[AdminPanel] Error recargando datos:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      recargarDatos();
    }
  }, [visible, recargarDatos]);

  // CREATE: Crear curso en Supabase
  const handleCrearCurso = async () => {
    if (!nuevoTitulo.trim() || !nuevoPrecio.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa al menos el título y el precio del curso.');
      return;
    }

    const slug = nuevoId.trim() || nuevoTitulo.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const precioNum = parseFloat(nuevoPrecio) || 99.9;
    const precioRegNum = parseFloat(nuevoPrecioReg) || precioNum * 1.5;
    const horasNum = parseInt(nuevasHoras, 10) || 100;

    setCargando(true);
    const res = await CursosSupabaseService.crearCurso({
      id: slug,
      titulo: nuevoTitulo.trim(),
      descripcion: nuevaDesc.trim() || 'Especialización oficial de Code Andes Academy.',
      precio: precioNum,
      precio_regular: precioRegNum,
      horas: horasNum,
      rating: 5.0,
      nivel: 'Intermedio',
      categoria: nuevaCat.trim() || 'Móvil',
      docente: 'Ing. Exar Williams Atao (CIP)',
      imagen_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
      activo: true,
    });

    setCargando(false);
    if (res.exito) {
      Alert.alert('✅ Éxito', `El curso "${nuevoTitulo}" fue registrado en Supabase Cloud.`);
      setMostrarFormNuevo(false);
      setNuevoTitulo('');
      setNuevoId('');
      setNuevaDesc('');
      await recargarDatos();
      onCatalogoModificado?.();
    } else {
      Alert.alert('Error en Supabase', res.mensaje);
    }
  };

  // UPDATE: Actualizar precio de curso
  const handleGuardarPrecio = async (id: string) => {
    const precioNum = parseFloat(nuevoPrecioInput);
    if (isNaN(precioNum) || precioNum < 0) {
      Alert.alert('Precio inválido', 'Ingresa un valor numérico válido.');
      return;
    }

    setCargando(true);
    const res = await CursosSupabaseService.actualizarPrecio(id, precioNum);
    setCargando(false);

    if (res.exito) {
      Alert.alert('✅ Precio Actualizado', `El nuevo precio es S/ ${precioNum.toFixed(2)}.`);
      setCursoEditandoId(null);
      setNuevoPrecioInput('');
      await recargarDatos();
      onCatalogoModificado?.();
    } else {
      Alert.alert('Error', res.mensaje);
    }
  };

  // DELETE: Soft delete de curso en Supabase
  const handleEliminarCurso = (id: string, titulo: string) => {
    Alert.alert(
      'Confirmar Retiro de Curso',
      `¿Deseas retirar "${titulo}" del catálogo activo? (Se aplicará Soft Delete para no afectar compras previas).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Retirar del Catálogo',
          style: 'destructive',
          onPress: async () => {
            setCargando(true);
            const res = await CursosSupabaseService.eliminarCurso(id, false);
            setCargando(false);
            if (res.exito) {
              await recargarDatos();
              onCatalogoModificado?.();
            } else {
              Alert.alert('Error', res.mensaje);
            }
          },
        },
      ]
    );
  };

  // Cambiar rol de usuario
  const handleCambiarRol = async (user: Usuario, nuevoRol: 'alumno' | 'docente' | 'admin') => {
    const ok = await UsuariosSupabaseService.cambiarRol(user.id, nuevoRol);
    if (ok) {
      Alert.alert('Rol Actualizado', `${user.nombre} ahora tiene el rol: ${nuevoRol.toUpperCase()}`);
      await recargarDatos();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark" size={24} color="#F59E0B" />
              <View>
                <Text style={styles.headerTitle}>Panel de Administración</Text>
                <Text style={styles.headerSubtitle}>Supabase Cloud & PostgreSQL</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Selector de Pestañas */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'cursos' && styles.tabBtnActive]}
              onPress={() => setTab('cursos')}
            >
              <Ionicons name="book-outline" size={16} color={tab === 'cursos' ? '#38BDF8' : '#94A3B8'} />
              <Text style={[styles.tabText, tab === 'cursos' && styles.tabTextActive]}>
                Cursos ({cursos.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, tab === 'usuarios' && styles.tabBtnActive]}
              onPress={() => setTab('usuarios')}
            >
              <Ionicons name="people-outline" size={16} color={tab === 'usuarios' ? '#38BDF8' : '#94A3B8'} />
              <Text style={[styles.tabText, tab === 'usuarios' && styles.tabTextActive]}>
                Usuarios ({usuarios.length})
              </Text>
            </TouchableOpacity>
          </View>

          {cargando && (
            <View style={styles.loadingBar}>
              <ActivityIndicator size="small" color="#38BDF8" />
              <Text style={styles.loadingText}>Sincronizando con PostgreSQL...</Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, padding: 16 }}>
            {/* ===================== TAB CURSOS ===================== */}
            {tab === 'cursos' && (
              <View>
                {/* Botón Nuevo Curso */}
                <TouchableOpacity
                  style={styles.nuevoCursoBtn}
                  onPress={() => setMostrarFormNuevo(!mostrarFormNuevo)}
                >
                  <Ionicons
                    name={mostrarFormNuevo ? 'close-circle-outline' : 'add-circle-outline'}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.nuevoCursoBtnText}>
                    {mostrarFormNuevo ? 'Cancelar Nuevo Curso' : '+ Crear Nuevo Curso en Supabase'}
                  </Text>
                </TouchableOpacity>

                {/* Formulario Nuevo Curso */}
                {mostrarFormNuevo && (
                  <View style={styles.formCard}>
                    <Text style={styles.formCardTitle}>Registrar Curso en PostgreSQL</Text>

                    <Text style={styles.inputLabel}>TÍTULO DEL CURSO</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: Flutter & Supabase Mobile"
                      placeholderTextColor="#64748B"
                      value={nuevoTitulo}
                      onChangeText={setNuevoTitulo}
                    />

                    <Text style={styles.inputLabel}>SLUG / ID IDENTIFICADOR</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="flutter-supabase-mobile"
                      placeholderTextColor="#64748B"
                      value={nuevoId}
                      onChangeText={setNuevoId}
                      autoCapitalize="none"
                    />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>PRECIO (S/)</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={nuevoPrecio}
                          onChangeText={setNuevoPrecio}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>PRECIO REGULAR</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={nuevoPrecioReg}
                          onChangeText={setNuevoPrecioReg}
                        />
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>CATEGORÍA</Text>
                        <TextInput
                          style={styles.input}
                          value={nuevaCat}
                          onChangeText={setNuevaCat}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>HORAS ACADÉMICAS</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="numeric"
                          value={nuevasHoras}
                          onChangeText={setNuevasHoras}
                        />
                      </View>
                    </View>

                    <Text style={styles.inputLabel}>DESCRIPCIÓN</Text>
                    <TextInput
                      style={[styles.input, { height: 60 }]}
                      multiline
                      placeholder="Resumen del programa..."
                      placeholderTextColor="#64748B"
                      value={nuevaDesc}
                      onChangeText={setNuevaDesc}
                    />

                    <TouchableOpacity style={styles.guardarCursoBtn} onPress={handleCrearCurso}>
                      <Text style={styles.guardarCursoBtnText}>🚀 Insertar en Supabase (INSERT)</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Lista de Cursos */}
                <Text style={styles.sectionTitle}>Catálogo Activo en la Nube:</Text>
                {cursos.map((c) => (
                  <View key={c.id} style={styles.cursoItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.cursoTitulo}>{c.titulo}</Text>
                        <Text style={styles.cursoMeta}>
                          {c.categoria} · {c.duracion || '120 hrs'} · {c.nivel}
                        </Text>

                      </View>
                      <Text style={styles.cursoPrecio}>S/ {c.inversion.toFixed(2)}</Text>
                    </View>

                    {/* Editor de Precio Rápido */}
                    {cursoEditandoId === c.id ? (
                      <View style={styles.editPrecioRow}>
                        <TextInput
                          style={styles.editPrecioInput}
                          keyboardType="numeric"
                          placeholder={c.inversion.toString()}
                          placeholderTextColor="#64748B"
                          value={nuevoPrecioInput}
                          onChangeText={setNuevoPrecioInput}
                          autoFocus
                        />
                        <TouchableOpacity
                          style={styles.editPrecioSaveBtn}
                          onPress={() => handleGuardarPrecio(c.id)}
                        >
                          <Text style={styles.editPrecioSaveText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.editPrecioCancelBtn}
                          onPress={() => setCursoEditandoId(null)}
                        >
                          <Text style={styles.editPrecioCancelText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.cursoAcciones}>
                        <TouchableOpacity
                          style={styles.accionBtn}
                          onPress={() => {
                            setCursoEditandoId(c.id);
                            setNuevoPrecioInput(c.inversion.toString());
                          }}
                        >
                          <Ionicons name="pricetag-outline" size={14} color="#38BDF8" />
                          <Text style={styles.accionBtnText}>Editar Precio</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.accionBtn, { borderColor: '#EF4444' }]}
                          onPress={() => handleEliminarCurso(c.id, c.titulo)}
                        >
                          <Ionicons name="trash-outline" size={14} color="#EF4444" />
                          <Text style={[styles.accionBtnText, { color: '#EF4444' }]}>Desactivar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* ===================== TAB USUARIOS ===================== */}
            {tab === 'usuarios' && (
              <View>
                <Text style={styles.sectionTitle}>Usuarios en PostgreSQL (public.usuarios):</Text>
                {usuarios.length === 0 ? (
                  <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>
                    No hay usuarios registrados en la tabla aún.
                  </Text>
                ) : (
                  usuarios.map((u) => (
                    <View key={u.id} style={styles.usuarioItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.usuarioNombre}>{u.nombre}</Text>
                        <Text style={styles.usuarioEmail}>{u.email}</Text>
                        {u.cipColegiatura && (
                          <Text style={styles.usuarioCip}>Colegiatura: {u.cipColegiatura}</Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <View
                          style={[
                            styles.rolBadge,
                            u.rol === 'admin'
                              ? styles.rolBadgeAdmin
                              : u.rol === 'docente'
                              ? styles.rolBadgeDocente
                              : styles.rolBadgeAlumno,
                          ]}
                        >
                          <Text style={styles.rolBadgeText}>{u.rol.toUpperCase()}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          {u.rol !== 'admin' && (
                            <TouchableOpacity
                              style={styles.miniRolBtn}
                              onPress={() => handleCambiarRol(u, 'admin')}
                            >
                              <Text style={styles.miniRolText}>+Admin</Text>
                            </TouchableOpacity>
                          )}
                          {u.rol !== 'docente' && (
                            <TouchableOpacity
                              style={styles.miniRolBtn}
                              onPress={() => handleCambiarRol(u, 'docente')}
                            >
                              <Text style={styles.miniRolText}>+Docente</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#070D18',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '75%',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 17,
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#38BDF8',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#38BDF8',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  nuevoCursoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  nuevoCursoBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  formCardTitle: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#070D18',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 10,
  },
  guardarCursoBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  guardarCursoBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  cursoItem: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  cursoTitulo: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  cursoMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  cursoPrecio: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '800',
  },
  cursoAcciones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  accionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  accionBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  editPrecioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  editPrecioInput: {
    flex: 1,
    backgroundColor: '#070D18',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#F8FAFC',
    fontSize: 14,
  },
  editPrecioSaveBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editPrecioSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  editPrecioCancelBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editPrecioCancelText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  usuarioItem: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  usuarioNombre: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  usuarioEmail: {
    color: '#94A3B8',
    fontSize: 11,
  },
  usuarioCip: {
    color: '#38BDF8',
    fontSize: 10,
    marginTop: 2,
  },
  rolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rolBadgeAdmin: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  rolBadgeDocente: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  rolBadgeAlumno: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  rolBadgeText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
  },
  miniRolBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  miniRolText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
});
