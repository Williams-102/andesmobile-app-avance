// src/styles/splash.styles.ts
// Estilos desacoplados para la pantalla de Splash Screen (Módulo 05)

import { StyleSheet } from 'react-native';

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06152B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoCard: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    borderWidth: 1.5,
    borderColor: '#00B4D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#00B4D8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00B4D8',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },
  cipBadge: {
    marginTop: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cipBadgeText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '700',
  },
  loaderGroup: {
    marginTop: 48,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
