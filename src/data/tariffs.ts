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
  // Híbridos: el arancel existe y lo paga el cliente en la aduana, pero
  // nosotros no lo cobramos, así que no mostramos monto. `null` hace que la web
  // diga "No incluye aranceles de aduana" (decisión del negocio, 2026-09-28).
  hibrido: null,
  electrico: 0,
} as const;

/**
 * Cuánto paga de arancel un producto, o `null` cuando no lo sabemos.
 *
 * `null` no es cero: es "paga arancel, pero no mostramos monto", y la UI dice
 * "No incluye aranceles de aduana". Hoy lo usan los híbridos (lo pagan en la
 * aduana y nosotros no lo cobramos). Los equipos solares pagan $0 (confirmado
 * 2026-08-23).
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
