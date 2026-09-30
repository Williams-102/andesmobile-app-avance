// src/styles/catalogo.styles.ts
// Estilos desacoplados para la pantalla de Catálogo de Cursos (Módulos 02 y 03)

import { StyleSheet } from 'react-native';

export const getCatalogoStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkMode ? '#0F0F12' : '#F8FAFC',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 14,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: isDarkMode ? '#FFFFFF' : '#0F172A',
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 13,
      color: isDarkMode ? '#9CA3AF' : '#64748B',
      marginTop: 2,
    },
    themeToggle: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      shadowColor: '#007AFF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    themeToggleText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    searchContainer: {
      paddingHorizontal: 18,
      marginBottom: 12,
    },
    searchInput: {
      backgroundColor: isDarkMode ? '#18181B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDarkMode ? '#27272A' : '#E2E8F0',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: isDarkMode ? '#FFFFFF' : '#0F172A',
      fontSize: 14,
    },
    categoriesWrapper: {
      marginBottom: 14,
    },
    categoriesContent: {
      paddingHorizontal: 18,
      gap: 10,
    },
    categoryPill: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 24,
    },
    categoryPillActive: {
      backgroundColor: '#007AFF',
    },
    categoryPillInactive: {
      backgroundColor: isDarkMode ? '#1E1E24' : '#E2E8F0',
    },
    categoryPillText: {
      fontSize: 14,
      fontWeight: '600',
    },
    categoryPillTextActive: {
      color: '#FFFFFF',
    },
    categoryPillTextInactive: {
      color: isDarkMode ? '#9CA3AF' : '#475569',
    },
    listContent: {
      paddingHorizontal: 18,
      paddingBottom: 24,
    },
    emptyContainer: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyText: {
      color: isDarkMode ? '#71717A' : '#94A3B8',
      fontSize: 14,
    },
  });
