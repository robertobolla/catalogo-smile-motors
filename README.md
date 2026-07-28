# Catálogo Smile Motors 2026

Sitio estático (HTML + CSS + JS, sin build step). Se abre directamente con `index.html`.

## Dos versiones = dos branches

El repo mantiene dos versiones del mismo sitio. La **única** diferencia entre ellas son los
puntos de contacto: el botón "Contáctanos" del header y el botón flotante de WhatsApp.

| Branch    | Versión                          | Destino                        |
| --------- | -------------------------------- | ------------------------------ |
| `main`    | Sin datos de contacto            | `catalogo.smilemotors.online`  |
| `oficial` | Con contacto (WhatsApp) — como estaba antes | Página oficial      |

Lo que cambia entre branches:

- `index.html` — el `<a class="nav-cta">` del header, el bloque `<div class="wa-wrap">` flotante
  y el script de tracking del click de WhatsApp (Meta Pixel `Contact` + evento GA4 `whatsapp_click`).
- `css/styles.css` — las reglas `.nav-cta` y el bloque `/* WHATSAPP BTN */`.

## Cómo trabajar con las dos

Hacé los cambios comunes (productos, precios, imágenes, estilos) en `main` y después pasalos
a `oficial`:

```bash
git checkout oficial
git merge main
git checkout main
```

El merge no toca los elementos de contacto: viven solo en `oficial` y no existen en `main`,
así que se conservan solos. Si alguna vez hay conflicto, es señal de que un cambio tocó
justo esas líneas.

## Deploy (Vercel)

Cada versión se publica como un proyecto de Vercel distinto, apuntando al mismo repo pero
con distinta *Production Branch*:

- Proyecto del catálogo → Production Branch `main` → dominio `catalogo.smilemotors.online`
- Proyecto oficial → Production Branch `oficial` → dominio de la página oficial

> Nota: el archivo `_headers` usa sintaxis de Cloudflare Pages / Netlify y Vercel lo ignora.
> `.htaccess` solo aplica en hosting Apache. En Vercel, las cabeceras de cache se configuran
> con un `vercel.json`.
