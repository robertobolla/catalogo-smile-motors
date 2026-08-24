// La vista previa de un link (WhatsApp, Facebook, Telegram) sale de los meta
// del HTML inicial, y los rastreadores NO ejecutan JavaScript: en una SPA
// siempre veían el título y el logo genéricos. Esta función atiende
// /producto/:slug (rewrite en vercel.json), toma el index.html construido y le
// reescribe título, descripción, canonical y og:/twitter: con los datos reales
// del producto, del mismo endpoint del CRM que usa la app. Para el humano no
// cambia nada: es el mismo HTML y la SPA arranca igual.
//
// La imagen es el JPEG cuadrado sobre blanco que genera
// admin/scripts/generar_og_jpgs.mjs (product-images/og/<crmId>.jpg): WhatsApp
// no muestra imágenes de más de ~600 KB y las portadas crudas pesan 1 MB+. Si
// para un producto nuevo todavía no se generó, va la portada cruda: algunos
// rastreadores la muestran igual, y es mejor que el logo.

const API = 'https://admin.smilemotors.online/api/public/store';
const OG_BASE = 'https://wulpehiqggtdosfxfkhz.supabase.co/storage/v1/object/public/product-images/og';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default async function handler(req: any, res: any) {
  const slug = String(req.query.slug || '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const shell = await (await fetch(`https://${host}/index.html`)).text();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  try {
    const { products } = await (await fetch(API)).json();
    const p = products.find((x: any) => x.id === slug);
    if (!p) throw new Error('producto inexistente');

    const title = `${p.name} — US$ ${Number(p.price).toLocaleString('en-US')} | Smile Motors`;
    const desc =
      String(p.description || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200) || `${p.name} en Smile Motors, con envío a Cuba incluido.`;
    const url = `https://${host}/producto/${encodeURIComponent(slug)}`;

    let image = p.image as string | null;
    if (p.crmId) {
      const og = `${OG_BASE}/${p.crmId}.jpg`;
      const head = await fetch(og, { method: 'HEAD' });
      if (head.ok) image = og;
    }

    let html = shell
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/<meta name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(desc)}" />`)
      .replace(/<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${url}" />`)
      .replace(/<meta property="og:type"[^>]*\/>/, `<meta property="og:type" content="product" />`)
      .replace(/<meta property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${esc(title)}" />`)
      .replace(/<meta property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(desc)}" />`)
      .replace(/<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${url}" />`)
      .replace(/<meta name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${esc(title)}" />`)
      .replace(/<meta name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${esc(desc)}" />`);
    if (image) {
      html = html
        .replace(/<meta property="og:image"[^>]*\/>/, `<meta property="og:image" content="${image}" />`)
        .replace(/<meta name="twitter:image"[^>]*\/>/, `<meta name="twitter:image" content="${image}" />`);
    }

    // El precio cambia poco: 10 min de CDN + un día sirviendo lo último
    // conocido mientras revalida.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch {
    // Sin CRM (o slug inexistente) se sirve el HTML tal cual: la SPA muestra su
    // propio "no existe" / "catálogo no disponible", que ya sabe defenderse.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
    return res.status(200).send(shell);
  }
}
