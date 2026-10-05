// src/services/supabase.ts
// Cliente centralizado de Supabase con soporte para AsyncStorage y Polyfill de URL (Módulo 07)

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validar formato mínimo de URL para evitar errores de inicialización si aún no se configura el proyecto
const isValidUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');
const supabaseUrl = isValidUrl ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder_anon_key';

export const isSupabaseConfigured = isValidUrl && !rawUrl.includes('xyzcompany');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,             // Persistencia de sesión en disco móvil
    autoRefreshToken: true,            // Renovación automática de token JWT
    persistSession: true,              // No cerrar sesión al reiniciar app
    detectSessionInUrl: false,         // Deshabilitar en móviles (no usamos redirección web)
  },
});
