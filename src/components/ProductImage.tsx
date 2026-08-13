import { useCallback, useEffect, useRef, useState } from 'react';
import { medirRecorte, type Recorte } from '../lib/cutout';

/**
 * Foto de producto a tamaño parejo.
 *
 * `object-contain` encaja el ARCHIVO en la caja, y como cada recorte trae
 * distinto margen transparente, el vehículo termina dibujado a cualquier
 * tamaño. Acá se mide el recuadro real del vehículo y se escala para que ese
 * recuadro —y no el archivo— sea el que encaja en la caja.
 *
 * Se ajusta por ancho Y por alto, quedándose con el menor de los dos factores.
 * Normalizar solo el ancho, como se hizo en el hero, alcanza cuando todas las
 * fotos son motos apaisadas; el catálogo tiene también inversores verticales
 * (relaciones de 0,67 a 1,81) y a esos el ancho parejo los volvería enormes y
 * los recortaría por arriba.
 */

/** Cuánto de la caja puede ocupar el vehículo. El resto es aire alrededor. */
const OBJETIVO = 0.92;

/**
 * Tope de agrandado. Las fotos son de 1536px y las tarjetas miden ~250, así que
 * agrandar no se ve pixelado; el tope está para que una medición rara —una foto
 * casi vacía, un recorte mal hecho— no dibuje un vehículo desbordado.
 */
const MAX_ESCALA = 3;

interface ProductImageProps {
  src: string;
  alt: string;
  /** Clases del <img>: sombra y efecto de hover, que dependen del tema. */
  className?: string;
  eager?: boolean;
}

export const ProductImage = ({ src, alt, className = '', eager = false }: ProductImageProps) => {
  const cajaRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const recorteRef = useRef<Recorte | null>(null);
  const [escala, setEscala] = useState(1);

  /**
   * `crossOrigin` hace falta para poder leer los píxeles. Si el host no manda
   * cabeceras CORS, la foto NO carga en vez de cargar sin medir, así que ante
   * un error se reintenta sin el atributo: una foto sin escalar es un problema
   * menor; una foto que no aparece es una tarjeta rota.
   */
  const [cors, setCors] = useState(true);

  const recalcular = useCallback(() => {
    const caja = cajaRef.current;
    const recorte = recorteRef.current;
    if (!caja || !recorte) return;

    const { width, height } = caja.getBoundingClientRect();
    if (!width || !height) return;

    // Dónde queda el archivo dentro de la caja según object-contain.
    const dibujoW = recorte.ar > width / height ? width : height * recorte.ar;
    const dibujoH = dibujoW / recorte.ar;

    // Y dentro de ese dibujo, cuánto mide el vehículo.
    const vehiculoW = dibujoW * recorte.w;
    const vehiculoH = dibujoH * recorte.h;
    if (!vehiculoW || !vehiculoH) return;

    const factor = Math.min(
      (OBJETIVO * width) / vehiculoW,
      (OBJETIVO * height) / vehiculoH,
      MAX_ESCALA,
    );

    if (Number.isFinite(factor) && factor > 0) setEscala(factor);
  }, []);

  // La escala depende de la forma de la caja, que cambia entre breakpoints.
  useEffect(() => {
    const caja = cajaRef.current;
    if (!caja) return;
    const observer = new ResizeObserver(recalcular);
    observer.observe(caja);
    return () => observer.disconnect();
  }, [recalcular]);

  const medir = useCallback(
    (img: HTMLImageElement) => {
      recorteRef.current = medirRecorte(img);
      recalcular();
    },
    [recalcular],
  );

  // Una foto distinta invalida la medida anterior.
  //
  // Y si viene de caché puede haber terminado de cargar antes de que React
  // enganchara el onLoad: ese evento ya no llega nunca, así que en la segunda
  // visita la tarjeta se quedaría sin escalar. Por eso, si al montar la foto ya
  // está completa, se mide acá mismo.
  useEffect(() => {
    recorteRef.current = null;
    setEscala(1);
    setCors(true);

    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) medir(img);
  }, [src, medir]);

  return (
    <span ref={cajaRef} className="absolute inset-0 z-10 block">
      {/* La escala va en este envoltorio y no en el <img>: la tarjeta ya usa
          `group-hover:scale-105` sobre la foto, y un transform en línea sobre
          el mismo elemento le pisaría el hover. */}
      <span
        className="block h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `scale(${escala})` }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          crossOrigin={cors ? 'anonymous' : undefined}
          onLoad={(e) => medir(e.currentTarget)}
          onError={() => setCors(false)}
          className={`h-full w-full select-none object-contain ${className}`}
        />
      </span>
    </span>
  );
};
