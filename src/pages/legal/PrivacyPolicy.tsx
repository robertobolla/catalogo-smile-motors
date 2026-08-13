import { LegalLayout } from './LegalLayout';
import { SITE } from '../../data/site';

export function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Política de privacidad"
      description="Qué datos recolecta el catálogo de Smile Motors y para qué los usa."
      path="/privacidad"
      updated="agosto de 2026"
    >
      <p>
        Esta política explica qué datos recolectamos en {SITE.url} y para qué los usamos. Es un
        catálogo: se mira y nada más.
      </p>

      <h2>Qué datos recolectamos</h2>
      <p>
        <strong>Ninguno que vos nos des.</strong> Este sitio no tiene formularios, carrito, chat ni
        alta de newsletter: no hay ningún campo donde escribir tu nombre, tu correo ni tu teléfono,
        y no recibimos datos tuyos por acá.
      </p>
      <p>Lo único que se registra es navegación anónima:</p>
      <ul>
        <li>
          <strong>Datos de navegación:</strong> páginas visitadas y productos vistos, mediante
          Google Analytics y el píxel de Meta. Sirven para entender qué modelos se miran.
        </li>
      </ul>

      <h2>Datos de pago</h2>
      <p>
        <strong>No pedimos ni recibimos datos de tarjetas.</strong> Acá no se compra ni se paga: el
        catálogo muestra precios de referencia y no tiene formulario de tarjeta en ninguna página.
      </p>

      <h2>Con quién los compartimos</h2>
      <p>
        Solo con los proveedores necesarios para operar el sitio: Vercel (alojamiento), Google y
        Meta (analítica y publicidad). No vendemos ni cedemos datos a terceros.
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos cookies de terceros para analítica y publicidad. Podés bloquearlas desde tu
        navegador: el catálogo funciona igual, porque no guarda ningún estado tuyo entre visitas.
      </p>
    </LegalLayout>
  );
}
