import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  HandCoins,
  Share2,
  ShieldCheck,
  Tag,
  Truck,
  UserPlus,
} from 'lucide-react';
import type { Product } from '../types';
import { CATEGORIES } from '../data/categories';
import { useCatalog } from '../context/CatalogContext';
import { CatalogUnavailable } from '../components/CatalogUnavailable';
import { HeroSlider } from '../components/HeroSlider';
import { ProductCard } from '../components/ProductCard';
import { Footer } from '../components/Footer';
import { useSEO } from '../hooks/useSEO';
import { SITE } from '../data/site';
import { trackReferralClick } from '../lib/analytics';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

/**
 * Cuántos modelos entran en "Modelos destacados". Tres, que es una fila entera
 * de la grilla de 3 columnas: con cuatro quedaría uno solo colgando abajo.
 */
const DESTACADOS = 3;

/** Una foto representativa por categoría, para las tarjetas del índice. */
const categoryImage = (list: Product[], slug: string) =>
  list.find((p) => p.category === slug)?.image ?? '/logo.webp';

export const LandingPage = () => {
  const { products, error } = useCatalog();

  useSEO({
    // El título repite la keyword del <h1> a propósito: son las dos señales más
    // fuertes que tiene un buscador y tienen que decir lo mismo. La marca va al
    // final porque nadie busca "Smile Motors" antes de saber que existe.
    title: 'Motos y triciclos con envío a Cuba | Smile Motors',
    description:
      'Triciclos de carga, motos eléctricas, motos de combustión y sistemas solares con precios en dólares y envío a toda Cuba incluido.',
    path: '/',
  });

  // Tres modelos como muestra del catálogo. Primero los que vengan marcados como
  // destacados en el CRM, en el orden de la grilla.
  const marcados = products.filter((p) => p.featured).slice(0, DESTACADOS);

  // Los lugares que sobren los llena la regla de siempre: el más accesible de
  // cada línea, recorriéndolas en orden. Antes esto ordenaba por descuento, pero
  // el precio tachado estaba en 58 de 59 productos: no señalaba ninguna oferta,
  // solo repetía el mismo cartel en todas las tarjetas.
  //
  // Sin nada marcado la portada se ve exactamente como antes, y por eso la regla
  // sigue acá en vez de reemplazarse: es lo que sostiene la sección el día que
  // se destilda todo.
  //
  // OJO: sola nunca llega a energía solar. Las líneas son cuatro y los lugares
  // tres, así que la última se queda afuera salvo que se la marque a mano —que
  // es justamente el agujero que vino a tapar el flag.
  const marcadosIds = new Set(marcados.map((p) => p.id));
  const automaticos = CATEGORIES.flatMap((c) =>
    products
      .filter((p) => p.category === c.slug && !marcadosIds.has(p.id))
      .sort((a, b) => a.price - b.price)
      .map((p, rank) => ({ p, rank })),
  )
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.p);

  const featured = [...marcados, ...automaticos].slice(0, DESTACADOS);

  // Nueve modelos para la grilla de 3×3 del catálogo, con el mismo reparto por
  // línea que los destacados y sin repetirlos: si volvieran a salir las mismas
  // tres motos, la sección no agregaría catálogo, solo lo duplicaría.
  const featuredIds = new Set(featured.map((p) => p.id));
  const catalogPreview = CATEGORIES.flatMap((c) =>
    products
      .filter((p) => p.category === c.slug && !featuredIds.has(p.id))
      .sort((a, b) => a.price - b.price)
      .map((p, rank) => ({ p, rank })),
  )
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 9)
    .map((x) => x.p);

  return (
    <div className="overflow-hidden">
      {/* 1. HERO */}
      {/* El hero ocupa la pantalla entera. `dvh` y no `vh`: en el celular la
          barra del navegador aparece y desaparece, y con `vh` el alto se calcula
          contra la ventana sin barra — el hero queda más alto que lo que se ve y
          empuja el contenido fuera de la pantalla. */}
      <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 pb-16 pt-28">
        <div
          aria-hidden="true"
          className="title-display pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none text-[34vw] leading-none text-white/[0.025]"
        >
          2026
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* La etiqueta lleva el sustantivo completo del producto y el <h1>
                la keyword por la que alguien busca. Antes era al revés: la
                etiqueta decía la marca y el <h1> era "Potencia, innovación y
                movilidad", tres palabras que no le dicen nada a un buscador.
                El eslogan sobrevive como segunda mitad, atenuado. */}
            <motion.span
              variants={fadeInUp}
              className="mb-4 block font-head text-xs font-bold uppercase tracking-[0.35em] text-brand"
            >
              Catálogo 2026 · Triciclos, motos y energía solar
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="title-display mb-5 text-5xl text-white sm:text-6xl lg:text-7xl"
            >
              Motos y triciclos<br />con envío a Cuba.
              <span className="mt-1 block text-zinc-400">Potencia y movilidad.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="mb-8 max-w-md text-base leading-relaxed text-zinc-400">
              Triciclos de carga, motos eléctricas y de combustión, y sistemas solares completos.
              Precios en dólares con el envío a Cuba ya incluido.
            </motion.p>

            {/* Un solo botón. Antes al lado había un "Consultar por WhatsApp",
                que era la conversión del sitio; acá la única acción posible es
                seguir mirando el catálogo. */}
            <motion.div variants={fadeInUp} className="mb-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/catalogo"
                className="btn-brand flex items-center justify-center gap-2.5 rounded-xl px-7 py-4 font-head text-xs font-bold uppercase tracking-widest text-ink"
              >
                Ver el catálogo <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[12px] font-semibold text-zinc-400"
            >
              <span className="flex items-center gap-1.5"><span className="text-brand">✓</span> Envíos a toda Cuba</span>
              <span className="flex items-center gap-1.5"><span className="text-brand">✓</span> Envío incluido en el precio</span>
              <span className="flex items-center gap-1.5"><span className="text-brand">✓</span> Financiación disponible</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            <HeroSlider />
          </motion.div>
        </div>

        <a
          href="#categorias"
          aria-label="Ver categorías"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/40 transition-colors hover:text-white"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" strokeWidth={2.5} />
        </a>
      </section>

      {/* 2. MODELOS DESTACADOS (banda clara)

          El resto de la página es negro de marca; los productos van sobre claro
          para que la vista se pare acá. Las fotos son recortes sin fondo: sobre
          blanco se ve la moto entera, sobre negro se le comen los bordes. */}
      {error && (
        <section className="bg-zinc-50 px-6 py-20 text-zinc-900 sm:py-24">
          <CatalogUnavailable compact />
        </section>
      )}

      {featured.length > 0 && (
        <section className="bg-zinc-50 px-6 py-20 text-zinc-900 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="mb-3 block font-head text-xs font-bold uppercase tracking-[0.35em] text-brand-ink">
                Una muestra del catálogo
              </span>
              <h2 className="title-display text-4xl text-zinc-900 lg:text-5xl">
                Modelos <span className="text-zinc-400">destacados</span>
              </h2>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} theme="light" variants={fadeInUp} />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* 3. CATEGORÍAS */}
      {/* Más aire abajo que arriba: sin ese respiro las tarjetas quedan
          apretadas contra la sección siguiente. */}
      <section id="categorias" className="border-y border-white/5 bg-ink-deep/40 px-6 pb-[150px] pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="mb-3 block font-head text-xs font-bold uppercase tracking-[0.35em] text-brand">
              Cuatro líneas
            </span>
            <h2 className="title-display text-4xl text-white lg:text-5xl">Elegí por dónde empezar</h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} variants={fadeInUp}>
                <Link
                  to={`/catalogo/${cat.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-white/8 bg-ink-card/50 p-6 transition-all hover:-translate-y-1 hover:border-brand/40"
                >
                  <span className="title-display mb-3 text-3xl text-brand/30 transition-colors group-hover:text-brand">
                    0{i + 1}
                  </span>
                  <div className="product-halo relative mb-4 flex h-32 items-center justify-center">
                    <img
                      src={categoryImage(products, cat.slug)}
                      alt=""
                      loading="lazy"
                      className="relative z-10 max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-head text-lg font-bold uppercase leading-tight tracking-tight transition-colors group-hover:text-brand">
                    {cat.label}
                  </h3>
                  {/* Sin catálogo cargado no se dice "0 modelos": la categoría
                      existe igual y el conteo falso desalienta el click. */}
                  {products.length > 0 && (
                    <span className="mt-1 text-xs text-zinc-500">
                      {products.filter((p) => p.category === cat.slug).length} modelos
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. CATÁLOGO (banda clara) */}
      {/* Nueve modelos en 3×3, sobre claro por lo mismo que los destacados: las
          fotos son recortes sin fondo y sobre negro se les comen los bordes. */}
      {catalogPreview.length > 0 && (
        <section id="catalogo" className="bg-zinc-50 px-6 py-20 text-zinc-900 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="mb-3 block font-head text-xs font-bold uppercase tracking-[0.35em] text-brand-ink">
                Una vuelta por las cuatro líneas
              </span>
              <h2 className="title-display text-4xl text-zinc-900 lg:text-5xl">Catálogo</h2>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
              variants={stagger}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {catalogPreview.map((p) => (
                <ProductCard key={p.id} product={p} theme="light" variants={fadeInUp} />
              ))}
            </motion.div>

            <div className="mt-12 text-center">
              {/* Amarillo de marca. Acá no compite con nada: está fuera de las
                  tarjetas, donde el amarillo ya se lo lleva el precio. */}
              <Link
                to="/catalogo"
                className="btn-brand inline-flex items-center gap-2 rounded-xl px-7 py-4 font-head text-xs font-bold uppercase tracking-widest text-ink"
              >
                Ver el catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. REFERIDOS */}
      {/* Va acá, pegada al catálogo, y no al final: el que llegó hasta este
          punto ya vio los precios, que es lo que hace vendible el código.
          Sección propia y no un bloque adentro del catálogo porque esa banda
          está condicionada a `catalogPreview` — si el CRM no contesta se
          esconde entera, y el programa de referidos no depende del catálogo.
          Oscura por la regla de bandas: no hay fotos de producto. */}
      <section className="border-t border-white/5 bg-ink-deep px-6 py-20 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mx-auto max-w-5xl"
        >
          <motion.div variants={fadeInUp} className="text-center">
            <span className="mb-3 block font-head text-xs font-bold uppercase tracking-[0.35em] text-brand">
              Programa de referidos
            </span>
            <h2 className="title-display text-4xl lg:text-5xl">Trabajá con nosotros</h2>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-zinc-400">
              No hace falta local ni experiencia vendiendo. Recomendás Smile Motors con
              tu código: tu referido ahorra en su compra y vos cobrás una bonificación por
              cada persona que compra.
            </p>
          </motion.div>

          {/* Los tres pasos son los mismos de la app de referidos. Si allá
              cambian, hay que cambiarlos acá: son dos proyectos distintos. */}
          <motion.div variants={fadeInUp} className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: UserPlus,
                n: '01',
                title: 'Creá tu cuenta',
                desc: 'Te registrás con tu correo y te queda un código personal de 8 caracteres.',
              },
              {
                icon: Share2,
                n: '02',
                title: 'Compartí tu código',
                desc: 'Se lo pasás a familiares y amigos que quieran comprar. Ellos lo usan al hacer el pedido.',
              },
              {
                icon: HandCoins,
                n: '03',
                title: 'Cobrás cuando compran',
                desc: 'Seguís tus ganancias desde tu panel: a cobrar, en camino y cobrado.',
              },
            ].map((paso) => (
              <div key={paso.n} className="border-t border-white/10 pt-7">
                <div className="mb-4 flex items-center gap-3">
                  <paso.icon className="h-7 w-7 text-brand" />
                  <span className="font-head text-xs font-bold tracking-[0.3em] text-zinc-600">
                    {paso.n}
                  </span>
                </div>
                <h3 className="mb-3 font-head text-lg font-bold uppercase tracking-tight">
                  {paso.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">{paso.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Dominio aparte, así que `a` y no `Link`: el router de la tienda no
              conoce estas rutas. `noopener` es obligatorio con target _blank. */}
          <motion.div
            variants={fadeInUp}
            className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href={SITE.referidos}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackReferralClick('home_referidos')}
              className="btn-brand inline-flex items-center gap-2 rounded-xl px-7 py-4 font-head text-xs font-bold uppercase tracking-widest text-ink"
            >
              Quiero mi código <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={`${SITE.referidos}/ingresar`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackReferralClick('home_referidos_login')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-7 py-4 font-head text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white/40"
            >
              Ya tengo cuenta
            </a>
          </motion.div>

          {/* Sin montos a propósito: el descuento, la bonificación y la compra
              mínima los configura el admin en `app_settings` y la app de
              referidos los lee en vivo. Escritos acá quedarían mintiendo el día
              que los cambien. */}
          <motion.p variants={fadeInUp} className="mt-6 text-center text-xs text-zinc-500">
            Aplica a partir de una compra mínima y no podés usar tu propio código en tu
            compra. Los montos vigentes están en la página del programa.
          </motion.p>
        </motion.div>
      </section>

      {/* 6. POR QUÉ SMILE MOTORS */}
      {/* Clara para cortar la seguidilla de negro: referidos, esta y el pie
          quedaban pegados en un solo bloque oscuro. Acá el claro no rompe la
          regla de "donde hay producto, va claro" — no hay fotos que dependan
          del fondo, son íconos — y de paso la home vuelve a alternar
          claro/oscuro de punta a punta. */}
      <section className="bg-zinc-50 px-6 py-20 text-zinc-900 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3"
        >
          {[
            {
              icon: Truck,
              title: 'Envío a toda Cuba',
              desc: 'Coordinamos la entrega con el receptor en La Habana o en cualquier provincia. Seguí tu pedido con el carné del receptor.',
            },
            {
              icon: ShieldCheck,
              title: 'Garantía respaldada',
              desc: 'Cada vehículo sale revisado y con garantía de fábrica. Qué cubre y por cuánto tiempo está detallado en la página de garantía.',
            },
            {
              icon: Tag,
              title: 'Precio con el flete incluido',
              desc: 'El envío hasta Cuba ya está en el precio: no se suma al despachar ni al entregar. Aparte va el arancel de aduana, que sabés de antemano: US$ 265 en combustión, US$ 165 en híbridos y nada en eléctricos.',
            },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeInUp} className="border-t border-zinc-200 pt-7">
              {/* `brand-deep` y no `brand`: el amarillo de marca sobre blanco da
                  1,6:1 y el ícono se desvanece. */}
              <item.icon className="mb-4 h-7 w-7 text-brand-deep" />
              <h3 className="mb-3 font-head text-lg font-bold uppercase tracking-tight">{item.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};
