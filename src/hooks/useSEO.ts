import { useEffect } from 'react';
import { trackPageView } from '../lib/analytics';
import { SITE } from '../data/site';

const DEFAULT_IMAGE = `${SITE.url}/logo.png`;

type SEOOptions = {
  title: string;
  description: string;
  /** Ruta relativa, ej. '/producto/gn-200'. Se usa para canonical y og:url. */
  path?: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
  /**
   * false mientras la página todavía carga sus datos. Evita registrar la visita
   * con el título provisional: la ficha de producto llama al hook dos veces.
   */
  ready?: boolean;
};

/** Última ruta enviada a analítica, para no contar dos veces la misma visita. */
let lastTrackedPath: string | null = null;

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

/**
 * Da a cada ruta su propio título, descripción y preview social. Sin esto la
 * SPA sirve el mismo <title> en todas las páginas y Google las trata como
 * duplicadas.
 */
export function useSEO({ title, description, path = '/', image, jsonLd, ready = true }: SEOOptions) {
  useEffect(() => {
    const url = `${SITE.url}${path}`;
    const img = image ? (image.startsWith('http') ? image : `${SITE.url}${image}`) : DEFAULT_IMAGE;

    document.title = title;
    setMeta('name', 'description', description);
    setCanonical(url);

    // La vista se registra acá y no en el router: al cambiar de ruta el título
    // todavía es el de la página anterior y quedaría mal guardada.
    if (ready && path !== lastTrackedPath) {
      lastTrackedPath = path;
      trackPageView(path, title);
    }

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', img);

    if (!jsonLd) return;

    // Con id propio para reemplazarlo al cambiar de ruta y no acumular bloques.
    const ID = 'route-jsonld';
    document.getElementById(ID)?.remove();
    const script = document.createElement('script');
    script.id = ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => document.getElementById(ID)?.remove();
  }, [title, description, path, image, jsonLd, ready]);
}
