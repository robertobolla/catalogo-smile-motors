import type { Product } from '../types';
import { SITE } from '../data/site';
import { customsDuty } from '../data/tariffs';
import { medirRecorte } from './cutout';
import { formatPrice } from './format';

/**
 * Ficha del producto en PDF, para que el cliente se la lleve o se la reenvíe a
 * alguien que decide con él.
 *
 * Se dibuja el PDF a mano en vez de fotografiar la página. Un html2canvas daría
 * una imagen: pesada, sin texto seleccionable y borrosa al imprimir. Acá el
 * texto va vectorial —se puede copiar y buscar— y lo único rasterizado es la
 * foto del vehículo.
 *
 * jsPDF se carga con import() dinámico: son ~350 kB que solo bajan cuando
 * alguien toca el botón, y la tienda entera pesa 412 kB.
 */

const MARGEN = 14;
const ANCHO = 210; // A4
const ALTO = 297;
const UTIL = ANCHO - MARGEN * 2;

const COLOR = {
  ink: '#0b0b0c',
  brand: '#f5c400',
  brandInk: '#8a6e00',
  texto: '#27272a',
  suave: '#71717a',
  linea: '#e4e4e7',
  panel: '#f4f4f5',
} as const;

/**
 * Cambia los signos tipográficos por su equivalente ASCII.
 *
 * Las fuentes base del PDF usan WinAnsi, que tiene las tildes y la eñe pero no
 * la raya, las comillas curvas ni el punto medio: esos caracteres NO fallan,
 * desaparecen. Un guión que se esfuma en la ficha que ve el cliente es peor que
 * un guión corto, y los textos vienen del CRM, donde nadie va a acordarse.
 */
const ascii = (texto: string): string =>
  texto
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/[·•]/g, '-');

/** Descarga la foto con permiso para leer sus píxeles (hace falta recortarla). */
const cargarImagen = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

/**
 * Recorta el margen transparente y aplana sobre blanco.
 *
 * Lo primero, porque el recorte trae hasta un 60% de aire alrededor y en la
 * ficha esa foto tiene que lucir. Lo segundo, porque el PDF se guarda en JPEG
 * —mucho más liviano que PNG para una foto— y el JPEG no tiene transparencia:
 * sin fondo blanco, el vehículo saldría sobre negro.
 */
const fotoParaPdf = (img: HTMLImageElement): { datos: string; ar: number } | null => {
  const { naturalWidth: nw, naturalHeight: nh } = img;
  if (!nw || !nh) return null;

  // Sin medida (foto opaca o sin CORS) se usa entera: es peor no mostrarla.
  const recorte = medirRecorte(img);
  let sx = recorte ? recorte.x * nw : 0;
  let sy = recorte ? recorte.y * nh : 0;
  let sw = recorte ? recorte.w * nw : nw;
  let sh = recorte ? recorte.h * nh : nh;

  // Un respiro alrededor para que el vehículo no toque el borde del panel.
  const aire = 0.04;
  sx = Math.max(0, sx - sw * aire);
  sy = Math.max(0, sy - sh * aire);
  sw = Math.min(nw - sx, sw * (1 + aire * 2));
  sh = Math.min(nh - sy, sh * (1 + aire * 2));

  // ~150 dpi sobre el ancho útil de la hoja: nítido impreso y liviano.
  const destinoW = 1000;
  const destinoH = Math.round((destinoW * sh) / sw);

  const lienzo = document.createElement('canvas');
  lienzo.width = destinoW;
  lienzo.height = destinoH;
  const ctx = lienzo.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, destinoW, destinoH);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destinoW, destinoH);

  try {
    return { datos: lienzo.toDataURL('image/jpeg', 0.88), ar: destinoW / destinoH };
  } catch {
    return null;
  }
};

