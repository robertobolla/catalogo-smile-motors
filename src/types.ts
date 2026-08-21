export type CategorySlug = 'triciclos' | 'motos-electricas' | 'e-bikes' | 'combustion' | 'energia-solar';

export interface ProductColor {
  id: string;
  name: string;
  /** Color CSS para el punto del selector, ej. '#c5202a'. */
  hex: string;
}

export interface Product {
  id: string;
  /** id del producto en el catálogo estático (prod-8). Permite re-importar. */
  legacyId?: string;
  name: string;
  category: CategorySlug;
  categoryLabel: string;
  price: number;
  /**
   * Precio de lista del catálogo. Ya NO se muestra: venía en 58 de los 59
   * productos, así que el tachado no señalaba una oferta, era decoración. Se
   * conserva el dato por si alguna vez hay una rebaja real y puntual.
   */
  oldPrice?: number;
  image: string;
  gallery?: string[];
  description: string;
  /** Ficha técnica completa, en el orden en que se muestra. */
  specs: Record<string, string>;
  /** Las 3 claves de `specs` que se destacan en la tarjeta. */
  highlights: string[];
  colors?: ProductColor[];
  /** El modelo viene en un solo color: se muestra "Color único". */
  uniqueColor?: boolean;
  features?: string[];
  /**
   * Elegido a mano en el CRM para la portada. Solo viaja cuando está marcado:
   * el endpoint omite el campo en el resto.
   */
  featured?: boolean;
  /** Unidades disponibles. Viene de /api/products; el catálogo local no lo trae. */
  stock?: number;
  isActive?: boolean;
}

export interface CartItem {
  /** id del producto + color elegido: dos colores son dos líneas distintas. */
  cartItemId: string;
  product: Product;
  color?: ProductColor;
  quantity: number;
}
