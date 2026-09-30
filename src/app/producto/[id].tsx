// src/app/producto/[id].tsx
// Ruta alternativa de compatibilidad para Detalle (Clean Architecture)

import React from 'react';
import DetalleCursoScreen from '../curso/[id]';

export default function DetalleProductoScreen() {
  return <DetalleCursoScreen />;
}
