// Datos del sitio en un solo lugar: los usan el navbar, el pie, el SEO y los
// datos estructurados.
//
// OJO: acá no hay teléfono, correo ni redes, y no es un olvido. Este proyecto es
// el catálogo: muestra modelos, precios y fichas, y no ofrece ningún canal para
// escribirnos. Si alguna vez hace falta uno, no alcanza con agregar el dato acá
// —hay que revisar también los legales y la analítica, que están escritos sobre
// el hecho de que el sitio no recolecta nada.

export const SITE = {
  name: 'Smile Motors',
  tagline: 'Catálogo 2026',
  url: 'https://catalogo.smilemotors.online',
  /** Programa de referidos. App aparte (Next), no una ruta del catálogo. */
  referidos: 'https://referidos.smilemotors.online',
  currency: 'USD',
} as const;

/**
 * Formas de entrega, solo para mostrarlas en /envios. Los slugs coinciden con
 * los `shipping_types` del CRM. Todos los destinos son en Cuba y el flete ya
 * está incluido en el precio de lista; el arancel de aduana no, y vive en
 * `tariffs.ts`.
 */
export const SHIPPING_METHODS = [
  {
    id: 'habana',
    label: 'La Habana',
    detail: 'Entrega a domicilio en la capital.',
  },
  {
    id: 'provincia',
    label: 'Resto de Cuba',
    detail: 'Entrega en la provincia del receptor.',
  },
] as const;
