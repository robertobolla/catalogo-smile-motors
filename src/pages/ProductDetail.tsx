import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Check,
  Truck,
  ShieldCheck,
  Download,
  Share2,
  Loader2,
} from 'lucide-react';
import type { ProductColor } from '../types';
import { useCatalog } from '../context/CatalogContext';
import { useSEO } from '../hooks/useSEO';
import { formatPrice } from '../lib/format';
import { SITE } from '../data/site';
import { customsDuty } from '../data/tariffs';
import { sinStock } from '../data/stock';
import { trackViewItem } from '../lib/analytics';
import { ProductCard } from '../components/ProductCard';
import { CatalogUnavailable } from '../components/CatalogUnavailable';
import { ProductGallery } from '../components/ProductGallery';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading, error } = useCatalog();

  const product = useMemo(() => products.find((p) => p.id === id) ?? null, [id, products]);
  const related = useMemo(
    () =>
      product
        ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)
        : [],
    [product, products],
  );
  const [color, setColor] = useState<ProductColor | undefined>();

  const agotado = product ? sinStock(product) : false;

  /** `null` = no lo sabemos (equipos solares), distinto de 0 = no paga. */
  const duty = product ? customsDuty(product) : null;

  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // El aviso ("Enlace copiado", un error) se borra solo: es una confirmación,
  // no un estado que haya que cerrar a mano.
  useEffect(() => {
    if (!aviso) return;
    const id = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(id);
  }, [aviso]);

  /**
   * jsPDF pesa más que media tienda, así que entra con import() dinámico: solo
   * baja cuando alguien pide la ficha.
   */
  const descargarPdf = async () => {
    if (!product || generandoPdf) return;
    setGenerandoPdf(true);
    try {
      const { descargarFichaPdf } = await import('../lib/productPdf');
      await descargarFichaPdf(product);
    } catch {
      setAviso('No pudimos generar el PDF. Probá de nuevo.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  /**
   * En el celular abre el menú del sistema (WhatsApp, mail); en escritorio, que
   * casi no soporta Web Share, copia el enlace. Se comparte la URL de
   * producción y no la del navegador: desde un preview o desde localhost, el
   * enlace que se manda tiene que seguir funcionando para quien lo reciba.
   */
  const compartir = async () => {
    if (!product) return;
    const enlace = `${SITE.url}/producto/${product.id}`;
    const datos = {
      title: product.name,
      text: `${product.name} — ${formatPrice(product.price)} · Smile Motors`,
      url: enlace,
    };

    if (navigator.share) {
      try {
        await navigator.share(datos);
        return;
      } catch (e) {
        // Cancelar el menú de compartir no es un error: no hay nada que avisar
        // ni a qué caer de vuelta.
        if ((e as Error)?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(enlace);
      setAviso('Enlace copiado al portapapeles.');
    } catch {
      // Sin permiso de portapapeles queda mostrarlo para copiar a mano. El
      // texto va delante del enlace: una URL suelta no se explica sola.
      setAviso(`Copiá el enlace: ${enlace}`);
    }
  };

  const jsonLd = useMemo(
    () =>
      product
        ? {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            // Las fotos del CRM ya vienen con dominio propio (Supabase Storage);
            // las de la copia local son rutas del sitio.
            image: product.image.startsWith('http') ? product.image : `${SITE.url}${product.image}`,
            description: product.description,
            category: product.categoryLabel,
            brand: { '@type': 'Brand', name: SITE.name },
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'USD',
              // Google muestra la disponibilidad en el resultado de búsqueda:
              // dejar `InStock` en un modelo agotado manda gente a una ficha
              // que no puede comprar, y es justo el dato que Merchant Center
              // marca como desajustado con lo que dice la página.
              availability: agotado
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock',
              url: `${SITE.url}/producto/${product.id}`,
            },
          }
        : undefined,
    [product, agotado],
  );

  useSEO({
    title: product
      ? `${product.name} — ${formatPrice(product.price)} | Smile Motors`
      : error
        ? 'Catálogo no disponible | Smile Motors'
        : 'Cargando… | Smile Motors',
    description: product
      ? product.description.slice(0, 300)
      : error
        ? 'No pudimos cargar el catálogo. Probá de nuevo en un momento.'
        : 'Ficha del producto en el catálogo de Smile Motors.',
    path: `/producto/${id}`,
    image: product?.image,
    jsonLd,
    ready: !!product,
  });

  useEffect(() => {
    setColor(undefined);
    if (!product) return;
    trackViewItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.categoryLabel,
    });
  }, [product]);

  // Mientras no llegó el catálogo no se puede afirmar que el modelo no existe.
  if (!product && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      </div>
    );
  }

  // Que no haya catálogo no significa que el modelo no exista: decir "no
  // existe" acá sería mentirle al que llegó por un link que sí es válido.
  if (!product && error) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 pt-28 text-zinc-900">
        <CatalogUnavailable />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-zinc-50 px-6 text-center text-zinc-900">
        <h1 className="title-display text-4xl">Ese modelo no existe</h1>
        <p className="text-zinc-500">Puede que lo hayamos dado de baja o que el enlace esté mal.</p>
        <Link to="/catalogo" className="btn-brand rounded-xl px-7 py-4 font-head text-xs font-bold uppercase tracking-widest text-ink">
          Ver el catálogo
        </Link>
      </div>
    );
  }

  return (
    // Ficha sobre claro: acá el producto es todo lo que importa, y la foto es un
    // recorte sin fondo que sobre blanco se ve entera.
    <div className="min-h-screen bg-zinc-50 px-6 pb-24 pt-24 text-zinc-900">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 font-head text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" /> Volver
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Fotos. La portada primero; el resto son las que ya estaban
              cargadas en el CRM para esa moto.

              El sticky va acá y no adentro de ProductGallery para que la foto,
              las miniaturas y los dos botones se fijen como un bloque solo
              mientras la columna de la derecha —que es mucho más larga— sigue
              bajando. `self-start` es lo que lo hace posible: sin eso el grid
              estira la celda a lo alto de la fila y el sticky no tiene contra
              qué pegarse. */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery
              images={[product.image, ...(product.gallery ?? [])]}
              alt={product.name}
              agotado={agotado}
            />

            {/* Acciones secundarias: llevarse la ficha o pasársela a alguien.
                Van acá abajo, colgando de las miniaturas, y no junto al botón de
                pedido: son cosas que se hacen DESPUÉS de mirar las fotos, y
                arriba competían por la atención con el pedido, que es lo que la
                página quiere que pase. Chicas y sin relleno, por lo mismo. */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={descargarPdf}
                disabled={generandoPdf}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 font-head text-xs font-bold uppercase tracking-widest text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:cursor-wait disabled:opacity-60"
              >
                {generandoPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {generandoPdf ? 'Generando…' : 'Descargar ficha (PDF)'}
              </button>

              <button
                type="button"
                onClick={compartir}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 font-head text-xs font-bold uppercase tracking-widest text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
              >
                <Share2 className="h-4 w-4" /> Compartir
              </button>

              {aviso && (
                <span aria-live="polite" className="text-xs text-zinc-500">
                  {aviso}
                </span>
              )}
            </div>
          </div>

          {/* Datos y pedido */}
          <div>
            <Link
              to={`/catalogo/${product.category}`}
              className="mb-3 inline-block font-head text-xs font-bold uppercase tracking-[0.3em] text-brand-ink hover:underline"
            >
              {product.categoryLabel}
            </Link>
            <h1 className="title-display mb-5 text-4xl text-zinc-900 lg:text-5xl">{product.name}</h1>

            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="title-display rounded-xl bg-brand px-3.5 py-1.5 text-4xl leading-none text-ink">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-zinc-500">Envío a Cuba incluido</span>
            </div>

            {/* El cartel de la foto es una imagen: sin este renglón, quien
                navega con lector de pantalla llega al precio y no se entera de
                que no hay unidades. Va pegado al precio porque es la misma
                pregunta —¿cuánto sale y me lo puedo llevar?— y no al final de
                la página, donde ya decidió.

                No dice "escribinos" como en la tienda: este proyecto no ofrece
                ningún canal de contacto a propósito (ver el encabezado de
                `data/site.ts`), así que mandar a escribir sería mandar a la
                nada. Se limita a decir el hecho. */}
            {agotado && (
              <p className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span className="font-head font-bold uppercase tracking-widest">Sin stock</span> — no
                hay unidades de este modelo en este momento.
              </p>
            )}

            {/* El arancel va pegado al precio y no escondido abajo: es el único
                importe que el comprador todavía va a tener que pagar, y verlo
                recién al retirar en Cuba es exactamente la sorpresa que
                queremos evitar. */}
            <p className="mb-6 text-sm text-zinc-500">
              {duty === null ? (
                <>Los aranceles de aduana no están incluidos en el precio y se pagan aparte.</>
              ) : duty === 0 ? (
                <>
                  <span className="font-semibold text-brand-ink">Sin arancel de aduana:</span> los
                  eléctricos no pagan.
                </>
              ) : (
                <>
                  No incluye el arancel de aduana:{' '}
                  <span className="font-semibold text-zinc-900">{formatPrice(duty)}</span> aparte.
                </>
              )}
            </p>

            {/* Colores */}
            {product.colors && product.colors.length > 0 && (
              <fieldset className="mb-6">
                <legend className="mb-2.5 font-head text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Colores disponibles
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => {
                    const selected = color?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(selected ? undefined : c)}
                        aria-pressed={selected}
                        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                          selected
                            ? 'border-zinc-900 bg-white text-zinc-900'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                        }`}
                      >
                        {/* El punto lleva borde oscuro: sobre blanco, un color
                            claro sin contorno no se ve. */}
                        <span
                          className="h-4 w-4 rounded-full border border-zinc-300"
                          style={{ background: c.hex }}
                        />
                        {c.name}
                        {selected && <Check className="h-3.5 w-3.5 text-brand-ink" />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
            {product.uniqueColor && (
              <p className="mb-6 font-head text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                Color único
              </p>
            )}

            {/* Acá iban los dos botones de pedido —WhatsApp y carrito—, y no
                los reemplaza nada: este es el catálogo, la ficha informa y
                termina ahí. Lo único que se puede hacer con el modelo es
                bajarse el PDF o pasarle el enlace a alguien, y esos dos botones
                ya están junto a las fotos. */}
            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-ink" />
                <p className="text-xs leading-relaxed text-zinc-600">
                  Envío a toda Cuba incluido en el precio. Sin cargos por flete al recibir.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-ink" />
                <p className="text-xs leading-relaxed text-zinc-600">
                  Sale revisado y con garantía de fábrica. Qué cubre está detallado en{' '}
                  <Link to="/garantia" className="underline hover:text-zinc-900">
                    Garantía
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Ficha técnica */}
            <section className="mb-8">
              <h2 className="mb-4 font-head text-sm font-bold uppercase tracking-[0.25em] text-brand-ink">
                Ficha técnica
              </h2>
              <dl className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3">
                    <dt className="font-head text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {key}
                    </dt>
                    <dd className="text-right text-sm font-medium text-zinc-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h2 className="mb-3 font-head text-sm font-bold uppercase tracking-[0.25em] text-brand-ink">
                Descripción
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600">{product.description}</p>
              {product.features && product.features.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-ink" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="title-display mb-8 text-3xl text-zinc-900">
              También en <span className="text-zinc-400">{product.categoryLabel}</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} theme="light" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
