import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { SITE } from '../data/site';

/** Enlaces sueltos del nav. Las categorías cuelgan del desplegable de Catálogo. */
const LINKS = [{ to: '/envios', label: 'Envíos' }];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-head font-medium text-sm uppercase tracking-wide px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
    isActive ? 'bg-brand text-ink' : 'text-zinc-400 hover:text-white hover:bg-white/5'
  }`;

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const location = useLocation();
  const catalogRef = useRef<HTMLDivElement>(null);

  // Los menús son overlays: si sobreviven al cambio de ruta, tapan la página a
  // la que el visitante acaba de entrar.
  useEffect(() => {
    setMenuOpen(false);
    setCatalogOpen(false);
  }, [location.pathname]);

  // El desplegable se cierra con Escape o al hacer clic afuera. Sin esto queda
  // abierto tapando la página y solo se cierra volviendo a tocar el botón.
  useEffect(() => {
    if (!catalogOpen) return;

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCatalogOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!catalogRef.current?.contains(e.target as Node)) setCatalogOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [catalogOpen]);

  // "Catálogo" queda marcado también estando dentro de una categoría.
  const inCatalog = location.pathname.startsWith('/catalogo');

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 glass-panel border-x-0 border-t-0 flex items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${SITE.name} — inicio`}>
          <img src="/logo.webp" alt="" width={32} height={32} className="w-8 h-8 rounded-full" />
          <span className="font-head font-bold uppercase leading-none tracking-[0.14em] text-base">
            {SITE.name}
            <small className="block text-[9.5px] tracking-[0.32em] text-brand font-semibold mt-[3px]">
              CATÁLOGO 2026
            </small>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-2">
          <div className="relative" ref={catalogRef}>
            <button
              type="button"
              onClick={() => setCatalogOpen((v) => !v)}
              aria-expanded={catalogOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 font-head font-medium text-sm uppercase tracking-wide px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                inCatalog ? 'bg-brand text-ink' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Catálogo
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${catalogOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {catalogOpen && (
              <div className="absolute left-0 top-full mt-2 w-60 rounded-2xl border border-white/10 bg-ink-deep/98 backdrop-blur-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <NavLink
                  to="/catalogo"
                  end
                  className={({ isActive }) =>
                    `block rounded-xl px-3.5 py-2.5 font-head text-sm font-semibold uppercase tracking-wide transition-colors ${
                      isActive ? 'bg-brand text-ink' : 'text-white hover:bg-white/5'
                    }`
                  }
                >
                  Ver todo
                </NavLink>

                <hr className="my-2 border-white/8" />

                {CATEGORIES.map((c) => (
                  <NavLink
                    key={c.slug}
                    to={`/catalogo/${c.slug}`}
                    className={({ isActive }) =>
                      `block rounded-xl px-3.5 py-2.5 font-head text-sm uppercase tracking-wide transition-colors ${
                        isActive ? 'bg-brand text-ink' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {c.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* El único control que queda a la derecha es el menú del celular: no
            hay carrito porque no hay pedido, esto solo se mira. */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Menú móvil. Acá las categorías van anidadas y siempre a la vista: en
          una pantalla chica un desplegable dentro de otro es un clic de más. */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 z-40 glass-panel border-x-0 p-2.5 flex flex-col gap-1.5 max-h-[calc(100svh-4rem)] overflow-y-auto transition-transform duration-300 ${
          menuOpen ? 'translate-y-0' : '-translate-y-[130%]'
        }`}
      >
        <NavLink
          to="/catalogo"
          end
          className={({ isActive }) =>
            `font-head font-semibold text-lg uppercase tracking-wide px-4 py-3.5 rounded-xl transition-colors ${
              isActive ? 'bg-brand text-ink' : 'bg-white/5 text-white'
            }`
          }
        >
          Catálogo
        </NavLink>

        <div className="flex flex-col gap-1.5 pl-4">
          {CATEGORIES.map((c) => (
            <NavLink
              key={c.slug}
              to={`/catalogo/${c.slug}`}
              className={({ isActive }) =>
                `font-head text-base uppercase tracking-wide px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-brand text-ink' : 'bg-white/[0.03] text-zinc-400'
                }`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>

        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `font-head font-semibold text-lg uppercase tracking-wide px-4 py-3.5 rounded-xl transition-colors ${
                isActive ? 'bg-brand text-ink' : 'bg-white/5 text-white'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </>
  );
};
