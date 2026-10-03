// src/hooks/useNetworkStatus.ts
// Custom Hook para monitoreo reactivo de la red con NetInfo

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NetworkStatus } from '../types/offline';

export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // 1. Consulta inicial del estado actual
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? false);
      setConnectionType(state.type);
    });

    // 2. Suscripción reactiva a cambios de red en tiempo real
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected ?? false;
      setIsConnected(online);
      setConnectionType(state.type);
    });

    // 3. Limpieza para evitar memory leaks
    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isOffline: !isConnected,
    connectionType,
  };
}
