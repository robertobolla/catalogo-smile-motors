import { Link } from 'react-router-dom';
import { LegalLayout } from './LegalLayout';
import { SITE } from '../../data/site';

export function TermsOfService() {
  return (
    <LegalLayout
      title="Términos y condiciones"
      description="Condiciones de uso del catálogo de Smile Motors: precios, aranceles, disponibilidad y fichas técnicas."
      path="/terminos"
      updated="agosto de 2026"
    >
      <p>
        Estas condiciones aplican al uso de {SITE.url}. Te recomendamos leerlas antes de tomar
        cualquier decisión con la información publicada acá.
      </p>

      <h2>Qué es este sitio</h2>
      <p>
        <strong>Es un catálogo, no una tienda.</strong> No se vende, no se cobra y no se puede pedir
        nada desde acá: no hay carrito, ni checkout, ni formulario, ni ningún canal de contacto. Lo
        que publicamos son modelos, precios de referencia y fichas técnicas, a título informativo.
      </p>
      <p>
        Nada de lo publicado constituye una oferta contractual ni obliga a ninguna de las dos
        partes. Consultar el catálogo no genera ninguna relación comercial.
      </p>

      <h2>Precios</h2>
      <p>
        Todos los precios están expresados en <strong>dólares estadounidenses (USD)</strong> e
        incluyen el costo del envío hasta el destino en Cuba. Son de referencia y pueden cambiar sin
        aviso previo.
      </p>
      <p>
        Los precios <strong>no incluyen los aranceles de aduana</strong>, que se pagan aparte y
        dependen del tipo de vehículo. Los montos vigentes están publicados en{' '}
        <Link to="/envios">Envíos y entregas</Link> y se informan también en la ficha de cada
        modelo. Al ser un tributo fijado por la autoridad aduanera, puede cambiar sin que dependa de
        nosotros.
      </p>

      <h2>Disponibilidad</h2>
      <p>
        Que un modelo figure en el catálogo no garantiza que esté disponible. El listado puede
        contener errores u omisiones y se actualiza sin aviso.
      </p>

      <h2>Envíos y entrega</h2>
      <p>
        La información de <Link to="/envios">Envíos y entregas</Link> describe cómo operamos:
        entregamos únicamente en Cuba y el envío está incluido en el precio de cada modelo. Los
        plazos son estimados y dependen de la logística y de las condiciones aduaneras del destino.
      </p>

      <h2>Uso del vehículo</h2>
      <p>
        El comprador es responsable de cumplir las normas de circulación, registro y seguro que
        correspondan en el país de destino. Smile Motors no responde por multas, sanciones ni daños
        derivados del uso del vehículo.
      </p>

      <h2>Fichas técnicas e imágenes</h2>
      <p>
        Las fotos son ilustrativas y las fichas técnicas provienen del fabricante. Puede haber
        variaciones menores de color, accesorios o especificaciones entre lotes. La información se
        publica de buena fe y sin garantía de exactitud.
      </p>
    </LegalLayout>
  );
}
