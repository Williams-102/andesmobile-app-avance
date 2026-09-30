# 📱 Andes Mobile App — Avance Módulo 05 (Code Andes Academy)

> **Programa de Especialización Profesional:** Desarrollo de Aplicaciones Móviles Android e iOS con React Native & Expo  
> **Docente:** Exar Williams Atao Paucar  
> **Institución:** Code Andes Academy  
> **Respaldo Académico:** Colegio de Ingenieros del Perú (CIP)  

---

## 🎯 ¿Qué incluye este repositorio?
Este repositorio contiene el código fuente completo y optimizado hasta el **Módulo 05: Gestión de Estado Global Reactivo con React Hooks y Context API**, estructurado bajo **Clean Architecture**:

* 🌟 **Splash Screen & Onboarding:** Pantalla de carga con verificación de sesión y bienvenida institucional.
* 🔐 **Flujo de Autenticación:** Pantalla de Login con atajo demo (`⚡ Rellenar Demo`) y pantalla de Registro de nuevo alumno.
* 🌐 **Estado Global (Context API):**
  * `AuthContext`: Sesión activa del usuario, nombre, rol y número de colegiatura CIP.
  * `CartContext`: Carrito de compras reactivo, agregación sin duplicados, cálculos automáticos de subtotal, IGV (18%) y total.
* 🔴 **Badge Dinámico en Tabs:** El contador de la pestaña Carrito se actualiza en vivo al agregar o quitar cursos.
* 🏛️ **Clean Architecture:** Desacoplamiento estricto entre Vistas (`app/`), Controladores (`controllers/`) y Estilos (`styles/`).
* 📘 **TypeScript Estricto:** 100% libre de errores de compilación (`tsc --noEmit` exit code 0).

---

## 🚀 Guía Rápida para Estudiantes (Clone & Run)

Si te atrasaste en las clases o deseas tener el proyecto funcionando de inmediato en tu computadora y celular, sigue estos sencillos pasos:

### 1️⃣ Requisitos Previos en tu Computadora
Asegúrate de tener instalados los siguientes programas:
* **Node.js:** Versión 18 o 20 LTS ([Descargar Node.js](https://nodejs.org/))
* **Git:** Para clonar el código ([Descargar Git](https://git-scm.com/))
* **Visual Studio Code:** Editor recomendado
* **Expo Go:** App instalada en tu smartphone ([Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) o [iOS App Store](https://apps.apple.com/app/expo-go/id982107779))

---

### 2️⃣ Clonar el Repositorio (Si eres nuevo o empiezas de cero)
Abre tu terminal (o Git Bash) y ejecuta:

```bash
git clone https://github.com/Williams-102/andesmobile-app-avance.git
cd andesmobile-app-avance
npm install
npx expo start
```

---

### 🔄 ¿Ya tenías el proyecto clonado antes y solo quieres descargar los nuevos cambios del profesor?
Si ya tenías la carpeta del proyecto en tu computadora de clases anteriores y solo quieres **llamar / descargar la última versión del Módulo 05**, sigue estos pasos dentro de tu carpeta `andesmobile-app-avance`:

#### Paso 1: Guardar o apartar cambios locales (para no perder nada)
Si estuviste escribiendo código y te sale error de conflicto, ejecuta:
```bash
git stash
```
*(Esto guarda temporalmente tus cambios locales para que Git te permita descargar lo nuevo sin errores).*

#### Paso 2: Descargar y fusionar los cambios del repositorio oficial
```bash
git pull origin main
```
> **Nota:** Si tu repositorio estaba apuntando a una URL antigua, puedes actualizarla con:
> `git remote set-url origin https://github.com/Williams-102/andesmobile-app-avance.git`

#### Paso 3: Reinstalar dependencias (¡Muy importante!)
Siempre que el docente agregue nuevas librerías o controladores:
```bash
npm install
```

#### Paso 4: Iniciar con caché limpia
```bash
npx expo start -c
```
*(El parámetro `-c` limpia la caché de Metro Bundler para evitar pantallas en blanco).*

---

## 🔑 Credenciales Demo para Probar en Clase

Para ingresar sin tener que registrarte manualmente:
* 📧 **Correo:** `alumno@codeandes.edu.pe`
* 🔒 **Contraseña:** `123456`
* ⚡ **Atajo:** Puedes tocar el botón **`⚡ Rellenar Demo`** en la pantalla de Login y entrar con 1 solo toque.

---

## 🛠️ Solución a Errores Frecuentes

1. **El celular no se conecta al QR:**
   * Asegúrate de que tu computadora y tu celular estén conectados a la **misma red Wi-Fi**.
   * Si tu Wi-Fi tiene bloqueo institucional o compartes datos desde el celular, inicia Expo en modo túnel:
     ```bash
     npx expo start --tunnel
     ```

2. **Error de caché o pantalla en blanco:**
   * Limpia la memoria caché de Metro Bundler:
     ```bash
     npx expo start -c
     ```

3. **Error al ejecutar `npm install`:**
   * Si tienes permisos restringidos o conflictos en Windows/Mac, ejecuta:
     ```bash
     npm install --legacy-peer-deps
     ```

---

## 📁 Estructura del Código

```
📁 src/
├── 📁 app/             ← Rutas de la app (Splash, Auth, Tabs y Detalle)
├── 📁 controllers/     ← Lógica de negocio, estados y validaciones
├── 📁 styles/          ← Estilos visuales desacoplados (StyleSheet)
├── 📁 components/      ← Componentes reutilizables (Tarjetas, Modales)
├── 📁 context/         ← AuthContext & CartContext (Estado Global)
├── 📁 constants/       ← Paleta de colores y datos de cursos
└── 📁 types/           ← Interfaces TypeScript de Curso, Usuario y Carrito
```

---

**Code Andes Academy &bull; 2026**  
*Impulsando el desarrollo móvil profesional de vanguardia.*
