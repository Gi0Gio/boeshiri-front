import { PageHeader, Card, Chip, Btn, Reveal, DemoNote, RowActions } from '../ui'
import { productos, usuarioActual } from '../../data/panel'

const estadoTono = { Publicado: 'caribbean', Vendido: 'gris', Oculto: 'terracotta' }

export default function MiMarketplace() {
  const mios = productos.filter((p) => p.miembro === usuarioActual.nombre)

  return (
    <>
      <PageHeader
        eyebrow="Miembro"
        title="Mi marketplace"
        description="Publica tus productos. Boesh Irí no gestiona pagos: el visitante te contacta con los datos de tu perfil."
        actions={<Btn tone="candy">+ Nuevo producto</Btn>}
      />

      <Reveal className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-caribbean/25 bg-caribbean/[0.06] p-5">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-cream">Estás dado de alta en el marketplace</p>
            <p className="mt-1 font-mono text-xs text-tea/55">Tu contacto se toma del perfil: {usuarioActual.correo}</p>
          </div>
          <Chip tone="caribbean">Vendedor activo</Chip>
        </div>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mios.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 90}>
            <Card className="overflow-hidden p-0">
              <div className="relative flex aspect-[4/3] items-end justify-between p-4" style={{ background: `linear-gradient(150deg, ${p.colores[0]}, ${p.colores[1]})` }}>
                <Chip tone="tea">{p.categoria}</Chip>
                <span className="font-display text-2xl font-semibold text-white">${p.precio}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-base font-semibold uppercase leading-tight tracking-wide text-cream">{p.nombre}</h3>
                  <Chip tone={estadoTono[p.estado]}>{p.estado}</Chip>
                </div>
                <p className="mt-2 font-mono text-xs text-tea/45">📍 {p.ubicacion}</p>
                <div className="mt-4 border-t border-tea/8 pt-3">
                  <RowActions items={['Editar', p.estado === 'Publicado' ? 'Ocultar' : 'Mostrar', 'Compartir', 'Eliminar']} />
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-xs text-tea/45">Al <strong className="text-tea/70">compartir</strong>, se genera un enlace + imagen para redes con un clic. Boesh Irí también puede republicar tu enlace.</p>
      <DemoNote />
    </>
  )
}
