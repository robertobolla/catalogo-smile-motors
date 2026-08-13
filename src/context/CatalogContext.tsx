import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Product } from '../types';

// El catálogo sale del CRM: precios, altas y bajas se editan en el admin y la
// web los toma de ahí.
//
// NO hay copia local de respaldo, a propósito. Tener una era peor que no
// mostrar nada: una moto dada de baja seguiría publicada y un precio corregido
// en el admin seguiría mostrándose viejo, sin que nada avise. Si el CRM no
// contesta, el sitio lo dice y ofrece reintentar (ver CatalogUnavailable).

const API =
  import.meta.env.VITE_CATALOG_API || 'https://admin.smilemotors.online/api/public/store';

interface CatalogContextType {
  products: Product[];
  /** Todavía no llegó el catálogo: no se puede afirmar que algo no existe. */
  loading: boolean;
  /** El CRM no contestó. No hay nada que mostrar. */
  error: boolean;
  /** Reintenta la carga (el botón del cartel de error). */
  retry: () => void;
}

const CatalogContext = createContext<CatalogContextType>({
  products: [],
  loading: true,
  error: false,
  retry: () => {},
});

// Se descartan las filas a las que les falta lo que la tarjeta necesita para
// renderizar. Un producto a medio cargar en el CRM no debe romper el listado.
const usable = (p: unknown): p is Product => {
  const x = p as Product;
  return Boolean(x?.id && x?.name && x?.category && typeof x?.price === 'number' && x?.image);
};

export const CatalogProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const ctrl = new AbortController();
    // Este efecto dejó de mandar (se desmontó o se pidió un reintento). Sin
    // esto, el abort del cleanup entra al catch de abajo y se muestra "no
    // pudimos cargar el catálogo" por una carga que en realidad se canceló
    // sola: pasa en cada doble montaje de React en desarrollo, y en producción
    // con cualquier navegación rápida.
    let cancelado = false;

    // Sin copia local no hay nada que mostrar mientras tanto, así que se espera
    // un poco; pasado ese tiempo es una caída, no lentitud.
    const timeout = setTimeout(() => ctrl.abort(), 12000);

    setLoading(true);
    setError(false);

    fetch(API, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelado) return;
        const list = Array.isArray(data?.products) ? data.products.filter(usable) : [];
        // Una respuesta vacía es casi siempre un error de configuración y no un
        // catálogo sin productos: se trata como falla en vez de mostrar una
        // tienda vacía sin explicación.
        if (!list.length) throw new Error('catálogo vacío');
        setProducts(list);
      })
      .catch(() => {
        // El timeout SÍ tiene que caer acá: aborta estando montado, y para el
        // visitante una respuesta que nunca llega es una caída.
        if (cancelado) return;
        setProducts([]);
        setError(true);
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
      clearTimeout(timeout);
      ctrl.abort();
    };
  }, [attempt]);

  return (
    <CatalogContext.Provider value={{ products, loading, error, retry }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => useContext(CatalogContext);
