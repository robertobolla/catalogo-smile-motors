import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import type { Product } from '../types';
import { ProductImage } from './ProductImage';
import { formatPrice } from '../lib/format';

interface ProductCardProps {
  product: Product;
  /**
   * `light` es la tarjeta de las zonas de catálogo: fondo blanco, foto sobre
   * gris claro y texto oscuro. Las fotos son recortes sin fondo, así que sobre
   * blanco el producto se lee entero en vez de fundirse con el negro. `dark`
   * queda para cuando la tarjeta vive sobre el fondo oscuro de la marca.
   */
  theme?: 'dark' | 'light';
  variants?: Variants;
}

export const ProductCard = ({ product, theme = 'dark', variants }: ProductCardProps) => {
  const light = theme === 'light';

  return (
    <motion.article
      variants={variants}
      className={`group relative flex h-full flex-col rounded-3xl border p-5 transition-all duration-500 hover:-translate-y-1 ${
        light
          ? 'border-zinc-200 bg-white hover:border-brand hover:shadow-[0_20px_50px_-12px_rgba(245,196,0,0.45)]'
          : 'border-white/8 bg-ink-card/60 backdrop-blur-sm hover:border-brand/40 hover:shadow-[0_20px_50px_rgba(245,196,0,0.08)]'
      }`}
    >
      {/* El enlace cubre la tarjeta con una capa absoluta en vez de envolverla.
          Ya no hay nada más que clickear adentro —el botón de añadir se fue con
          el carrito—, pero la capa se queda: mantiene el <a> fuera del contenido
          y el foco visible sobre la tarjeta entera. */}
      <Link
        to={`/producto/${product.id}`}
        aria-label={`${product.name} — ver ficha`}
        className={`absolute inset-0 z-10 rounded-3xl outline-none focus-visible:ring-2 ${
          light ? 'focus-visible:ring-brand-ink' : 'focus-visible:ring-brand'
        }`}
      />

      <div className="pointer-events-none flex flex-1 flex-col">
        {/* Sobre claro no va el halo amarillo: sobre blanco ensucia en vez de
            recortar. Un degradado gris hace el mismo trabajo de separar la foto. */}
        <div
          className={`relative mb-5 h-56 overflow-hidden rounded-2xl bg-gradient-to-b to-transparent sm:h-64 ${
            light ? 'from-zinc-100' : 'product-halo from-white/[0.04]'
          }`}
        >
          {/* ProductImage y no un <img> suelto: iguala el tamaño en pantalla de
              vehículos cuyos recortes traen distinto margen vacío. El encuadre
              (el 92% de la caja) lo pone él, por eso acá ya no hay w-[92%]. */}
          <ProductImage
            src={product.image}
            alt={product.name}
            className={`transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105 ${
              light
                ? 'drop-shadow-[0_15px_15px_rgba(0,0,0,0.22)]'
                : 'drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]'
            }`}
          />
        </div>

        <div className="mb-2 flex items-center justify-between gap-3">
          <span
            className={`font-head text-[12px] font-bold uppercase tracking-[0.25em] ${
              light ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            {product.categoryLabel}
          </span>
          {/* El precio va sobre amarillo y no en amarillo: el tono de marca
              como texto sobre blanco da 1,6:1 y no se lee. De fondo con tinta
              oscura llega a 12:1 y encima destaca, que es lo que se busca. El
              mismo tratamiento sirve en claro y en oscuro. */}
          <span className="title-display shrink-0 rounded-lg bg-brand px-2.5 py-1 text-2xl leading-none text-ink">
            {formatPrice(product.price)}
          </span>
        </div>

        <h3
          className={`mb-4 font-head text-xl font-bold uppercase leading-tight tracking-tight transition-colors ${
            light ? 'text-zinc-900 group-hover:text-brand-ink' : 'text-white group-hover:text-brand'
          }`}
        >
          {product.name}
        </h3>

        <div className="mt-auto">
          {/* Los tres datos que deciden la compra. Cuáles son depende de la
              categoría (una moto se elige por motor, un inversor por potencia). */}
          <div
            className={`mb-4 grid grid-cols-3 gap-1 rounded-xl border-y py-3 text-center ${
              light ? 'border-brand/30 bg-brand/[0.07]' : 'border-white/8 bg-black/20'
            }`}
          >
            {product.highlights.map((key, i) => (
              <div
                key={key}
                className={
                  i < product.highlights.length - 1
                    ? light
                      ? 'border-r border-brand/30'
                      : 'border-r border-white/8'
                    : ''
                }
              >
                <p
                  className={`px-1 font-head text-[10px] font-bold uppercase tracking-widest ${
                    light ? 'text-brand-ink' : 'text-brand'
                  }`}
                >
                  {key}
                </p>
                <p
                  className={`mt-0.5 truncate px-1.5 text-[12px] font-semibold ${
                    light ? 'text-zinc-900' : 'text-white'
                  }`}
                  title={product.specs[key]}
                >
                  {product.specs[key]}
                </p>
              </div>
            ))}
          </div>

          <span
            className={`flex items-center gap-1.5 font-head text-[12px] font-bold uppercase tracking-widest transition-colors ${
              light ? 'text-brand-ink group-hover:text-zinc-900' : 'text-brand group-hover:text-white'
            }`}
          >
            Ver ficha <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </motion.article>
  );
};
