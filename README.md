# Catálogo Smile Motors 2026

Sitio estático (HTML + CSS + JS, sin build step). Se abre directamente con `index.html`.

## Dos versiones = dos branches

El repo mantiene dos versiones del mismo sitio. Las diferencias son los puntos de contacto
—el botón "Contáctanos" del header y el botón flotante de WhatsApp— y el panel de newsletter.
Las tres cosas existen **solo en `oficial`**.

| Branch    | Versión                              | Destino                       |
| --------- | ------------------------------------ | ----------------------------- |
| `main`    | Catálogo puro: sin contacto ni newsletter | `catalogo.smilemotors.online` |
| `oficial` | Con contacto (WhatsApp) y newsletter | `smilemotors.online` + `www`  |

Lo que cambia entre branches:

- `index.html` — el `<a class="nav-cta">` del header, el bloque `<div class="wa-wrap">` flotante,
  el script de tracking del click de WhatsApp (Meta Pixel `Contact` + evento GA4
  `whatsapp_click`), la `<section class="panel newsletter">` y su item en el `.menu`.
- `css/styles.css` — las reglas `.nav-cta`, el bloque `/* WHATSAPP BTN */` y el bloque
  `/* NEWSLETTER */`.
- `js/app.js` — el handler de suscripción (`#nlForm`) y el mapeo de nav del panel newsletter.

## Cómo trabajar con las dos

Hacé los cambios comunes (productos, precios, imágenes, estilos) en `main` y después pasalos
a `oficial`:

```bash
git checkout oficial
git merge main
git checkout main
```

El merge no toca los elementos exclusivos de `oficial` (contacto y newsletter): viven solo
ahí y no existen en `main`, así que se conservan solos.

Si hay conflicto, es señal de que un cambio tocó justo esas líneas. El caso típico es el
`?v=` de `css/styles.css` y `js/app.js`, que está pegado a los bloques exclusivos: se resuelve
conservando el bloque de `oficial` y llevándole el `?v=` nuevo de `main`.

> Importante: nunca borres en `main` algo que tenga que seguir viviendo en `oficial`. Si lo
> hacés, el próximo merge se lo lleva. Lo que sea exclusivo de `oficial` tiene que ser un
> **agregado** de esa branch, no una ausencia en `main`.

## Deploy (Vercel)

Cada versión se publica como un proyecto de Vercel distinto, apuntando al mismo repo pero
con distinta *Production Branch*:

- Proyecto oficial → Production Branch `oficial` → dominio `smilemotors.online` (apex)
- Proyecto del catálogo → Production Branch `main` → dominio `catalogo.smilemotors.online`

DNS del dominio está en Hostinger (`ns1/ns2.dns-parking.com`). Registros que necesita Vercel:

| Tipo    | Nombre     | Valor                   |
| ------- | ---------- | ----------------------- |
| `A`     | `@`        | `216.150.1.1`           |
| `CNAME` | `catalogo` | `cname.vercel-dns.com`  |

> Nota: el archivo `_headers` usa sintaxis de Cloudflare Pages / Netlify y Vercel lo ignora.
> `.htaccess` solo aplica en hosting Apache. En Vercel, las cabeceras de cache se configuran
> con un `vercel.json`.
