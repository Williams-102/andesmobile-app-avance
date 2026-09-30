// src/styles/cursoDetalle.styles.ts
// Estilos desacoplados para la pantalla de Detalle Dinámico de Curso (Módulo 04 y 05)

import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const cursoDetalleStyles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 40,
    backgroundColor: Colors.background,
  },
  banner: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: Colors.surface,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0369A1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 28,
  },
  instructor: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 18,
  },
  precioCaja: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  precioEtiqueta: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  precioValor: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.secondary,
    marginTop: 4,
  },
  precioSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 10,
  },
  descripcion: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
    marginBottom: 18,
  },
  reqFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reqTexto: {
    color: '#94A3B8',
    fontSize: 13,
    flex: 1,
  },
  cipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 12,
    marginBottom: 20,
  },
  cipTitle: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  cipSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  botonComprar: {
    flexDirection: 'row',
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
  botonEnCarrito: {
    backgroundColor: '#059669', // Verde esmeralda indicando que ya está en carrito
  },
  botonComprarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  botonVolver: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonVolverTexto: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
