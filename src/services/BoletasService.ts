// src/services/BoletasService.ts
// Servicio para gestionar el historial local de boletas electronicas en AsyncStorage (Modulos 06, 07, 08 y 09)

import { StorageService } from './StorageService';
import { STORAGE_KEYS } from '../constants/StorageKeys';
import { Boleta, BoletaItem } from '../types/boleta';
import { supabase, isSupabaseConfigured } from './supabase';

export const BoletasService = {
  /**
   * Obtiene la lista de boletas del usuario autenticado actual.
   * Si se especifica usuarioId o usuarioEmail, filtra estrictamente para no mezclar boletas de otros usuarios.
   */
  async obtenerBoletas(usuarioId?: string | null, usuarioEmail?: string | null): Promise<Boleta[]> {
    const todasLocales = await StorageService.get<Boleta[]>(STORAGE_KEYS.BOLETAS, []);

    let filtradas: Boleta[] = [];

    if (usuarioId || usuarioEmail) {
      // Filtrar boletas locales pertenecientes al usuario activo
      filtradas = todasLocales.filter((b) => {
        const coincideId = usuarioId && b.usuarioId === usuarioId;
        const coincideEmail =
          usuarioEmail &&
          b.clienteEmail &&
          b.clienteEmail.toLowerCase().trim() === usuarioEmail.toLowerCase().trim();
        return coincideId || coincideEmail;
      });

      // Si Supabase esta conectado y el usuario tiene UUID, consultar matriculas en la nube
      if (usuarioId && isSupabaseConfigured) {
        try {
          const { data: matriculasDB, error } = await supabase
            .from('matriculas')
            .select(`
              id,
              total,
              subtotal,
              igv,
              metodo_pago,
              numero_operacion,
              voucher_url,
              banco_origen,
              ultimos_digitos_tarjeta,
              fecha,
              estado,
              ticket_offline_id,
              matricula_items (
                curso_id,
                precio_unitario
              )
            `)
            .eq('usuario_id', usuarioId)
            .order('fecha', { ascending: false });

          if (!error && matriculasDB && matriculasDB.length > 0) {
            const idsExistentes = new Set(filtradas.map((f) => f.id));

            for (const m of matriculasDB as any[]) {
              if (!idsExistentes.has(m.id)) {
                const correlativo = String(m.id).replace(/\D/g, '').slice(-6) || '000001';
                const itemsCursos: BoletaItem[] = (m.matricula_items || []).map((it: any) => ({
                  id: it.curso_id,
                  titulo: String(it.curso_id).replace(/-/g, ' ').toUpperCase(),
                  precio: Number(it.precio_unitario),
                }));

                const boletaCloud: Boleta = {
                  id: m.id,
                  serie: `B001-${correlativo.padStart(6, '0')}`,
                  fecha: m.fecha || new Date().toISOString(),
                  cursos: itemsCursos.length > 0 ? itemsCursos : [
                    { id: 'curso-matricula', titulo: 'Especializacion Code Andes', precio: Number(m.total) },
                  ],
                  total: Number(m.total),
                  subtotal: Number(m.subtotal),
                  igv: Number(m.igv),
                  metodoPago: m.metodo_pago,
                  numeroOperacion: m.numero_operacion || undefined,
                  voucherUrl: m.voucher_url || undefined,
                  bancoOrigen: m.banco_origen || undefined,
                  ultimosDigitosTarjeta: m.ultimos_digitos_tarjeta || undefined,
                  usuarioId: usuarioId,
                  clienteNombre: usuarioEmail?.split('@')[0] || 'Estudiante Code Andes',
                  clienteEmail: usuarioEmail || undefined,
                  rucEmisor: '20612345678',
                  razonSocialEmisor: 'Code Andes Academy S.A.C.',
                  estado: 'COMPLETADO_ONLINE',
                  ticketOfflineId: m.ticket_offline_id || undefined,
                };

                filtradas.push(boletaCloud);
                todasLocales.unshift(boletaCloud);
              }
            }

            // Persistir cache actualizada en disco
            await StorageService.set(STORAGE_KEYS.BOLETAS, todasLocales);
          }
        } catch (err) {
          console.warn('[BoletasService] Error consultando boletas en la nube:', err);
        }
      }
    } else {
      // Modo invitado: solo boletas sin asociacion de usuario
      filtradas = todasLocales.filter((b) => !b.usuarioId && !b.clienteEmail);
    }

    // Ordenar cronologicamente descendente (mas recientes primero)
    return filtradas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },

  /**
   * Registra una nueva boleta digital con desglose de IGV y datos reales del alumno
   */
  async registrarBoleta(
    datos: Omit<Boleta, 'id' | 'serie' | 'fecha' | 'rucEmisor' | 'razonSocialEmisor' | 'subtotal' | 'igv'> & {
      id?: string;
      serie?: string;
      subtotal?: number;
      igv?: number;
    }
  ): Promise<Boleta> {
    const boletas = await StorageService.get<Boleta[]>(STORAGE_KEYS.BOLETAS, []);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const correlativo = String(boletas.length + 1).padStart(6, '0');

    const idGenerado = datos.id || `BOL-2026-${randomNum}`;
    const serieGenerada = datos.serie || `B001-${correlativo}`;

    const subtotal = datos.subtotal !== undefined ? datos.subtotal : Number((datos.total / 1.18).toFixed(2));
    const igv = datos.igv !== undefined ? datos.igv : Number((datos.total - subtotal).toFixed(2));

    const nuevaBoleta: Boleta = {
      ...datos,
      id: idGenerado,
      serie: serieGenerada,
      subtotal,
      igv,
      rucEmisor: '20612345678',
      razonSocialEmisor: 'Code Andes Academy S.A.C.',
      fecha: new Date().toISOString(),
    };

    // Anadir al inicio para que las compras mas recientes aparezcan arriba
    boletas.unshift(nuevaBoleta);
    await StorageService.set(STORAGE_KEYS.BOLETAS, boletas);
    console.log(`[BoletasService] Boleta ${nuevaBoleta.serie} (${nuevaBoleta.id}) asociada a [${nuevaBoleta.clienteEmail || 'Invitado'}] guardada con exito.`);
    return nuevaBoleta;
  },

  /**
   * Limpia el almacenamiento de boletas para pruebas
   */
  async limpiarHistorial(): Promise<void> {
    await StorageService.set(STORAGE_KEYS.BOLETAS, []);
  },
};
