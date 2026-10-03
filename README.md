# 📱 Andes Mobile App — Avance Módulo 06 (Code Andes Academy)

> **Programa de Especialización Profesional:** Desarrollo de Aplicaciones Móviles Android e iOS con React Native & Expo  
> **Docente:** Exar Williams Atao Paucar  
> **Institución:** Code Andes Academy  
> **Respaldo Académico:** Colegio de Ingenieros del Perú (CIP)  

---

## 🎯 ¿Qué incluye este repositorio?
Este repositorio contiene el código fuente completo, probado y optimizado hasta el **Módulo 06: Arquitectura Offline First y Persistencia con AsyncStorage**, estructurado bajo **Clean Architecture**:

* 💾 **Persistencia en Disco Local (AsyncStorage):**
  * `AuthContext`: Sesión de usuario persistente que sobrevive a reinicios forzados de la app.
  * `CartContext`: Carrito de compras permanente con escudo de seguridad (`useRef`) contra borrado accidental.
* 📡 **Monitoreo de Red en Tiempo Real (NetInfo):**
  * Hook reactivo `useNetworkStatus` con detección instantánea de conectividad.
  * `OfflineBanner`: Notificación flotante ámbar adaptada con Safe Area Insets para no chocar con el reloj ni los iconos de batería de tu teléfono.
* ⚡ **Cola de Transacciones Offline FIFO (SyncEngine):**
  * Si el alumno realiza una matrícula en **Modo Avión**, la compra se asegura en una cola persistente con ticket UUID (`tx_...`).
  * `SyncSentinel`: Centinela en segundo plano que detecta el regreso de la red y procesa la cola FIFO automáticamente sin requerir clics del usuario.
* 🧾 **Historial de Boletas y Facturación Local:**
  * Almacenamiento local de comprobantes de pago digitales en `BoletasService`.
  * Visualización en la pestaña **Mi Perfil > Historial de Boletas**, identificando pagos online y compras sincronizadas desde offline.
* 🏛️ **Clean Architecture & TypeScript Estricto:**
  * Desacoplamiento de Servicios (`services/`), Hooks (`hooks/`), Componentes (`components/`), Controladores (`controllers/`) y Vistas (`app/`).
  * 100% libre de errores de compilación (`npx tsc --noEmit` exit code 0).


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
├── 📁 components/      ← Componentes reutilizables (Banner, Tarjetas, Modales)
├── 📁 context/         ← AuthContext & CartContext (Estado Global Persistente)
├── 📁 services/        ← StorageService, BoletasService y SyncEngine (Offline First)
├── 📁 hooks/           ← useNetworkStatus (Monitoreo NetInfo con cleanup)
├── 📁 constants/       ← StorageKeys, Paleta de colores y datos de cursos
└── 📁 types/           ← Interfaces TypeScript de Boletas, Offline, Curso y Usuario
```

---

**Code Andes Academy &bull; 2026**  
*Impulsando el desarrollo móvil profesional de vanguardia.*
