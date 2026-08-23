import type { Product } from '../types';

/**
 * Aranceles de aduana en Cuba, por tipo de vehículo. No están incluidos en el
 * precio de lista —el precio incluye el flete, no la aduana— así que el sitio
 * los muestra aparte en vez de dejar que aparezcan al retirar.
 *
 * El monto es fijo por tipo de motor, no por modelo ni por precio.
 */
export const CUSTOMS_DUTY = {
  combustion: 265,
  hibrido: 165,
  electrico: 0,
} as const;

/**
 * Cuánto paga de arancel un producto, o `null` cuando no lo sabemos.
 *
 * `null` no es cero: es "no lo tenemos confirmado", y la UI muestra un texto
 * genérico en vez de un número inventado. Hoy ninguna categoría lo usa: los
 * equipos solares pagan $0 (confirmado 2026-08-23), pero el contrato queda por
 * si entra una categoría sin dato.
 *
 * OJO con los triciclos: la categoría mezcla eléctricos e híbridos, que pagan
 * distinto. Mientras no exista un campo de tipo de motor en el producto, el
 * híbrido se reconoce por el nombre. Si mañana entra un triciclo híbrido que no
 * diga "híbrido" en el nombre, va a cotizar como eléctrico y va a mostrar $0.
 */
export const customsDuty = (product: Product): number | null => {
  switch (product.category) {
    case 'combustion':
      return CUSTOMS_DUTY.combustion;
    case 'motos-electricas':
      return CUSTOMS_DUTY.electrico;
    case 'e-bikes':
      return CUSTOMS_DUTY.electrico;
    case 'dirt-bikes':
      // Son las e-bikes de cross: eléctricas, no pagan.
      return CUSTOMS_DUTY.electrico;
    case 'triciclos':
      return /h[ií]brid/i.test(product.name)
        ? CUSTOMS_DUTY.hibrido
        : CUSTOMS_DUTY.electrico;
    case 'energia-solar':
      // Confirmado por el usuario (2026-08-23): los equipos solares no pagan.
      return CUSTOMS_DUTY.electrico;
  }
};
