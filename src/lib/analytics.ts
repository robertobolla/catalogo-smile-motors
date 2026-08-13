// Capa fina sobre GA4 y el Pixel de Meta.
//
// Si las variables no están definidas, cada función se vuelve un no-op: en
// desarrollo no se ensucian las métricas y el sitio funciona igual.

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string };
    _fbq?: unknown;
  }
}

let started = false;

export function initAnalytics() {
  if (started || typeof window === 'undefined') return;
  started = true;

  if (GA_ID) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    // El envío de páginas lo maneja useSEO, que espera al título correcto.
    window.gtag('config', GA_ID, { send_page_view: false });
  }

  if (PIXEL_ID) {
    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function (...args: unknown[]) {
        n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode!.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq!('init', PIXEL_ID);
  }
}

export function trackPageView(path: string, title: string) {
  window.gtag?.('event', 'page_view', { page_path: path, page_title: title });
  window.fbq?.('track', 'PageView');
}

type ItemInfo = {
  id: string;
  name: string;
  price: number;
  category?: string;
};

export function trackViewItem(item: ItemInfo) {
  window.gtag?.('event', 'view_item', {
    currency: 'USD',
    value: item.price,
    items: [{ item_id: item.id, item_name: item.name, item_category: item.category, price: item.price }],
  });
  window.fbq?.('track', 'ViewContent', {
    content_ids: [item.id],
    content_name: item.name,
    content_type: 'product',
    value: item.price,
    currency: 'USD',
  });
}

// Acá vivían `trackAddToCart` y `trackWhatsAppClick`. Se fueron con el carrito
// y el WhatsApp: este sitio no tiene conversión que medir, así que no manda
// `Lead` ni `Contact` al Pixel. Lo que queda es tráfico y qué modelos se miran.

/**
 * Salida hacia el programa de referidos, que vive en otro dominio.
 *
 * No va como `Lead`: el que se anota para referir no es un comprador, y
 * mezclarlo con los leads de venta ensucia el costo por lead de las campañas.
 */
export function trackReferralClick(where: string) {
  window.gtag?.('event', 'referral_click', { location: where });
}
