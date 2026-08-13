/**
 * Cómo se entrega según el vehículo, y dónde están las sucursales de
 * Aerovaradero.
 *
 * No todo llega a la puerta: los eléctricos y los equipos solares sí, pero los
 * híbridos y los de combustión se retiran en una sucursal. La tienda lo decía
 * como si fuera un solo caso —"entrega en La Habana o en la provincia"— y el
 * comprador de una moto de combustión se enteraba después.
 *
 * Los datos salen de la base de conocimiento del bot
 * (admin/scripts/fusionar_faqs_entrega_bot.mjs). Si allá cambian, hay que
 * cambiarlos acá: son dos copias de la misma verdad y no hay nada que las
 * sincronice.
 */

/** Las dos formas de entrega, por tipo de vehículo. */
export const DELIVERY_MODES = [
  {
    id: 'domicilio',
    label: 'Hasta la puerta de la casa',
    applies: 'Eléctricos y energía solar',
    detail:
      'Entregamos en el domicilio del receptor, tanto en La Habana como en cualquier provincia.',
  },
  {
    id: 'aerovaradero',
    label: 'Retiro en Aerovaradero',
    applies: 'Híbridos y combustión',
    detail:
      'No llegan al domicilio: el receptor los retira en la sucursal de Aerovaradero que elija, presentando su carné de identidad.',
  },
] as const;

export interface Sucursal {
  provincia: string;
  direccion: string;
  telefonos: string[];
}

/**
 * Las 7 sucursales. El cliente elige a cuál mandarlo: no tiene que ser la de su
 * provincia, aunque sea lo habitual.
 */
export const AEROVARADERO: Sucursal[] = [
  {
    provincia: 'La Habana',
    direccion: 'Carretera del Wajay, km 1½, Aeropuerto Internacional José Martí, Boyeros',
    telefonos: ['(+53) 7 648 3100'],
  },
  {
    provincia: 'Matanzas',
    direccion: 'Carretera Regalito, km 5½, Carboneras, Varadero',
    telefonos: ['+53 45 663664', '+53 45 663667'],
  },
  {
    provincia: 'Cienfuegos',
    direccion: 'Carretera a Caonao, km 3½, Ciudad de Cienfuegos',
    telefonos: ['+53 43 552047', '+53 59 891011'],
  },
  {
    provincia: 'Villa Clara',
    direccion:
      'Carretera La Maleza, km 10½, Aeropuerto Internacional Abel Santamaría, Santa Clara',
    telefonos: ['+53 42 284209', '+53 42 299149'],
  },
  {
    provincia: 'Camagüey',
    direccion: 'Carretera de Nuevitas, km 7½, Aeropuerto Internacional Ignacio Agramonte',
    telefonos: ['+53 3 226 2110'],
  },
  {
    provincia: 'Holguín',
    direccion: 'Carretera Central, km 11 vía Bayamo, Aeropuerto Internacional Frank País',
    telefonos: ['(+53 24) 474 621', '(+53 24) 474 505'],
  },
  {
    provincia: 'Santiago de Cuba',
    direccion: 'Carretera de Ciudamar, km 2½, Aeropuerto Internacional Antonio Maceo',
    telefonos: ['+53 22 696208', '+53 22 698687'],
  },
];

/**
 * Provincias sin sucursal propia y a cuál les queda cerca.
 *
 * Va escrito y no calculado: una distancia estimada al vuelo puede mandar a
 * alguien a cruzar la isla. Es la misma tabla que usa el bot.
 */
export const SIN_SUCURSAL = [
  { provincia: 'Pinar del Río, Artemisa, Mayabeque e Isla de la Juventud', cercanas: 'La Habana' },
  { provincia: 'Sancti Spíritus', cercanas: 'Villa Clara o Cienfuegos' },
  { provincia: 'Ciego de Ávila', cercanas: 'Camagüey o Villa Clara' },
  { provincia: 'Las Tunas', cercanas: 'Holguín o Camagüey' },
  { provincia: 'Granma', cercanas: 'Holguín o Santiago de Cuba' },
  { provincia: 'Guantánamo', cercanas: 'Santiago de Cuba' },
] as const;
