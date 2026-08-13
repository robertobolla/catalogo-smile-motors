// Las cuatro líneas de la tienda. Viven acá y no vienen del CRM porque son
// navegación: el navbar y el pie las necesitan para renderizar aunque el
// catálogo no haya cargado. Los slugs coinciden con el check de
// `products.store_category` en la base (migración 0092).
// `short` es el nombre para el filtro del catálogo en pantallas chicas: con el
// label largo las cinco píldoras no entran en un renglón de celular. Se recorta
// la parte que ya dice el contexto ("Motos de Combustión" está en la barra de
// categorías de motos), nunca la palabra que distingue una línea de otra.
export const CATEGORIES = [
  { slug: 'triciclos', label: 'Triciclos', short: 'Triciclos' },
  { slug: 'motos-electricas', label: 'Motos Eléctricas', short: 'Eléctricas' },
  { slug: 'combustion', label: 'Motos de Combustión', short: 'Combustión' },
  { slug: 'energia-solar', label: 'Energía Solar', short: 'Solar' },
] as const;
