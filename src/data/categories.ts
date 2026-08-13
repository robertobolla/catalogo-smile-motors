// Las cuatro líneas de la tienda. Viven acá y no vienen del CRM porque son
// navegación: el navbar y el pie las necesitan para renderizar aunque el
// catálogo no haya cargado. Los slugs coinciden con el check de
// `products.store_category` en la base (migración 0092).
export const CATEGORIES = [
  { slug: 'triciclos', label: 'Triciclos' },
  { slug: 'motos-electricas', label: 'Motos Eléctricas' },
  { slug: 'combustion', label: 'Motos de Combustión' },
  { slug: 'energia-solar', label: 'Energía Solar' },
] as const;
