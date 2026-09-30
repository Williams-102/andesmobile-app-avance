// src/styles/carrito.styles.ts
// Estilos desacoplados para la pantalla de Carrito de Compras (Módulo 05)

import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const carritoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  headerFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  encabezado: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  vaciarTexto: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitulo: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  itemDocente: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  itemPrecio: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  botonQuitar: {
    padding: 8,
    marginLeft: 8,
  },
  resumenCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
    marginBottom: 20,
  },
  resumenTitulo: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  resumenFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumenLabel: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  resumenValor: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  resumenTotalFila: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 6,
  },
  resumenTotalLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  resumenTotalValor: {
    color: Colors.secondary,
    fontSize: 20,
    fontWeight: '800',
  },
  botonCheckout: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  botonCheckoutTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  vacioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  tituloVacio: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
  },
  subtituloVacio: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  botonExplorar: {
    marginTop: 20,
    backgroundColor: '#0284C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  botonExplorarTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
