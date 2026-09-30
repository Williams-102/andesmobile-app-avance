// src/controllers/useAuthController.ts
// Controlador de lógica de autenticación, formularios y navegación de bienvenida (Módulo 05)

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export function useAuthController() {
  const router = useRouter();
  const { login, registro, cargando, estaAutenticado } = useAuth();

  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para Registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCip, setRegCip] = useState('');

  // Mensajes de validación / error
  const [errorMsg, setErrorMsg] = useState('');

  // Rellenar credenciales demo para prueba en clase
  const handleRellenarDemo = useCallback(() => {
    setLoginEmail('alumno@codeandes.edu.pe');
    setLoginPassword('123456');
    setErrorMsg('');
  }, []);

  // Enviar Login
  const handleLoginSubmit = useCallback(async () => {
    setErrorMsg('');
    if (!loginEmail.trim()) {
      setErrorMsg('Ingresa tu correo institucional.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMsg('Ingresa tu contraseña.');
      return;
    }

    try {
      await login(loginEmail.trim());
      router.replace('/(tabs)/catalogo');
    } catch {
      setErrorMsg('Error al conectar con el servidor.');
    }
  }, [loginEmail, loginPassword, login, router]);

  // Enviar Registro
  const handleRegistroSubmit = useCallback(async () => {
    setErrorMsg('');
    if (!regNombre.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 4) {
      setErrorMsg('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    try {
      await registro({
        nombre: regNombre.trim(),
        email: regEmail.trim(),
        cipColegiatura: regCip.trim() || undefined,
      });
      router.replace('/(tabs)/catalogo');
    } catch {
      setErrorMsg('No se pudo completar el registro.');
    }
  }, [regNombre, regEmail, regPassword, regCip, registro, router]);

  // Navegación rápida entre pantallas
  const handleIrALogin = useCallback(() => {
    setErrorMsg('');
    router.push('/(auth)/login');
  }, [router]);

  const handleIrARegistro = useCallback(() => {
    setErrorMsg('');
    router.push('/(auth)/registro');
  }, [router]);

  const handleVolver = useCallback(() => {
    setErrorMsg('');
    router.back();
  }, [router]);

  const handleContinuarComoInvitado = useCallback(() => {
    router.replace('/(tabs)/catalogo');
  }, [router]);

  return {
    cargando,
    estaAutenticado,
    errorMsg,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    regNombre,
    setRegNombre,
    regEmail,
    setRegEmail,
    regPassword,
    setRegPassword,
    regCip,
    setRegCip,
    handleRellenarDemo,
    handleLoginSubmit,
    handleRegistroSubmit,
    handleIrALogin,
    handleIrARegistro,
    handleVolver,
    handleContinuarComoInvitado,
  };
}
