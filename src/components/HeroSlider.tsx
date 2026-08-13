import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Product } from '../types';
import { useCatalog } from '../context/CatalogContext';

// Los tres modelos del hero, elegidos a mano. Se referencian por id y no por
// posición: el catálogo lo manda el CRM y el orden puede cambiar.
//
// Antes iba uno por línea de producto (triciclo, eléctrica, combustión) para
// mostrar de entrada que acá no se vende una sola cosa. Hoy son dos triciclos
// —el segundo se cambió a pedido por la foto del Fénix— así que la línea de
// eléctricas no aparece en el hero.
//
// `escala` empareja el tamaño en pantalla de las tres fotos.
//
// Cada recorte trae distinta cantidad de margen vacío alrededor del vehículo.
// Midiendo el recuadro del vehículo dentro de cada archivo, ocupa el 79% del
// ancho en el DG Gray, el 70% en el Fénix y el 99% en la GN125 F. Con
// object-contain las tres se dibujan del mismo tamaño de caja, así que la que
// viene con más aire se ve más chica aunque la caja sea idéntica.
//
// El objetivo es que las tres ocupen el mismo OBJETIVO del ancho de la caja, y
// de ahí sale cada factor: escala = OBJETIVO / lo que ocupa hoy. Si se cambia
// una foto en el CRM hay que volver a medirla — el recuadro es propio de cada
// archivo, no algo que el código pueda deducir.
//
// No recorta nada: agranda o achica la foto entera, y el margen sobrante, que
// es transparente, sale de la caja sin taparse con nada.
const OBJETIVO = 0.9; // del ancho de la caja
const SLIDES_CONFIG: { id: string; ocupa: number }[] = [
  { id: 'dg-gray-hibrido-72v-105ah', ocupa: 0.79 },
  { id: 'fenix-hibrido', ocupa: 0.7 },
  { id: 'gn125-f', ocupa: 0.99 },
];

const INTERVAL = 6500; // ms entre fotos

export const HeroSlider = () => {
  const { products } = useCatalog();
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  // El alt describe el modelo en vez de numerarlo: son fotos de producto y es lo
  // único que Google Imágenes tiene para entenderlas.
  //
  // Si alguno de los tres se dio de baja en el CRM, el hero muestra los que
  // queden en vez de un hueco.
  const SLIDES = useMemo(
    () =>
      SLIDES_CONFIG.map((c) => {
        const p = products.find((x) => x.id === c.id);
        return p ? { ...p, escala: OBJETIVO / c.ocupa } : null;
      }).filter((p): p is Product & { escala: number } => Boolean(p)),
    [products],
  );

  // Las otras fotos se precargan apenas monta: AnimatePresence solo tiene una
  // en el DOM por vez, así que sin esto el primer cambio llega en blanco.
  useEffect(() => {
    SLIDES.slice(1).forEach((p) => {
      const img = new Image();
      img.src = p.image;
    });
  }, [SLIDES]);

  // Un carrusel que avanza solo es un problema si a alguien le cuesta seguirlo,
  // así que con "reducir movimiento" activado se queda quieto y se navega con
  // los puntos.
  useEffect(() => {
    if (reduceMotion || SLIDES.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(id);
  }, [index, reduceMotion, SLIDES.length]); // reinicia el temporizador tras un cambio manual

  // El catálogo llega después del primer render: si la lista se acortó, el
  // índice viejo puede quedar fuera de rango.
  const current = SLIDES[index] ?? SLIDES[0];
  if (!current) return null;

  return (
    <div className="product-halo relative flex w-full flex-col items-center">
      {/* Proporción fija: las fotos van de 0,97 a 1,60 de relación, y sin un
          alto estable el hero entero salta en cada cambio. */}
      <div className="relative flex aspect-[4/3] w-full max-w-xl items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={current.id}
            src={current.image}
            alt={`${current.name} — ${current.categoryLabel} de Smile Motors`}
            width={760}
            height={573}
            // Solo la primera es el LCP de la home; las demás ya están en caché.
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            // La escala va en los tres estados y no en una clase de CSS: framer
            // motion maneja el `transform` de este elemento para animar la
            // entrada, y un transform propio se lo pisaría. Al estar igual en
            // los tres, no se anima: es tamaño fijo, no un efecto de zoom.
            initial={
              reduceMotion
                ? { opacity: 0, scale: current.escala }
                : { opacity: 0, x: 60, scale: current.escala }
            }
            animate={{ opacity: 1, x: 0, scale: current.escala }}
            exit={
              reduceMotion
                ? { opacity: 0, scale: current.escala }
                : { opacity: 0, x: -60, scale: current.escala }
            }
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            // Posicionada contra la caja y no en flujo, para que su caja sea
            // exactamente la del contenedor: así el factor de `escala` se aplica
            // sobre un ancho conocido y el resultado es predecible. En flujo, el
            // alto lo definían los atributos width/height y no coincidía del
            // todo con la caja 4/3.
            className="absolute inset-0 z-10 h-full w-full select-none object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)]"
          />
        </AnimatePresence>
      </div>

      <div className="relative z-20 mt-4 flex gap-2">
        {SLIDES.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ver ${p.name}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-7 bg-brand' : 'w-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
