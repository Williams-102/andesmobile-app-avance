// src/styles/tarjetaProducto.styles.ts
// Estilos desacoplados para el componente TarjetaProducto (Módulos 02 y 03)

import { StyleSheet } from 'react-native';

export const getTarjetaProductoStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDarkMode ? '#18181B' : '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#27272A' : '#E2E8F0',
      marginBottom: 16,
      overflow: 'hidden',
      padding: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    imagen: {
      width: '100%',
      height: 180,
      borderRadius: 12,
      backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0',
    },
    content: {
      marginTop: 12,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badge: {
      backgroundColor: '#0284C7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    ratingText: {
      color: isDarkMode ? '#E4E4E7' : '#374151',
      fontSize: 13,
      fontWeight: '600',
    },
    titulo: {
      color: isDarkMode ? '#FFFFFF' : '#0F172A',
      fontSize: 18,
      fontWeight: '700',
      marginTop: 8,
      lineHeight: 24,
    },
    docente: {
      color: isDarkMode ? '#A1A1AA' : '#64748B',
      fontSize: 14,
      marginTop: 4,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#27272A' : '#F1F5F9',
    },
    inversionLabel: {
      color: isDarkMode ? '#A1A1AA' : '#64748B',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: '500',
    },
    precio: {
      color: '#10B981',
      fontSize: 20,
      fontWeight: '800',
      marginTop: 2,
    },
    botonDetalle: {
      backgroundColor: '#0284C7',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    botonTexto: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
  });
