import { RotateCcw } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';

// Qué se muestra cuando el catálogo no cargó.
//
// La alternativa era dejar publicada una copia local, y es peor: mostraría
// precios que el admin ya corrigió y modelos que dio de baja, sin que nada
// avise. Acá se dice lo que pasa y se ofrece reintentar.
//
// En la tienda este cartel derivaba a un asesor por WhatsApp, que era la vía
// por la que se cerraba la venta igual. Acá no hay a quién derivar: el catálogo
// no ofrece ningún canal, así que la única salida honesta es volver a intentar.

export const CatalogUnavailable = ({ compact = false }: { compact?: boolean }) => {
  const { retry } = useCatalog();

  return (
    <div
      className={`mx-auto flex max-w-lg flex-col items-center gap-5 text-center ${
        compact ? 'py-12' : 'py-20'
      }`}
    >
      <h2 className="title-display text-3xl text-zinc-900">No pudimos cargar el catálogo</h2>
      <p className="text-zinc-500">
        Es un problema nuestro y suele durar poco. Preferimos no mostrarte precios que puedan estar
        desactualizados: probá de nuevo en un momento.
      </p>

      <button
        type="button"
        onClick={retry}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-6 py-3.5 font-head text-xs font-bold uppercase tracking-widest text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
      >
        <RotateCcw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  );
};
