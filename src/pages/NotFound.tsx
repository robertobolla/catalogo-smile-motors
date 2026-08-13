import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export function NotFound() {
  useSEO({
    title: 'Página no encontrada | Smile Motors',
    description: 'La página que buscás no existe.',
    path: '/404',
  });

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="title-display text-8xl text-brand/20">404</span>
      <h1 className="title-display text-3xl text-white">Esta página no existe</h1>
      <p className="max-w-sm text-zinc-400">
        Puede que el enlace esté mal escrito o que hayamos movido el contenido.
      </p>
      <Link
        to="/"
        className="btn-brand rounded-xl px-7 py-4 font-head text-xs font-bold uppercase tracking-widest text-ink"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
