// src/components/PanelAuditoriaSeguridadRendimiento.tsx
// Panel interactivo de Auditoria de Ciberseguridad, Profiling de Rendimiento y Comandos ADB.
// Modulo 10: Optimizacion, Ciberseguridad Movil y Pruebas en Hardware Real.
// Code Andes Academy - Docente: Ing. Exar Williams Atao Paucar (CIP Reg. 304921)
// CERO EMOJIS O EMOTICONES.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SecurityAuditService, DiagnosticoSeguridad } from '../services/SecurityAuditService';
import { PerformanceMonitorService, DiagnosticoRendimientoGlobal } from '../services/PerformanceMonitorService';

interface PanelAuditoriaProps {
  visible: boolean;
  onClose: () => void;
}

type TabTipo = 'ciberseguridad' | 'rendimiento' | 'adb_emulador';

export const PanelAuditoriaSeguridadRendimiento: React.FC<PanelAuditoriaProps> = ({
  visible,
  onClose,
}) => {
  const [tabActiva, setTabActiva] = useState<TabTipo>('ciberseguridad');
  const [cargandoSeguridad, setCargandoSeguridad] = useState<boolean>(false);
  const [diagnosticoSeguridad, setDiagnosticoSeguridad] = useState<DiagnosticoSeguridad | null>(null);
  const [diagnosticoRendimiento, setDiagnosticoRendimiento] = useState<DiagnosticoRendimientoGlobal>(
    PerformanceMonitorService.obtenerDiagnostico()
  );

  // Suscripcion a telemetria de rendimiento
  useEffect(() => {
    if (!visible) return;
    const desuscribir = PerformanceMonitorService.suscribir((diag) => {
      setDiagnosticoRendimiento(diag);
    });
    ejecutarAuditoriaSeguridad();
    return () => desuscribir();
  }, [visible]);

  const ejecutarAuditoriaSeguridad = async () => {
    setCargandoSeguridad(true);
    try {
      const resultado = await SecurityAuditService.ejecutarAuditoriaCompleta();
      setDiagnosticoSeguridad(resultado);
    } finally {
      setCargandoSeguridad(false);
    }
  };

  const handleCompartirReporte = async () => {
    const reporteTexto = [
      '==================================================',
      'CODE ANDES ACADEMY - REPORTE DE CIBERSEGURIDAD & RENDIMIENTO',
      'ESPECIALIZACION EN DESARROLLO MOVIL - MODULO 10',
      '==================================================',
      `Fecha: ${diagnosticoSeguridad?.fechaAuditoria || 'Hoy'}`,
      `Nivel de Riesgo: ${diagnosticoSeguridad?.nivelRiesgo || 'BAJO'}`,
      `Auditoria: ${diagnosticoSeguridad?.puntosAprobados}/${diagnosticoSeguridad?.puntosTotales} puntos aprobados`,
      `FPS Estimados: ${diagnosticoRendimiento.fpsEstimados} FPS`,
      `Total Renders Auditados: ${diagnosticoRendimiento.totalRendersGlobales}`,
      `Cuadros Lentos (>16.6ms): ${diagnosticoRendimiento.totalCuadrosLentos}`,
      '==================================================',
    ].join('\n');

    await Share.share({
      title: 'Reporte Tecnico Modulo 10 - Code Andes',
      message: reporteTexto,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Cabecera */}
        <View style={styles.header}>
          <View>
            <View style={styles.tagModulo}>
              <Text style={styles.tagModuloTexto}>MODULO 10 · HARDENING & PROFILING</Text>
            </View>
            <Text style={styles.tituloHeader}>Centro de Control de Calidad</Text>
            <Text style={styles.subtituloHeader}>Ciberseguridad, Rendimiento y Android ADB</Text>
          </View>
          <TouchableOpacity style={styles.botonCerrar} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Selector de Pestañas */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, tabActiva === 'ciberseguridad' && styles.tabBtnActiva]}
            onPress={() => setTabActiva('ciberseguridad')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={tabActiva === 'ciberseguridad' ? '#00B4D8' : '#94A3B8'}
            />
            <Text style={[styles.tabTexto, tabActiva === 'ciberseguridad' && styles.tabTextoActiva]}>
              Ciberseguridad
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tabActiva === 'rendimiento' && styles.tabBtnActiva]}
            onPress={() => setTabActiva('rendimiento')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="speedometer"
              size={16}
              color={tabActiva === 'rendimiento' ? '#10B981' : '#94A3B8'}
            />
            <Text style={[styles.tabTexto, tabActiva === 'rendimiento' && styles.tabTextoActiva]}>
              Rendimiento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tabActiva === 'adb_emulador' && styles.tabBtnActiva]}
            onPress={() => setTabActiva('adb_emulador')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="hardware-chip"
              size={16}
              color={tabActiva === 'adb_emulador' ? '#8B5CF6' : '#94A3B8'}
            />
            <Text style={[styles.tabTexto, tabActiva === 'adb_emulador' && styles.tabTextoActiva]}>
              ADB & Emulador
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido Dinamico */}
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: CIBERSEGURIDAD */}
          {tabActiva === 'ciberseguridad' && (
            <View style={styles.tabContent}>
              {/* Tarjeta de Resumen de Riesgo */}
              <View style={styles.tarjetaResumen}>
                <View style={styles.resumenFila}>
                  <View>
                    <Text style={styles.resumenLabel}>Nivel de Riesgo Global</Text>
                    <Text
                      style={[
                        styles.resumenValor,
                        diagnosticoSeguridad?.nivelRiesgo === 'BAJO'
                          ? { color: '#10B981' }
                          : { color: '#F59E0B' },
                      ]}
                    >
                      {diagnosticoSeguridad?.nivelRiesgo || 'EVALUANDO...'}
                    </Text>
                  </View>
                  <View style={styles.badgePuntos}>
                    <Text style={styles.badgePuntosTexto}>
                      {diagnosticoSeguridad?.puntosAprobados || 0} /{' '}
                      {diagnosticoSeguridad?.puntosTotales || 0} Aprobados
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.botonReescanear}
                  onPress={ejecutarAuditoriaSeguridad}
                  activeOpacity={0.8}
                  disabled={cargandoSeguridad}
                >
                  {cargandoSeguridad ? (
                    <ActivityIndicator size="small" color="#040D1C" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={16} color="#040D1C" />
                      <Text style={styles.botonReescanearTexto}>Reescanear Vulnerabilidades</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Lista de Items Auditados */}
              <Text style={styles.seccionTitulo}>Vulnerabilidades y Controles Evaluados</Text>

              {diagnosticoSeguridad?.items.map((item) => (
                <View key={item.id} style={styles.itemAuditoria}>
                  <View style={styles.itemHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.itemId}>{item.id}</Text>
                      <Text style={styles.itemNombre}>{item.nombre}</Text>
                    </View>
                    <View
                      style={[
                        styles.itemBadge,
                        item.estado === 'APROBADO' && styles.badgeVerde,
                        item.estado === 'ADVERTENCIA' && styles.badgeAmarillo,
                        item.estado === 'CRITICO' && styles.badgeRojo,
                      ]}
                    >
                      <Text style={styles.itemBadgeTexto}>{item.estado}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemDescripcion}>{item.descripcion}</Text>
                  <View style={styles.itemRecomendacionBox}>
                    <Text style={styles.itemRecomendacionLabel}>Recomendacion Tecnica:</Text>
                    <Text style={styles.itemRecomendacionTexto}>{item.recomendacionTecnica}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 2: RENDIMIENTO Y PROFILING */}
          {tabActiva === 'rendimiento' && (
            <View style={styles.tabContent}>
              {/* Tarjetas de Metricas Superiores */}
              <View style={styles.metricasGrid}>
                <View style={styles.metricaCard}>
                  <Text style={styles.metricaValor}>{diagnosticoRendimiento.fpsEstimados}</Text>
                  <Text style={styles.metricaLabel}>FPS Estimados</Text>
                  <Text style={styles.metricaSub}>Objetivo: 60 FPS</Text>
                </View>

                <View style={styles.metricaCard}>
                  <Text style={styles.metricaValor}>
                    {diagnosticoRendimiento.totalCuadrosLentos}
                  </Text>
                  <Text style={styles.metricaLabel}>Frames Lentos</Text>
                  <Text style={styles.metricaSub}>&gt; 16.6ms por render</Text>
                </View>

                <View style={styles.metricaCard}>
                  <Text style={styles.metricaValor}>
                    {diagnosticoRendimiento.totalRendersGlobales}
                  </Text>
                  <Text style={styles.metricaLabel}>Renders Totales</Text>
                  <Text style={styles.metricaSub}>Ciclos auditados</Text>
                </View>
              </View>

              {/* Boton de Limpieza */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 10 }}>
                <TouchableOpacity
                  style={styles.botonLimpiar}
                  onPress={() => PerformanceMonitorService.limpiar()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={14} color="#94A3B8" />
                  <Text style={styles.botonLimpiarTexto}>Reiniciar Metricas</Text>
                </TouchableOpacity>
              </View>

              {/* Detalle por Componente */}
              <Text style={styles.seccionTitulo}>Telemetria por Componente (React Profiler)</Text>

              {diagnosticoRendimiento.componentes.length === 0 ? (
                <View style={styles.cajaVacia}>
                  <Text style={styles.cajaVaciaTexto}>
                    Interactua con el catalogo o carrito para capturar metricas de renderizado.
                  </Text>
                </View>
              ) : (
                diagnosticoRendimiento.componentes.map((comp) => (
                  <View key={comp.nombre} style={styles.compCard}>
                    <View style={styles.compHeader}>
                      <Text style={styles.compNombre}>{comp.nombre}</Text>
                      <Text style={styles.compRenders}>{comp.totalRenders} Renders</Text>
                    </View>
                    <View style={styles.compStatsRow}>
                      <Text style={styles.compStat}>
                        Promedio:{' '}
                        <Text style={{ color: '#00B4D8', fontWeight: '700' }}>
                          {comp.duracionPromedioMs} ms
                        </Text>
                      </Text>
                      <Text style={styles.compStat}>
                        Pico Max:{' '}
                        <Text
                          style={{
                            color: comp.duracionMaximaMs > 16.6 ? '#F59E0B' : '#10B981',
                            fontWeight: '700',
                          }}
                        >
                          {comp.duracionMaximaMs} ms
                        </Text>
                      </Text>
                      <Text style={styles.compStat}>
                        Frames Lentos:{' '}
                        <Text style={{ color: comp.cuadrosLentosDetectados > 0 ? '#EF4444' : '#10B981' }}>
                          {comp.cuadrosLentosDetectados}
                        </Text>
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 3: ANDROID ADB Y EMULADOR AVD */}
          {tabActiva === 'adb_emulador' && (
            <View style={styles.tabContent}>
              <View style={styles.guiaCard}>
                <Text style={styles.guiaTitulo}>Comandos Esenciales de Android ADB (Terminal)</Text>
                <Text style={styles.guiaDesc}>
                  Utiliza estos comandos en tu terminal de desarrollo para interactuar directamente
                  con tu celular fisico o con el emulador Android Studio AVD Pixel:
                </Text>

                <View style={styles.comandoItem}>
                  <Text style={styles.comandoTexto}>adb devices</Text>
                  <Text style={styles.comandoExplicacion}>
                    Lista todos los celulares fisicos y emuladores conectados por USB o Wi-Fi.
                  </Text>
                </View>

                <View style={styles.comandoItem}>
                  <Text style={styles.comandoTexto}>adb reverse tcp:8081 tcp:8081</Text>
                  <Text style={styles.comandoExplicacion}>
                    Crea un tunel inverso para que el celular acceda al servidor Metro de tu PC
                    mediante cable USB sin depender de la red Wi-Fi.
                  </Text>
                </View>

                <View style={styles.comandoItem}>
                  <Text style={styles.comandoTexto}>
                    adb logcat *:S ReactNative:V ReactNativeJS:V
                  </Text>
                  <Text style={styles.comandoExplicacion}>
                    Filtra y muestra exclusivamente los logs nativos y mensajes de consola de React
                    Native en tiempo real.
                  </Text>
                </View>

                <View style={styles.comandoItem}>
                  <Text style={styles.comandoTexto}>adb shell input keyevent 82</Text>
                  <Text style={styles.comandoExplicacion}>
                    Abre de forma remota el Developer Menu de Expo en la pantalla del emulador
                    o celular.
                  </Text>
                </View>
              </View>

              <View style={styles.guiaCard}>
                <Text style={styles.guiaTitulo}>Configuracion de Emulador AVD Pixel</Text>
                <View style={styles.pasosList}>
                  <Text style={styles.pasoItem}>
                    1. Abre Android Studio &gt; Virtual Device Manager.
                  </Text>
                  <Text style={styles.pasoItem}>
                    2. Selecciona dispositivo Pixel 7 o Pixel 8 con imagen de sistema Android 14
                    (API 34) o Android 15 (API 35).
                  </Text>
                  <Text style={styles.pasoItem}>
                    3. Asigna un minimo de 4096 MB de RAM y habilita Graphics: Hardware - GLES 2.0.
                  </Text>
                  <Text style={styles.pasoItem}>
                    4. Inicia la app con: <Text style={{ color: '#00B4D8' }}>npm run android</Text>
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer con Boton de Compartir */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.botonExportar}
            onPress={handleCompartirReporte}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={18} color="#00B4D8" />
            <Text style={styles.botonExportarTexto}>Exportar Reporte Tecnico</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040D1C',
  },
  header: {
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#06152B',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 180, 216, 0.25)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagModulo: {
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tagModuloTexto: {
    color: '#00B4D8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tituloHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  subtituloHeader: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  botonCerrar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#07192F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActiva: {
    borderBottomColor: '#00B4D8',
    backgroundColor: 'rgba(0, 180, 216, 0.08)',
  },
  tabTexto: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextoActiva: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  tabContent: {
    gap: 14,
  },
  tarjetaResumen: {
    backgroundColor: '#0D1F38',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 216, 0.3)',
  },
  resumenFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resumenLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  resumenValor: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  badgePuntos: {
    backgroundColor: 'rgba(0, 180, 216, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 216, 0.3)',
  },
  badgePuntosTexto: {
    color: '#90E0EF',
    fontSize: 12,
    fontWeight: '700',
  },
  botonReescanear: {
    backgroundColor: '#00B4D8',
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  botonReescanearTexto: {
    color: '#040D1C',
    fontSize: 12,
    fontWeight: '800',
  },
  seccionTitulo: {
    color: '#00B4D8',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  itemAuditoria: {
    backgroundColor: '#0D1F38',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemId: {
    color: '#00B4D8',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  itemNombre: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  itemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeVerde: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeAmarillo: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  badgeRojo: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  itemBadgeTexto: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  itemDescripcion: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 1.4,
  },
  itemRecomendacionBox: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 8,
    borderRadius: 6,
  },
  itemRecomendacionLabel: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemRecomendacionTexto: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  metricasGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricaCard: {
    flex: 1,
    backgroundColor: '#0D1F38',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 216, 0.25)',
    alignItems: 'center',
  },
  metricaValor: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  metricaLabel: {
    color: '#00B4D8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  metricaSub: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 2,
  },
  botonLimpiar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  botonLimpiarTexto: {
    color: '#94A3B8',
    fontSize: 11,
  },
  cajaVacia: {
    backgroundColor: '#0D1F38',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cajaVaciaTexto: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  compCard: {
    backgroundColor: '#0D1F38',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  compHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compNombre: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  compRenders: {
    color: '#94A3B8',
    fontSize: 11,
  },
  compStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compStat: {
    color: '#94A3B8',
    fontSize: 11,
  },
  guiaCard: {
    backgroundColor: '#0D1F38',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  guiaTitulo: {
    color: '#C4B5FD',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  guiaDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 1.45,
    marginBottom: 12,
  },
  comandoItem: {
    backgroundColor: '#06152B',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  comandoTexto: {
    color: '#00B4D8',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  comandoExplicacion: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 1.35,
  },
  pasosList: {
    gap: 8,
  },
  pasoItem: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 1.4,
  },
  footer: {
    padding: 16,
    backgroundColor: '#06152B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  botonExportar: {
    borderWidth: 1,
    borderColor: '#00B4D8',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
  },
  botonExportarTexto: {
    color: '#00B4D8',
    fontSize: 13,
    fontWeight: '700',
  },
});
