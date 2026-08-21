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
 * `null` no es cero: es "no lo tenemos confirmado". Los equipos solares no son
 * vehículos y no entran en esta tabla, así que la UI muestra para ellos un
 * texto genérico en vez de un número inventado.
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
    case 'triciclos':
      return /h[ií]brid/i.test(product.name)
        ? CUSTOMS_DUTY.hibrido
        : CUSTOMS_DUTY.electrico;
    case 'energia-solar':
      return null;
  }
};
