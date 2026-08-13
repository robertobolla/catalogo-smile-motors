import { Link } from 'react-router-dom';
import { SITE } from '../data/site';
import { CATEGORIES } from '../data/categories';

// Sin teléfono, sin correo, sin redes y sin alta de newsletter: este pie cierra
// el catálogo, no ofrece por dónde escribirnos. Queda navegación —las líneas de
// producto y las páginas de ayuda— y nada más.

export const Footer = () => (
  <footer className="border-t border-white/8 bg-ink-deep/60 px-6 py-14">
    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
      <div className="md:col-span-2">
        <Link to="/" className="mb-4 flex items-center gap-2.5">
          <img src="/logo.webp" alt="" width={36} height={36} className="h-9 w-9 rounded-full" />
          <span className="font-head text-lg font-bold uppercase tracking-[0.14em]">{SITE.name}</span>
        </Link>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
          Triciclos, motos eléctricas, motos de combustión y sistemas de energía solar. Envíos a
          toda Cuba, con el flete incluido en el precio.
        </p>
      </div>

      <nav aria-labelledby="footer-cat">
        <h3 id="footer-cat" className="mb-4 font-head text-xs font-bold uppercase tracking-[0.25em] text-brand">
          Catálogo
        </h3>
        <ul className="space-y-2.5 text-sm text-zinc-400">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link to={`/catalogo/${c.slug}`} className="transition-colors hover:text-white">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-labelledby="footer-help">
        <h3 id="footer-help" className="mb-4 font-head text-xs font-bold uppercase tracking-[0.25em] text-brand">
          Ayuda
        </h3>
        <ul className="space-y-2.5 text-sm text-zinc-400">
          <li><Link to="/envios" className="transition-colors hover:text-white">Envíos y entregas</Link></li>
          <li><Link to="/garantia" className="transition-colors hover:text-white">Garantía</Link></li>
          <li><Link to="/terminos" className="transition-colors hover:text-white">Términos y condiciones</Link></li>
          <li><Link to="/privacidad" className="transition-colors hover:text-white">Privacidad</Link></li>
        </ul>
      </nav>
    </div>

    <div className="mx-auto mt-12 max-w-7xl border-t border-white/5 pt-6 text-xs text-zinc-500">
      <p>© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</p>
    </div>
  </footer>
);
