# Smile Motors — Catálogo 2026

Catálogo de Smile Motors. Vite + React 19 + React Router + Tailwind 4.

Sale de una copia de `../tienda`, a la que se le sacó todo lo que abría una
conversación. **Esa es la regla del proyecto y conviene leerla antes de tocar
nada:**

> Este sitio **no ofrece ningún canal de contacto**. No hay teléfono, ni correo,
> ni WhatsApp, ni redes, ni chat, ni formulario, ni carrito. Se entra, se miran
> modelos y precios, y se sale.

**Por qué:** cada vendedor manda este enlace a sus propios clientes. El cliente
tiene que poder mirar el catálogo entero y no encontrar ninguna otra forma de
seguir la compra: la venta vuelve por donde vino, al vendedor que se lo mandó.
Un solo teléfono o correo publicado acá le da al cliente una vía directa a la
empresa y le saca la venta al vendedor. Eso es lo que este sitio evita.

No es una lista de features pendientes: los legales, el schema.org y la
analítica están escritos sobre ese hecho. Agregar un solo botón de contacto
obliga a revisar los tres, no solo el botón —y rompe el trato con los
vendedores, que es lo más caro de los dos.

El único enlace que saca al visitante del sitio es el de referidos, en la home.
No expone ningún teléfono nuestro (manda al `wa.me` sin número, que abre el
WhatsApp del propio visitante), pero si se registra deja su contacto y la
empresa lo llama. Se decidió dejarlo; si alguna vez hay que cerrar esa puerta,
se borra la sección 5 de `src/pages/LandingPage.tsx`.

## Qué se sacó respecto de `../tienda`

| Se fue | Estaba en |
| --- | --- |
| Carrito completo | `CartContext`, `CartDrawer`, botón del navbar, "Añadir" de la tarjeta y de la ficha |
| Botones de WhatsApp | hero, ficha de producto, pie, cartel de catálogo caído, `/envios` |
| Chat con el asistente | `ChatWidget`, `lib/chat.ts`, `VITE_CHAT_API` |
| Página y formulario de contacto | `/contacto`, `api/leads.ts` |
| Alta de newsletter | `NewsletterForm`, `api/newsletter.ts` |
| Carpeta `/api` entera | también `vite-api-plugin.ts` y la dependencia de Supabase |
| Teléfono, correo e Instagram | `data/site.ts`, pie, legales, pie del PDF, JSON-LD |
| `trackWhatsAppClick` y `trackAddToCart` | `lib/analytics.ts` |

La tienda sigue intacta en `../tienda`: esto es un proyecto aparte, no un
reemplazo. Si un arreglo aplica a los dos, hay que hacerlo dos veces.

## Qué quedó

- **Catálogo** — 4 categorías (triciclos, motos eléctricas, motos de combustión,
  energía solar), con filtro, orden por precio y ficha completa por modelo.
- **Ficha en PDF** — se descarga desde la ficha del producto. El pie ya no lleva
  teléfono ni correo: el PDF se reenvía y seguiría derivando consultas mucho
  después de haberse bajado.
- **Compartir** — Web Share en el celular, copiar enlace en escritorio.
- **`/envios`** — cómo se entrega en Cuba y cuánto es el arancel de aduana. Los
  teléfonos que figuran son de las sucursales de Aerovaradero, no nuestros.
- **Referidos** — la home enlaza a `referidos.smilemotors.online`, que es una app
  aparte. Es lo único que saca al visitante del sitio; si tampoco tiene que
  estar, se borra la sección 5 de `LandingPage.tsx`.
- **Analítica** — GA4 y Pixel de Meta, solo tráfico y fichas vistas. Sin evento
  de conversión, porque no hay conversión posible.

## De dónde salen los productos

Del CRM, igual que la tienda: `VITE_CATALOG_API` →
`admin/app/api/public/store`. **No hay copia local de respaldo**, a propósito:
publicar un catálogo viejo cuando el CRM no contesta muestra precios ya
corregidos y modelos dados de baja, sin que nada avise. Si la API falla, el
sitio lo dice y ofrece reintentar (`CatalogUnavailable`).

Precios, altas y bajas se editan en el admin y acá se ven solos. No hay nada que
importar ni ningún archivo de productos que mantener.

## Setup

```bash
npm install
npm run dev
```

Queda en `http://localhost:3005` (la tienda usa el 3004, así que pueden correr
las dos a la vez). Arranca sin `.env.local`: apunta al admin de producción por
defecto.

`.env.local` (copiar de `.env.local.example`) sirve para dos cosas: apuntar el
catálogo a un admin local y poner los IDs de analítica. Son todas `VITE_*`, o
sea que van al navegador — **acá no hay ni puede haber secretos**, porque el
proyecto no tiene funciones de servidor.

## Deploy (Vercel)

Proyecto nuevo apuntando a esta carpeta, con las variables de
`.env.local.example`. El `vercel.json` ya redirige todas las rutas a
`index.html` (es una SPA) y no hay funciones que desplegar.

**Ojo con el dominio.** `SITE.url` (en `src/data/site.ts`), el canonical y los
`og:` de `index.html` están puestos en `catalogo.smilemotors.online`, que hoy
sirve el catálogo estático viejo de `../catalogo-smile-motors`. Si este proyecto
lo reemplaza, está bien; si va a convivir con él, hay que cambiar el dominio en
esos dos archivos antes de publicar o los canonical van a apuntar al sitio
equivocado.

## Pendientes

- **Textos legales**: `/garantia`, `/terminos` y `/privacidad` se reescribieron
  para este sitio (sin formulario, sin carrito, sin canal de contacto), pero
  conviene que los revise alguien con criterio legal antes de publicar. En
  particular, `/privacidad` no ofrece ninguna dirección para ejercer derechos
  sobre los datos, porque el sitio no tiene ningún canal: si eso es un problema,
  la solución es agregar un correo ahí, no reabrir el contacto en todo el sitio.
