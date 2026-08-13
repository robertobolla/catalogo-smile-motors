import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from '../components/ProductCard';
import { CatalogUnavailable } from '../components/CatalogUnavailable';
import { useSEO } from '../hooks/useSEO';

type SortKey = 'destacados' | 'precio-asc' | 'precio-desc';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'destacados', label: 'Destacados' },
  { key: 'precio-asc', label: 'Menor precio' },
  { key: 'precio-desc', label: 'Mayor precio' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/**
 * Píldora de categoría. La activa va en amarillo de marca con texto casi negro:
 * sobre el gris claro de la página es lo único que lleva color de relleno, así
 * que se ve de un vistazo en qué categoría estás parado.
 *
 * El amarillo va de fondo y nunca de texto: #f5c400 sobre blanco da 2,4:1 y no
 * se lee, pero con texto ink encima pasa de 10:1.
 */
const pillClass = (active: boolean) =>
  `shrink-0 rounded-xl border px-4 py-2.5 font-head text-xs font-bold uppercase tracking-widest transition-colors ${
    active
      ? 'border-brand bg-brand text-ink shadow-[0_6px_18px_-6px_rgba(245,196,0,0.7)]'
      : 'border-zinc-200 bg-white text-zinc-600 hover:border-brand hover:text-zinc-900'
  }`;

export const CatalogPage = () => {
  const { category } = useParams<{ category?: string }>();
  const { products, loading, error } = useCatalog();
  const [sort, setSort] = useState<SortKey>('destacados');

  const activeCategory = CATEGORIES.find((c) => c.slug === category);
  const title = activeCategory ? activeCategory.label : 'Catálogo completo';

  useSEO({
    title: `${title} | Smile Motors`,
    description: activeCategory
      ? `${activeCategory.label} de Smile Motors: precios en dólares y fichas técnicas, con envío a Cuba incluido.`
      : 'Catálogo completo de Smile Motors: triciclos, motos eléctricas, motos de combustión y sistemas solares.',
    path: activeCategory ? `/catalogo/${activeCategory.slug}` : '/catalogo',
  });

  // El catálogo llega del CRM, pero el primer render ya tiene la copia local:
  // no hay pantalla de carga que esperar, la lista se refresca sola al llegar.
  const visible = useMemo(() => {
    const list = category ? products.filter((p) => p.category === category) : products;
    if (sort === 'precio-asc') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'precio-desc') return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, sort, products]);

  return (
    // Banda clara: esta página es solo producto, y sobre blanco las fotos
    // (recortes sin fondo) se leen enteras en vez de fundirse con el negro.
    <div className="min-h-screen bg-zinc-50 px-6 pb-24 pt-28 text-zinc-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <span className="mb-3 block font-head text-xs font-bold uppercase tracking-[0.35em] text-brand-ink">
            Smile Motors · 2026
          </span>
          <h1 className="title-display mb-3 text-4xl text-zinc-900 lg:text-6xl">{title}</h1>
          <p aria-live="polite" className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="inline-block h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            {loading ? (
              'Cargando el catálogo…'
            ) : error ? (
              'Catálogo no disponible'
            ) : (
              <>
                <span className="font-semibold text-zinc-900">{visible.length}</span>
                {visible.length === 1 ? 'modelo disponible' : 'modelos disponibles'}
              </>
            )}
          </p>
        </header>

        {/* Categorías y orden comparten renglón: el filtro va a la derecha, en
            el hueco que dejaban las píldoras, en vez de gastar una fila entera.
            También en el celular, aunque ahí las píldoras queden en ~200px y
            haya que scrollearlas: apiladas, la barra fija medía 136px y con el
            navbar se comía un cuarto de la pantalla, tapando más de lo que
            resolvía. Una barra fija tiene que ser baja antes que completa.

            Se pega bajo el navbar al scrollear: en un catálogo de 58 modelos,
            volver arriba para cambiar de categoría es el gesto que más se
            repite. `top-16` = alto del navbar (h-16); z-30 lo deja por debajo
            del navbar (z-50) y del menú mobile (z-40), y por encima de las
            tarjetas. El `-mx-6` compensa el padding de la página para que el
            fondo tape de borde a borde y las fotos no asomen por los costados. */}
        <div className="sticky top-16 z-30 -mx-6 mb-8 flex items-center gap-2 border-b border-zinc-200/70 bg-zinc-50/90 px-6 py-3 backdrop-blur-md sm:gap-3 sm:py-4">
          <nav
            className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1"
            aria-label="Categorías"
          >
            <Link to="/catalogo" aria-current={!category ? 'page' : undefined} className={pillClass(!category)}>
              Todo
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to={`/catalogo/${c.slug}`}
                aria-current={category === c.slug ? 'page' : undefined}
                className={pillClass(category === c.slug)}
              >
                {c.label}
              </Link>
            ))}
          </nav>

          {/* Orden. Sin catálogo no hay nada que ordenar, así que el control no
              se renderiza. No alcanza con taparlo por clase: `hidden` y `flex`
              son los dos display y en Tailwind gana el que salga último. */}
          {products.length > 0 && (
            <div className="flex shrink-0 items-center gap-2 pb-1">
              {/* En el celular el ícono se oculta: es decoración y ahí cada
                  píxel de ancho se lo pelean las píldoras. El estado "ordenado
                  por precio" igual se ve en el borde amarillo del select. */}
              <SlidersHorizontal
                className={`hidden h-4 w-4 shrink-0 transition-colors sm:block ${sort === 'destacados' ? 'text-zinc-400' : 'text-brand-ink'}`}
              />
              <label htmlFor="sort" className="sr-only">
                Ordenar por
              </label>
              {/* Ordenado por precio es un estado activo, igual que la
                  categoría: el borde amarillo avisa que lo que se ve no es el
                  orden por defecto. */}
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={`cursor-pointer rounded-xl border px-2.5 py-2.5 font-head text-xs font-bold uppercase tracking-widest text-zinc-900 outline-none transition-colors focus:border-brand sm:px-3.5 ${
                  sort === 'destacados' ? 'border-zinc-200 bg-white' : 'border-brand bg-brand/10'
                }`}
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
          </div>
        ) : error ? (
          <CatalogUnavailable />
        ) : visible.length === 0 ? (
          <p className="py-20 text-center text-zinc-500">
            No hay modelos en esta categoría por ahora.{' '}
            <Link to="/catalogo" className="text-brand-ink hover:underline">
              Ver todo el catálogo
            </Link>
            .
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} theme="light" variants={fadeInUp} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
