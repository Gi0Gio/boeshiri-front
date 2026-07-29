import { PageHeader, Card, Chip, Btn, Reveal, DemoNote } from '../ui'
import { comisiones } from '../../data/panel'

export default function AdminComisiones() {
  return (
    <>
      <PageHeader eyebrow="Administración" title="Comisiones y equipos" description="Áreas permanentes de trabajo. La administración ve solicitantes y el contenido de cada grupo sin ser miembro." actions={<Btn tone="candy">+ Nueva comisión</Btn>} />

      <div className="grid gap-4 md:grid-cols-2">
        {comisiones.map((c, i) => (
          <Reveal key={c.nombre} delay={(i % 2) * 90}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{c.nombre}</h3>
                  <p className="mt-1 font-mono text-xs text-tea/50">Coordina {c.coordinador}</p>
                </div>
                <Chip tone={c.permanente ? 'caribbean' : 'terracotta'}>{c.permanente ? 'Permanente' : 'Temporal'}</Chip>
              </div>
              <div className="mt-4 flex gap-6">
                <div><span className="font-display text-2xl font-semibold text-cream">{c.miembros}</span><p className="font-mono text-xs text-tea/45">miembros</p></div>
                <div><span className="font-display text-2xl font-semibold text-cream">{c.equipos}</span><p className="font-mono text-xs text-tea/45">equipos</p></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 border-t border-tea/8 pt-4 text-xs font-semibold uppercase tracking-wide">
                <button className="text-caribbean/80 hover:text-caribbean">Ver solicitantes</button>
                <button className="text-caribbean/80 hover:text-caribbean">Ver contenido</button>
                <button className="text-caribbean/80 hover:text-caribbean">Crear equipo</button>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
      <DemoNote />
    </>
  )
}
