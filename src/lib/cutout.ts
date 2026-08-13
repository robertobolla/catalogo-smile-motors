/**
 * Mide qué parte del archivo ocupa realmente el vehículo.
 *
 * Las fotos son recortes sin fondo, pero cada una trae distinta cantidad de
 * margen transparente alrededor: medidas sobre el catálogo, van del 37% al 100%
 * del ancho del archivo. Con `object-contain` todas se dibujan en una caja del
 * mismo tamaño, así que la que viene con más aire se ve casi tres veces más
 * chica aunque la caja sea idéntica.
 *
 * Esto se resolvió una vez a mano para las tres fotos del hero (ver
 * HeroSlider). Con 58 productos que además se editan desde el CRM, una tabla de
 * medidas escrita a mano —o generada en el build— envejece igual que envejecía
 * la copia local del catálogo: cambian una foto en el admin y la web la escala
 * mal sin que nada avise. Por eso se mide en vivo.
 *
 * No hay pedido extra de red: se mide sobre el mismo <img> que la tarjeta ya
 * cargó, dibujándolo en un canvas diminuto. Y se cachea por URL, así que una
 * foto repetida en varias grillas se mide una sola vez.
 */

export interface Recorte {
  /** Borde izquierdo del vehículo como fracción del ancho del archivo (0-1). */
  x: number;
  /** Borde superior del vehículo como fracción del alto del archivo (0-1). */
  y: number;
  /** Ancho del vehículo como fracción del ancho del archivo (0-1). */
  w: number;
  /** Alto del vehículo como fracción del alto del archivo (0-1). */
  h: number;
  /** Relación de aspecto del archivo, para saber cómo lo encaja object-contain. */
  ar: number;
}

/** Lado del canvas de medición. Alcanza y sobra: solo se busca un recuadro. */
const MUESTRA = 96;

/** Por debajo de este alfa es margen, no vehículo. Descarta bordes difuminados. */
const UMBRAL = 16;

/** `null` = medida imposible (canvas contaminado, foto opaca sin recorte). */
const cache = new Map<string, Recorte | null>();

export const medirRecorte = (img: HTMLImageElement): Recorte | null => {
  const src = img.currentSrc || img.src;
  const cacheado = cache.get(src);
  if (cacheado !== undefined) return cacheado;

  let recorte: Recorte | null = null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = MUESTRA;
    canvas.height = MUESTRA;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && img.naturalWidth > 0 && img.naturalHeight > 0) {
      ctx.drawImage(img, 0, 0, MUESTRA, MUESTRA);
      const datos = ctx.getImageData(0, 0, MUESTRA, MUESTRA).data;

      let x0 = MUESTRA;
      let x1 = -1;
      let y0 = MUESTRA;
      let y1 = -1;

      for (let p = 0; p < MUESTRA * MUESTRA; p++) {
        if (datos[p * 4 + 3] > UMBRAL) {
          const x = p % MUESTRA;
          const y = (p / MUESTRA) | 0;
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }

      if (x1 >= x0 && y1 >= y0) {
        recorte = {
          x: x0 / MUESTRA,
          y: y0 / MUESTRA,
          w: (x1 - x0 + 1) / MUESTRA,
          h: (y1 - y0 + 1) / MUESTRA,
          ar: img.naturalWidth / img.naturalHeight,
        };
      }
    }
  } catch {
    // Canvas contaminado: la foto se sirve sin cabeceras CORS y no se pueden
    // leer sus píxeles. Se deja `null` y la tarjeta la muestra sin escalar.
    recorte = null;
  }

  cache.set(src, recorte);
  return recorte;
};
