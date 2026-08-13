import { LegalLayout } from './LegalLayout';

export function WarrantyPolicy() {
  return (
    <LegalLayout
      title="Garantía"
      description="Qué cubre la garantía de los vehículos y equipos vendidos por Smile Motors, por cuánto tiempo y cómo reclamarla."
      path="/garantia"
      updated="agosto de 2026"
    >
      <p>
        Todos los vehículos y equipos que vendemos salen revisados antes de despacharse y cuentan
        con garantía del fabricante. Esta página resume qué cubre, por cuánto tiempo y cómo
        reclamarla.
      </p>

      <h2>Qué cubre</h2>
      <ul>
        <li>Defectos de fabricación en el motor, el controlador y la estructura.</li>
        <li>Fallas de origen en baterías, inversores y paneles solares.</li>
        <li>Componentes eléctricos que fallen sin haber sido manipulados.</li>
      </ul>

      <h2>Qué no cubre</h2>
      <ul>
        <li>Desgaste normal de uso: neumáticos, pastillas de freno, fusibles y lámparas.</li>
        <li>Daños por accidente, golpe, inundación o uso fuera de la carga máxima indicada.</li>
        <li>Modificaciones, reparaciones o instalaciones hechas por terceros no autorizados.</li>
        <li>Baterías dañadas por cargadores no originales o por descargas profundas repetidas.</li>
      </ul>

      <h2>Plazos</h2>
      <p>
        El plazo depende del fabricante y del tipo de producto, y se informa en la ficha de cada
        modelo y en el comprobante de compra.
      </p>

      <h2>Cómo reclamar</h2>
      <p>
        El reclamo se hace por el mismo canal por el que se compró, con el número de pedido, el
        carné del receptor y fotos o video de la falla. El equipo de posventa evalúa el caso y
        coordina la reparación o el reemplazo de la pieza.
      </p>

      <h2>Traslados</h2>
      <p>
        Los costos de traslado del vehículo hasta el punto de servicio corren por cuenta del
        comprador, salvo que se acuerde algo distinto por escrito.
      </p>
    </LegalLayout>
  );
}
