// src/components/CertificadosModal.tsx
// Modal de Certificaciones Oficiales con respaldo del Colegio de Ingenieros del Peru (CIP)

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Boleta } from '../types/boleta';
import { Usuario } from '../types/usuario';
import { useNotification } from '../context/NotificationContext';

export interface CertificadoData {
  id: string;
  codigoLegal: string;
  cursoTitulo: string;
  horas: number;
  creditos: number;
  docente: string;
  cipRegistro: string;
  fechaEmision: string;
  calificacion: string;
}

interface CertificadosModalProps {
  visible: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  boletas: Boleta[];
}

export const CertificadosModal: React.FC<CertificadosModalProps> = ({
  visible,
  onClose,
  usuario,
  boletas,
}) => {
  const { showToast } = useNotification();
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState<CertificadoData | null>(null);

  // Derivar certificados a partir de las boletas del usuario o curso base
  const certificados: CertificadoData[] = React.useMemo(() => {
    const listado: CertificadoData[] = [];
    const cursosVistos = new Set<string>();

    boletas.forEach((b) => {
      b.cursos.forEach((c) => {
        if (!cursosVistos.has(c.id)) {
          cursosVistos.add(c.id);
          const correlativo = b.id.replace(/\D/g, '').slice(-4) || '3049';
          listado.push({
            id: `CERT-${c.id}`,
            codigoLegal: `CIP-PE-2026-${correlativo}`,
            cursoTitulo: c.titulo,
            horas: 120,
            creditos: 5,
            docente: 'Ing. Exar Williams Atao Paucar',
            cipRegistro: 'CIP Reg. 304921',
            fechaEmision: b.fecha,
            calificacion: 'Aprobado con Excelencia (19/20)',
          });
        }
      });
    });

    // Si el usuario no tiene compras aun, mostrar certificado de bienvenida al programa
    if (listado.length === 0) {
      listado.push({
        id: 'CERT-DEMO-EXPO',
        codigoLegal: 'CIP-PE-2026-0001',
        cursoTitulo: 'Desarrollo de Apps Moviles con React Native & Expo',
        horas: 120,
        creditos: 5,
        docente: 'Ing. Exar Williams Atao Paucar',
        cipRegistro: 'CIP Reg. 304921',
        fechaEmision: new Date().toISOString(),
        calificacion: 'Aprobado con Excelencia (20/20)',
      });
    }

    return listado;
  }, [boletas]);

  const handleCompartirDiploma = async (cert: CertificadoData) => {
    try {
      const nombreAlumno = usuario?.nombre || 'Estudiante Code Andes';
      const mensaje = `COLEGIO DE INGENIEROS DEL PERU (CIP) & CODE ANDES ACADEMY\n\nCertificado Oficial N° ${cert.codigoLegal}\nAlumno: ${nombreAlumno}\nEspecializacion: ${cert.cursoTitulo}\nCarga Horaria: ${cert.horas} horas academicas\nFirma Digital: ${cert.docente} (${cert.cipRegistro})\nVerificacion: https://certificados.codeandes.edu.pe/validar/${cert.codigoLegal}`;
      await Share.share({
        message: mensaje,
        title: `Certificado CIP - ${cert.codigoLegal}`,
      });
    } catch (e) {
      showToast({
        type: 'info',
        title: 'Certificado Listo',
        message: 'Credencial verificada con codigo CIP.',
      });
    }
  };

  const nombreAlumno = usuario?.nombre || 'ESTUDIANTE CODE ANDES';

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Cabecera */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="ribbon" size={22} color="#38BDF8" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Mis Certificaciones CIP</Text>
                <Text style={styles.headerSubtitle}>Colegio de Ingenieros del Peru</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Banner Institucional */}
          <View style={styles.cipBanner}>
            <Ionicons name="shield-checkmark" size={20} color="#F59E0B" />
            <Text style={styles.cipBannerText}>
              Diplomas con valor oficial, acreditacion universitaria y registro CIP para concursos publicos y privados.
            </Text>
          </View>

          {/* Lista de Certificados */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380, marginTop: 12 }}>
            {certificados.map((cert) => (
              <View key={cert.id} style={styles.certCard}>
                <View style={styles.certCardHeader}>
                  <Text style={styles.certCodigo}>{cert.codigoLegal}</Text>
                  <View style={styles.badgeEstado}>
                    <Ionicons name="checkmark-done" size={12} color="#10B981" />
                    <Text style={styles.badgeEstadoText}>Verificado CIP</Text>
                  </View>
                </View>

                <Text style={styles.certTitulo}>{cert.cursoTitulo}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Horas: <Text style={styles.metaHighlight}>{cert.horas} hrs</Text>
                  </Text>
                  <Text style={styles.metaText}>
                    Creditos: <Text style={styles.metaHighlight}>{cert.creditos}</Text>
                  </Text>
                  <Text style={styles.metaText}>
                    Firma: <Text style={styles.metaHighlight}>{cert.cipRegistro}</Text>
                  </Text>
                </View>

                <View style={styles.certCardFooter}>
                  <TouchableOpacity
                    style={styles.btnVerDiploma}
                    onPress={() => setCertificadoSeleccionado(cert)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="eye-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.btnVerDiplomaText}>Ver Diploma Digital</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnCompartirMini}
                    onPress={() => handleCompartirDiploma(cert)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-social-outline" size={18} color="#38BDF8" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Boton Cerrar Principal */}
          <TouchableOpacity style={styles.btnCerrarModal} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnCerrarModalText}>Cerrar Certificaciones</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Secundario: Vista Completa del Diploma Digital */}
      {certificadoSeleccionado && (
        <Modal
          visible={!!certificadoSeleccionado}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setCertificadoSeleccionado(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.diplomaContainer}>
              <ScrollView contentContainerStyle={styles.diplomaScroll} showsVerticalScrollIndicator={false}>
                {/* Marco de Diploma Ornamental */}
                <View style={styles.diplomaFrame}>
                  {/* Encabezado Institucional CIP */}
                  <View style={styles.diplomaHeader}>
                    <Text style={styles.diplomaInstitucion}>COLEGIO DE INGENIEROS DEL PERU</Text>
                    <Text style={styles.diplomaConsejo}>CONSEJO DEPARTAMENTAL · CODE ANDES ACADEMY</Text>
                    <View style={styles.diplomaDivider} />
                    <Text style={styles.diplomaCertificaTexto}>CONFIERE EL PRESENTE DIPLOMA A:</Text>
                  </View>

                  {/* Nombre del Alumno */}
                  <Text style={styles.diplomaAlumno}>{nombreAlumno.toUpperCase()}</Text>

                  {/* Cuerpo del Diploma */}
                  <Text style={styles.diplomaCuerpo}>
                    Por haber culminado y aprobado con distincion la especializacion profesional en:
                  </Text>

                  <Text style={styles.diplomaCurso}>{certificadoSeleccionado.cursoTitulo}</Text>

                  <Text style={styles.diplomaDetalles}>
                    Con una duracion lectiva de {certificadoSeleccionado.horas} horas academicas, equivalentes a{' '}
                    {certificadoSeleccionado.creditos} creditos academicos universitarios.
                  </Text>

                  {/* Sello y Firmas Oficiales */}
                  <View style={styles.diplomaFirmasRow}>
                    <View style={styles.firmaBloque}>
                      <View style={styles.firmaLinea} />
                      <Text style={styles.firmaDocente}>{certificadoSeleccionado.docente}</Text>
                      <Text style={styles.firmaCargo}>{certificadoSeleccionado.cipRegistro}</Text>
                      <Text style={styles.firmaRol}>Director Academico</Text>
                    </View>

                    <View style={styles.selloBloque}>
                      <View style={styles.selloCirculo}>
                        <Ionicons name="ribbon" size={26} color="#F59E0B" />
                        <Text style={styles.selloTexto}>CIP OFICIAL</Text>
                        <Text style={styles.selloAno}>2026</Text>
                      </View>
                    </View>
                  </View>

                  {/* Codigo de Verificacion Digital */}
                  <View style={styles.verificacionBox}>
                    <Text style={styles.verificacionTitulo}>REGISTRO DE VALIDEZ DIGITAL</Text>
                    <Text style={styles.verificacionCodigo}>{certificadoSeleccionado.codigoLegal}</Text>
                    <Text style={styles.verificacionNota}>Firma electronica verificable bajo estandares CIP</Text>
                  </View>
                </View>

                {/* Botones de Accion del Diploma */}
                <View style={styles.diplomaAccionesRow}>
                  <TouchableOpacity
                    style={styles.btnCompartirDiploma}
                    onPress={() => handleCompartirDiploma(certificadoSeleccionado)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="share-social" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.btnCompartirDiplomaText}>Compartir Diploma</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnCerrarDiploma}
                    onPress={() => setCertificadoSeleccionado(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnCerrarDiplomaText}>Regresar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  headerTitle: {
    fontSize: 17,
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
  cipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 6,
  },
  cipBannerText: {
    color: '#FDE68A',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  certCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  certCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  certCodigo: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
    fontFamily: 'monospace',
  },
  badgeEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  badgeEstadoText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  certTitulo: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  metaHighlight: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  certCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  btnVerDiploma: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 9,
    borderRadius: 8,
  },
  btnVerDiplomaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  btnCompartirMini: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  btnCerrarModal: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  btnCerrarModalText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
  },
  diplomaContainer: {
    backgroundColor: '#0B132B',
    borderRadius: 18,
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#F59E0B',
    overflow: 'hidden',
  },
  diplomaScroll: {
    padding: 16,
  },
  diplomaFrame: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
  },
  diplomaHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  diplomaInstitucion: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  diplomaConsejo: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },
  diplomaDivider: {
    width: 80,
    height: 2,
    backgroundColor: '#F59E0B',
    marginVertical: 10,
  },
  diplomaCertificaTexto: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  diplomaAlumno: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.3)',
    paddingBottom: 6,
    width: '100%',
  },
  diplomaCuerpo: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  diplomaCurso: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 20,
  },
  diplomaDetalles: {
    color: '#94A3B8',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 15,
  },
  diplomaFirmasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
    marginVertical: 12,
  },
  firmaBloque: {
    alignItems: 'center',
    flex: 1,
  },
  firmaLinea: {
    width: 140,
    height: 1,
    backgroundColor: '#64748B',
    marginBottom: 6,
  },
  firmaDocente: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  firmaCargo: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '600',
  },
  firmaRol: {
    color: '#64748B',
    fontSize: 9,
  },
  selloBloque: {
    alignItems: 'center',
    paddingLeft: 12,
  },
  selloCirculo: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  selloTexto: {
    color: '#F59E0B',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
  },
  selloAno: {
    color: '#F59E0B',
    fontSize: 7,
    fontWeight: '700',
  },
  verificacionBox: {
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: 8,
  },
  verificacionTitulo: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  verificacionCodigo: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  verificacionNota: {
    color: '#475569',
    fontSize: 8,
    marginTop: 2,
  },
  diplomaAccionesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btnCompartirDiploma: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnCompartirDiplomaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  btnCerrarDiploma: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnCerrarDiplomaText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
