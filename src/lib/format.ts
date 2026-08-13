/**
 * Precios con separador de miles y sin decimales: el catálogo maneja importes
 * redondos (US$ 4.400) y los centavos solo agregan ruido.
 */
export const formatPrice = (amount: number): string =>
  `US$ ${Math.round(amount).toLocaleString('es-ES')}`;
