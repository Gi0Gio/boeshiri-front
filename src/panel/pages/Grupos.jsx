import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Reveal, DemoNote } from '../ui'
import { misGrupos, comisiones } from '../../data/panel'

const tipoTono = { Comisión: 'caribbean', Equipo: 'terracotta' }

export default function Grupos() {
  return (
    <>
      <PageHeader eyebrow="Miembro" title="Mis grupos" description="Comisiones (permanentes) y equipos (temporales). Entra a un grupo para ver su Overview y su Kanban." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {misGrupos.map((g, i) => (
          <Reveal key={g.id} delay={(i % 3) * 90}>
            <Link to={`/panel/grupos/${g.id}`} className="block h-full rounded-2xl border border-tea/10 bg-jungle p-6 transition hover:-translate-y-1 hover:border-caribbean/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between">
                <Chip tone={tipoTono[g.tipo]}>{g.tipo}</Chip>
                <Chip tone="gris">{g.rol}</Chip>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold uppercase leading-tight tracking-wide text-cream">{g.nombre}</h3>
              <span className="mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-caribbean">Abrir tablero →</span>
            </Link>
          </Reveal>
        ))}
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold uppercase tracking-wide text-cream">Comisiones del colectivo</h2>
      <p className="mt-1 text-sm text-tea/50">Áreas permanentes de trabajo. Puedes solicitar unirte a una.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {comisiones.map((c, i) => (
          <Reveal key={c.nombre} delay={(i % 2) * 90}>
            <Card className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold uppercase tracking-wide text-cream">{c.nombre}</h3>
                <p className="mt-1 font-mono text-xs text-tea/45">{c.coordinador} · {c.miembros} miembros · {c.equipos} equipos</p>
              </div>
              <button className="flex-none rounded-full border border-tea/25 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-tea transition hover:border-caribbean hover:text-caribbean">Solicitar</button>
            </Card>
          </Reveal>
        ))}
      </div>
      <DemoNote />
    </>
  )
}