export const descargarFichaPdf = async (product: Product): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  const url = `${SITE.url}/producto/${product.id}`;
  const arancel = customsDuty(product);

  let y = 0;

  /** Banda negra de marca. Se repite en cada hoja para que ninguna quede huérfana. */
  const encabezado = () => {
    doc.setFillColor(COLOR.ink);
    doc.rect(0, 0, ANCHO, 22, 'F');
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('SMILE MOTORS', MARGEN, 11.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR.brand);
    doc.text('CATÁLOGO 2026', MARGEN, 16.5);
    doc.setTextColor('#a1a1aa');
    doc.text(SITE.url.replace('https://', ''), ANCHO - MARGEN, 16.5, { align: 'right' });
    doc.setFontSize(9);
    doc.setTextColor('#ffffff');
    doc.text('Ficha de producto', ANCHO - MARGEN, 11.5, { align: 'right' });
    y = 34;
  };

  /**
   * Pie con la marca y la advertencia de precio.
   *
   * Antes acá iban el WhatsApp y el correo. La ficha se descarga y se reenvía:
   * si llevara un teléfono, el PDF seguiría derivando consultas mucho después
   * de que alguien lo bajó del catálogo, que es justo lo que este sitio no hace.
   *
   * Arranca a 24mm del borde y no a 18: la última línea caía a 4,5mm del filo
   * de la hoja, dentro del margen que muchas impresoras no imprimen.
   */
  const pie = () => {
    const base = ALTO - 24;
    doc.setDrawColor(COLOR.linea);
    doc.setLineWidth(0.3);
    doc.line(MARGEN, base, ANCHO - MARGEN, base);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLOR.texto);
    doc.text(`${SITE.name} · ${SITE.tagline}`, MARGEN, base + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(COLOR.suave);
    doc.text(
      'Precios en dólares, sujetos a cambio sin aviso. No incluyen el arancel de aduana.',
      MARGEN,
      base + 9.5,
    );
    doc.text(url, MARGEN, base + 13.5);
  };

  /** Abre hoja nueva si lo que viene no entra sin pisar el pie. */
  const espacio = (alto: number) => {
    if (y + alto <= ALTO - 30) return;
    pie();
    doc.addPage();
    encabezado();
  };

  encabezado();

  // --- Título -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLOR.brandInk);
  doc.text(ascii(product.categoryLabel.toUpperCase()), MARGEN, y);
  y += 8;

  doc.setFontSize(23);
  doc.setTextColor(COLOR.ink);
  const titulo = doc.splitTextToSize(ascii(product.name), UTIL) as string[];
  doc.text(titulo, MARGEN, y);
  y += titulo.length * 9 + 4;

  // --- Foto ---------------------------------------------------------------
  const img = await cargarImagen(product.image);
  const foto = img ? fotoParaPdf(img) : null;

  if (foto) {
    const cajaAlto = 78;
    doc.setFillColor(COLOR.panel);
    doc.roundedRect(MARGEN, y, UTIL, cajaAlto, 3, 3, 'F');

    // La foto se encaja dentro del panel sin deformarse.
    const maxW = UTIL - 12;
    const maxH = cajaAlto - 10;
    let w = maxW;
    let h = w / foto.ar;
    if (h > maxH) {
      h = maxH;
      w = h * foto.ar;
    }
    doc.addImage(foto.datos, 'JPEG', MARGEN + (UTIL - w) / 2, y + (cajaAlto - h) / 2, w, h);
    y += cajaAlto + 8;
  }

  // --- Precio -------------------------------------------------------------
  espacio(30);
  const precioAlto = 16;
  doc.setFillColor(COLOR.brand);
  doc.roundedRect(MARGEN, y, 58, precioAlto, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(COLOR.ink);
  doc.text(formatPrice(product.price), MARGEN + 29, y + 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLOR.texto);
  doc.text('Envío a toda Cuba incluido en el precio.', MARGEN + 64, y + 6.5);
  doc.setFontSize(8.5);
  doc.setTextColor(COLOR.suave);
  doc.text(
    arancel === null
      ? 'Aranceles de aduana no incluidos: consultanos.'
      : arancel === 0
        ? 'Sin arancel de aduana: los eléctricos no pagan.'
        : `No incluye el arancel de aduana: ${formatPrice(arancel)} aparte.`,
    MARGEN + 64,
    y + 11.5,
  );
  y += precioAlto + 10;

  // --- Ficha técnica ------------------------------------------------------
  const filas = Object.entries(product.specs);
  if (filas.length > 0) {
    espacio(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLOR.brandInk);
    doc.text('FICHA TÉCNICA', MARGEN, y);
    y += 5;

    filas.forEach(([clave, valor], i) => {
      const anchoValor = UTIL - 62;
      doc.setFontSize(8.5);
      const lineas = doc.splitTextToSize(ascii(String(valor)), anchoValor) as string[];
      const alto = Math.max(7.5, lineas.length * 4.2 + 3.2);

      espacio(alto);

      // Cebra: en una tabla larga es lo que evita saltar de renglón al leer.
      if (i % 2 === 0) {
        doc.setFillColor(COLOR.panel);
        doc.rect(MARGEN, y, UTIL, alto, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(COLOR.suave);
      doc.text(ascii(clave.toUpperCase()), MARGEN + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(COLOR.texto);
      doc.text(lineas, ANCHO - MARGEN - 3, y + 5, { align: 'right' });

      y += alto;
    });
    y += 8;
  }

  // --- Descripción --------------------------------------------------------
  if (product.description) {
    espacio(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLOR.brandInk);
    doc.text('DESCRIPCIÓN', MARGEN, y);
    y += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLOR.texto);
    const parrafo = doc.splitTextToSize(ascii(product.description), UTIL) as string[];
    parrafo.forEach((linea) => {
      espacio(5);
      doc.text(linea, MARGEN, y);
      y += 4.6;
    });
    y += 6;
  }

  // --- Equipamiento -------------------------------------------------------
  if (product.features && product.features.length > 0) {
    espacio(18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLOR.brandInk);
    doc.text('EQUIPAMIENTO', MARGEN, y);
    y += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    product.features.forEach((f) => {
      const lineas = doc.splitTextToSize(ascii(f), UTIL - 6) as string[];
      espacio(lineas.length * 4.6 + 1.5);
      doc.setFillColor(COLOR.brand);
      doc.circle(MARGEN + 1.4, y - 1.3, 1.4, 'F');
      doc.setTextColor(COLOR.texto);
      doc.text(lineas, MARGEN + 6, y);
      y += lineas.length * 4.6 + 1.5;
    });
    y += 4;
  }

  // --- Colores ------------------------------------------------------------
  if (product.colors && product.colors.length > 0) {
    espacio(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLOR.brandInk);
    doc.text('COLORES DISPONIBLES', MARGEN, y);
    y += 6;

    let x = MARGEN;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    product.colors.forEach((c) => {
      const nombre = ascii(c.name);
      const ancho = doc.getTextWidth(nombre) + 11;
      if (x + ancho > ANCHO - MARGEN) {
        x = MARGEN;
        y += 8;
        espacio(10);
      }
      doc.setFillColor(c.hex);
      doc.setDrawColor(COLOR.linea);
      doc.circle(x + 2.6, y - 1.2, 2.2, 'FD');
      doc.setTextColor(COLOR.texto);
      doc.text(nombre, x + 7, y);
      x += ancho;
    });
    y += 8;
  }

  pie();

  // Nombre de archivo sin acentos ni signos: viaja por WhatsApp y correo.
  const limpio = product.name
    .normalize('NFD')
    .replace(/[^ -~]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  doc.save(`smile-motors-${limpio || product.id}.pdf`);
};
