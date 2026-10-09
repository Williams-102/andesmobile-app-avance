// src/context/NotificationContext.tsx
// Sistema global de Notificaciones Toast (Auto-dismiss) y Modales de Confirmación
// Reemplaza los Alert.alert nativos por modales y banners modernos con @expo/vector-icons

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
  actionText?: string;
  onAction?: () => void;
}

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger' | 'warning';
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface NotificationContextProps {
  showToast: (config: ToastConfig | string, message?: string, type?: ToastType) => void;
  hideToast: () => void;
  showConfirm: (config: ConfirmConfig) => void;
  hideConfirm: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();

  // ---------------------------------------------------------------------------
  // 1. ESTADO DEL TOAST FLOTANTE (AUTO-DISMISS)
  // ---------------------------------------------------------------------------
  const [toastVisible, setToastVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    title: '',
    message: '',
    type: 'info',
    duration: 3500,
  });

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastVisible(false);
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (config: ToastConfig | string, message?: string, type: ToastType = 'info') => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      let finalConfig: ToastConfig;
      if (typeof config === 'string') {
        finalConfig = {
          title: config,
          message: message || '',
          type: type || 'info',
          duration: 3500,
        };
      } else {
        finalConfig = {
          ...config,
          type: config.type || 'info',
          duration: config.duration ?? 3500,
        };
      }

      setToastConfig(finalConfig);
      setToastVisible(true);

      translateY.setValue(-120);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const dur = finalConfig.duration ?? 3500;
      if (dur > 0) {
        timerRef.current = setTimeout(() => {
          hideToast();
        }, dur);
      }
    },
    [translateY, opacity, hideToast]
  );

  // ---------------------------------------------------------------------------
  // 2. ESTADO DEL MODAL DE CONFIRMACIÓN
  // ---------------------------------------------------------------------------
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const showConfirm = useCallback((config: ConfirmConfig) => {
    setConfirmConfig(config);
    setConfirmVisible(true);
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmVisible(false);
    setConfirmConfig(null);
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmConfig) return;
    const action = confirmConfig.onConfirm;
    hideConfirm();
    try {
      await action();
    } catch (err) {
      console.error('[NotificationProvider] Error en acción de confirmación:', err);
    }
  };

  const handleCancelAction = () => {
    if (confirmConfig?.onCancel) {
      confirmConfig.onCancel();
    }
    hideConfirm();
  };

  const getToastTheme = (t?: ToastType) => {
    switch (t) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: '#10B981',
          bg: '#064E3B',
          borderColor: '#059669',
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: '#EF4444',
          bg: '#450A0A',
          borderColor: '#DC2626',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: '#F59E0B',
          bg: '#451A03',
          borderColor: '#D97706',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: '#38BDF8',
          bg: '#082F49',
          borderColor: '#0284C7',
        };
    }
  };

  const toastTheme = getToastTheme(toastConfig.type);

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        hideToast,
        showConfirm,
        hideConfirm,
      }}
    >
      {children}

      {/* TOAST FLOTANTE SUPERIOR */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toastWrapper,
            {
              top: Math.max(insets.top + 8, 16),
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideToast}
            style={[
              styles.toastCard,
              {
                borderColor: toastTheme.borderColor,
              },
            ]}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: toastTheme.bg },
              ]}
            >
              <Ionicons name={toastTheme.icon} size={22} color={toastTheme.color} />
            </View>

            <View style={styles.toastTextContainer}>
              <Text style={styles.toastTitle}>{toastConfig.title}</Text>
              {toastConfig.message ? (
                <Text style={styles.toastMessage} numberOfLines={3}>
                  {toastConfig.message}
                </Text>
              ) : null}

              {toastConfig.actionText && toastConfig.onAction && (
                <TouchableOpacity
                  style={styles.toastActionBtn}
                  onPress={() => {
                    hideToast();
                    toastConfig.onAction?.();
                  }}
                >
                  <Text style={[styles.toastActionText, { color: toastTheme.color }]}>
                    {toastConfig.actionText}
                  </Text>
                  <Ionicons name="arrow-forward" size={13} color={toastTheme.color} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={hideToast}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* MODAL DE CONFIRMACIÓN MODERNO */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelAction}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.confirmIconBadge,
                confirmConfig?.type === 'danger'
                  ? styles.confirmBadgeDanger
                  : confirmConfig?.type === 'warning'
                  ? styles.confirmBadgeWarning
                  : styles.confirmBadgePrimary,
              ]}
            >
              <Ionicons
                name={
                  confirmConfig?.icon ||
                  (confirmConfig?.type === 'danger'
                    ? 'trash-outline'
                    : confirmConfig?.type === 'warning'
                    ? 'alert-circle-outline'
                    : 'help-circle-outline')
                }
                size={28}
                color={
                  confirmConfig?.type === 'danger'
                    ? '#EF4444'
                    : confirmConfig?.type === 'warning'
                    ? '#F59E0B'
                    : '#38BDF8'
                }
              />
            </View>

            <Text style={styles.confirmTitle}>{confirmConfig?.title}</Text>
            <Text style={styles.confirmMessage}>{confirmConfig?.message}</Text>

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={handleCancelAction}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>
                  {confirmConfig?.cancelText || 'Cancelar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnConfirm,
                  confirmConfig?.type === 'danger'
                    ? styles.btnConfirmDanger
                    : confirmConfig?.type === 'warning'
                    ? styles.btnConfirmWarning
                    : styles.btnConfirmPrimary,
                ]}
                onPress={handleConfirmAction}
                activeOpacity={0.85}
              >
                <Text style={styles.btnConfirmText}>
                  {confirmConfig?.confirmText || 'Confirmar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </NotificationContext.Provider>
  );
};

export function useNotification(): NotificationContextProps {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser utilizado dentro de un NotificationProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  toastCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastTextContainer: {
    flex: 1,
    paddingRight: 6,
  },
  toastTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  toastMessage: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
  toastActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  toastActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  confirmIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmBadgePrimary: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
  },
  confirmBadgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  confirmBadgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
  },
  confirmTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnCancelText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnConfirmPrimary: {
    backgroundColor: '#0284C7',
  },
  btnConfirmDanger: {
    backgroundColor: '#DC2626',
  },
  btnConfirmWarning: {
    backgroundColor: '#D97706',
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
