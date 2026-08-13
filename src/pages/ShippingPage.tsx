import { Link } from 'react-router-dom';
import { Truck, MapPin, Package } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { SHIPPING_METHODS } from '../data/site';
import { AEROVARADERO, DELIVERY_MODES, SIN_SUCURSAL } from '../data/delivery';
import { CUSTOMS_DUTY } from '../data/tariffs';
import { formatPrice } from '../lib/format';

const STEPS = [
  {
    icon: Package,
    title: 'Se hace el pedido',
    desc: 'Se elige el modelo del catálogo y se registran los datos del receptor en Cuba.',
  },
  {
    icon: Truck,
    title: 'Despachamos el vehículo',
    desc: 'El envío ya está pagado con el modelo: coordinamos la fecha y lo mandamos al destino.',
  },
  {
    icon: MapPin,
    title: 'Entrega al receptor',
    desc: 'Los eléctricos y los solares llegan al domicilio; los híbridos y de combustión se retiran en Aerovaradero. Siempre con el carné del receptor.',
  },
];

export function ShippingPage() {
  useSEO({
    title: 'Envíos y entregas | Smile Motors',
    description:
      'Cómo enviamos a Cuba con el flete incluido: los eléctricos y solares llegan al domicilio y los híbridos y de combustión se retiran en Aerovaradero. Sucursales, aranceles y seguimiento.',
    path: '/envios',
  });

  return (
    <div className="px-6 pb-24 pt-28">
      <div className="mx-auto max-w-4xl">
        <span className="mb-3 block font-head text-xs font-bold uppercase tracking-[0.35em] text-brand">
          Logística
        </span>
        <h1 className="title-display mb-6 text-4xl text-white lg:text-6xl">Envíos y entregas</h1>
        <p className="mb-12 max-w-2xl leading-relaxed text-zinc-400">
          Operamos desde Miami y entregamos en toda Cuba. El flete está incluido en el precio de
          cada modelo: no se cobra aparte al despachar ni al recibir. Lo único que va por fuera del
          precio del catálogo es el arancel de aduana, y acá abajo está cuánto es.
        </p>

        <section className="mb-14">
          <h2 className="mb-6 font-head text-sm font-bold uppercase tracking-[0.25em] text-brand">
            Cómo funciona
          </h2>
          <ol className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl border border-white/8 bg-ink-card/40 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="title-display text-2xl text-brand/40">0{i + 1}</span>
                  <s.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mb-2 font-head text-base font-bold uppercase tracking-tight">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* La forma de entrega depende del vehículo, y antes esta página lo
            contaba como si fuera una sola: "La Habana / resto de Cuba". Quien
            compraba una moto de combustión se enteraba después de que tenía que
            ir a buscarla. Los dos casos van uno al lado del otro, con el tipo
            de vehículo como primera línea de cada tarjeta. */}
        <section className="mb-14">
          <h2 className="mb-2 font-head text-sm font-bold uppercase tracking-[0.25em] text-brand">
            Formas de entrega
          </h2>
          <p className="mb-6 leading-relaxed text-zinc-400">
            Depende del tipo de vehículo. Fijate cuál es tu caso antes de comprar:
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {DELIVERY_MODES.map((m) => (
              <li key={m.id} className="rounded-3xl border border-white/8 bg-ink-card/40 p-6">
                <span className="mb-3 inline-block rounded-lg bg-brand px-2.5 py-1 font-head text-[11px] font-bold uppercase tracking-widest text-ink">
                  {m.applies}
                </span>
                <h3 className="mb-2 font-head text-base font-bold uppercase tracking-tight">
                  {m.label}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">{m.detail}</p>
                {m.id === 'domicilio' && (
                  <ul className="mt-4 space-y-1.5 border-t border-white/8 pt-4">
                    {SHIPPING_METHODS.map((s) => (
                      <li key={s.id} className="text-sm text-zinc-400">
                        <span className="font-semibold text-white">{s.label}:</span> {s.detail}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Las sucursales van completas y con teléfono: quien compra desde
            afuera necesita poder decirle al receptor a dónde ir, y el receptor
            necesita poder llamar antes de viajar. */}
        <section className="mb-14">
          <h2 className="mb-2 font-head text-sm font-bold uppercase tracking-[0.25em] text-brand">
            Sucursales de Aerovaradero
          </h2>
          <p className="mb-6 leading-relaxed text-zinc-400">
            Solo para <strong className="text-white">híbridos y vehículos de combustión</strong>. El
            receptor retira en la sucursal que ustedes elijan —no tiene que ser la de su provincia—
            presentando su carné de identidad. La sucursal definitiva queda asentada en el contrato.
          </p>
          <ul className="divide-y divide-white/5 rounded-3xl border border-white/8">
            {AEROVARADERO.map((s) => (
              <li key={s.provincia} className="px-6 py-5">
                <h3 className="font-head text-base font-bold uppercase tracking-wide">
                  {s.provincia}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{s.direccion}</p>
                <p className="mt-1.5 flex flex-wrap gap-x-4 text-sm">
                  {s.telefonos.map((t) => (
                    <a
                      key={t}
                      href={`tel:${t.replace(/[^+\d]/g, '')}`}
                      className="text-brand transition-colors hover:text-white"
                    >
                      {t}
                    </a>
                  ))}
                </p>
              </li>
            ))}
          </ul>

          <h3 className="mb-3 mt-8 font-head text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Si tu provincia no tiene sucursal
          </h3>
          <ul className="divide-y divide-white/5 rounded-3xl border border-white/8">
            {SIN_SUCURSAL.map((p) => (
              <li
                key={p.provincia}
                className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4"
              >
                <span className="text-sm text-zinc-400">{p.provincia}</span>
                <span className="font-head text-sm font-bold uppercase tracking-wide">
                  {p.cercanas}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* El arancel es el único importe que no está en el precio del
            catálogo. Va en su propia sección y con los montos a la vista: es la
            diferencia entre un dato y una sorpresa en la aduana. */}
        <section className="mb-14">
          <h2 className="mb-6 font-head text-sm font-bold uppercase tracking-[0.25em] text-brand">
            Aranceles de aduana
          </h2>
          <p className="mb-6 leading-relaxed text-zinc-400">
            Los aranceles de aduana <strong className="text-white">no están incluidos</strong> en el
            precio de los modelos y se pagan aparte. El monto es fijo según el tipo de vehículo:
          </p>
          <ul className="divide-y divide-white/5 rounded-3xl border border-white/8">
            {[
              { label: 'Vehículos de combustión', amount: CUSTOMS_DUTY.combustion },
              { label: 'Vehículos híbridos', amount: CUSTOMS_DUTY.hibrido },
              { label: 'Vehículos eléctricos', amount: CUSTOMS_DUTY.electrico },
            ].map((row) => (
              <li key={row.label} className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-5">
                <span className="font-head text-base font-bold uppercase tracking-wide">{row.label}</span>
                <span className={`title-display text-xl ${row.amount === 0 ? 'text-brand' : 'text-white'}`}>
                  {row.amount === 0 ? 'No pagan' : formatPrice(row.amount)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-zinc-500">
            En la ficha de cada modelo figura el arancel que le corresponde. Los equipos de energía
            solar no tienen un monto fijo publicado.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="mb-6 font-head text-sm font-bold uppercase tracking-[0.25em] text-brand">
            Seguimiento
          </h2>
          <p className="leading-relaxed text-zinc-400">
            El código de seguimiento de tu pedido es el{' '}
            <strong className="text-white">carné de identidad del receptor</strong>. Es un dato que
            ya conocés, así que no tenés que guardar ningún número extra para consultar en qué
            estado está el envío.
          </p>
        </section>

        {/* Acá había un "Escribinos" con botón de WhatsApp. Sin canal al que
            mandar a nadie, el cierre de la página es volver al catálogo. */}
        <div className="flex flex-col gap-3 rounded-3xl border border-white/8 bg-ink-card/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-300">
            Cada ficha indica el arancel y la forma de entrega que le corresponde al modelo.
          </p>
          <Link
            to="/catalogo"
            className="btn-brand shrink-0 rounded-xl px-5 py-3.5 text-center font-head text-xs font-bold uppercase tracking-widest text-ink"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
