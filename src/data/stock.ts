import type { Product } from '../types';

/**
 * Qué modelos están agotados.
 *
 * `/api/public/store` todavía no manda el campo `stock`: la ficha llega sin él,
 * así que no hay forma de deducir el agotado desde el CRM. Hasta que el
 * endpoint lo incluya, los agotados se listan acá a mano.
 *
 * Los ids son los del catálogo público (los mismos que van en la URL de la
 * ficha), no los `crmId`.
 *
 * OJO: la tienda tiene su propia copia de este archivo. Los dos proyectos leen
 * el mismo endpoint, así que cuando cambie el stock hay que tocar los dos —o
 * mejor, agregar el campo en el CRM y que esta lista deje de hacer falta.
 */
const AGOTADOS = new Set(['cuatriciclo-ciber-250cc', 'xmox-rr', 'xmox-gp']);

/**
 * El dato del CRM manda cuando existe: el día que el endpoint empiece a mandar
 * `stock`, esta lista deja de pesar sola y no hay que tocar las vistas.
 */
export const sinStock = (product: Product) =>
  typeof product.stock === 'number' ? product.stock <= 0 : AGOTADOS.has(product.id);
