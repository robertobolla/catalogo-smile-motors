import type { ReactNode } from 'react';
import { useSEO } from '../../hooks/useSEO';

interface LegalLayoutProps {
  title: string;
  description: string;
  path: string;
  /** Fecha de última revisión, en texto. */
  updated: string;
  children: ReactNode;
}

/**
 * Marco común de las páginas legales: encabezado, ancho de lectura y estilos
 * de tipografía para el contenido, que va como JSX plano en cada página.
 */
export const LegalLayout = ({ title, description, path, updated, children }: LegalLayoutProps) => {
  useSEO({ title: `${title} | Smile Motors`, description, path });

  return (
    <div className="px-6 pb-24 pt-28">
      <article className="mx-auto max-w-3xl">
        <h1 className="title-display mb-3 text-4xl text-white lg:text-5xl">{title}</h1>
        <p className="mb-12 font-head text-xs uppercase tracking-[0.25em] text-zinc-500">
          Última actualización: {updated}
        </p>

        <div
          className="space-y-6 text-sm leading-relaxed text-zinc-400
                     [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-head [&_h2]:text-base [&_h2]:font-bold
                     [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-white
                     [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white [&_ul]:space-y-2"
        >
          {children}
        </div>
      </article>
    </div>
  );
};
