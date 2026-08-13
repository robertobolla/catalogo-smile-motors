import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Las fotos del producto: la principal grande y el resto en miniaturas debajo.
//
// Las fotos extra son las que ya estaban cargadas en el CRM (varias por moto:
// detalles del tablero, el baúl, el motor). La portada la define el admin con
// `is_primary` y acá siempre va primera.

interface ProductGalleryProps {
  images: string[];
  alt: string;
  /** Marca la foto grande con el cartel de agotado. Ver `data/stock.ts`. */
  agotado?: boolean;
}

export const ProductGallery = ({ images, alt, agotado = false }: ProductGalleryProps) => {
  // Sin duplicados: si la misma URL quedó cargada dos veces en el CRM, la
  // miniatura repetida parece un bug.
  const fotos = useMemo(() => [...new Set(images.filter(Boolean))], [images]);

  const [index, setIndex] = useState(0);
  const activaRef = useRef<HTMLButtonElement>(null);

  // Al cambiar de producto (por ejemplo desde "modelos relacionados") se vuelve
  // a la portada: si no, se abre la ficha nueva en la foto 4 de la anterior.
  useEffect(() => setIndex(0), [fotos]);

  // La tira de miniaturas scrollea: la activa tiene que quedar a la vista
  // cuando se navega con las flechas y no con un clic en la miniatura.
  useEffect(() => {
    activaRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [index]);

  const total = fotos.length;
  const ir = (paso: number) => setIndex((i) => (i + paso + total) % total);

  if (!total) return null;

  return (
    // Sin sticky acá: lo pone quien la usa. La galería no es lo único que se
    // fija —abajo van los botones de ficha y compartir, y tienen que quedarse
    // con ella—, y un sticky adentro de otro sticky se pisa. Ver ProductDetail.
    <div>
      {/* Las flechas se ven siempre, no al hover: en el celular no hay hover, y
          en desktop una flecha que aparece sola es una función que la mitad de
          la gente no descubre. */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-100 p-6">
        {/* Alto fijo: las fotos del CRM vienen en proporciones distintas y sin
            esto la página salta en cada cambio. */}
        <div className="flex aspect-[4/3] w-full items-center justify-center">
          <img
            src={fotos[index]}
            alt={total > 1 ? `${alt} — foto ${index + 1} de ${total}` : alt}
            width={760}
            height={573}
            // Solo la portada es el LCP de la ficha; las demás se piden al verlas.
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
            className="max-h-full w-full object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.22)]"
          />
        </div>

        {/* El cartel va sobre la foto grande, igual que en la tarjeta del
            catálogo, para que la ficha diga lo mismo que la grilla de la que se
            llegó. Las miniaturas quedan limpias: repetir la cinta seis veces no
            informa más y tapa el detalle que la miniatura existe para mostrar.

            No bloquea el clic para que las flechas de abajo sigan andando. */}
        {agotado && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-6"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-white/55" />
            <img
              src="/images/sin-stock.webp"
              alt=""
              decoding="async"
              className="relative w-full select-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]"
            />
          </div>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => ir(-1)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2.5 text-zinc-700 shadow-sm backdrop-blur transition hover:border-zinc-900 hover:text-zinc-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => ir(1)}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2.5 text-zinc-700 shadow-sm backdrop-blur transition hover:border-zinc-900 hover:text-zinc-900"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* En el celular no hay hover que revele las flechas: el contador
                avisa que hay más fotos. */}
            <span className="absolute bottom-3 right-3 rounded-full bg-zinc-900/75 px-2.5 py-1 font-head text-[11px] font-bold tracking-widest text-white">
              {index + 1}/{total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {fotos.map((src, i) => (
            <button
              key={src}
              ref={i === index ? activaRef : undefined}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              className={`shrink-0 overflow-hidden rounded-xl border bg-white p-1 transition ${
                i === index ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-16 w-20 object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
