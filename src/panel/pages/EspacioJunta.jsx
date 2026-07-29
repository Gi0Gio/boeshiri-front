import { PageHeader, Card, Chip, Btn, Reveal, DemoNote } from '../ui'

const decisiones = [
  { fecha: '18 jul 2026', txt: 'Aprobado el evento "Noche Raíz"', estado: 'Aprobada' },
  { fecha: '10 jul 2026', txt: 'Presupuesto de materiales para mural', estado: 'Aprobada' },
  { fecha: '2 jul 2026', txt: 'Apertura de convocatoria 2026', estado: 'En debate' },
]
const documentosJunta = ['Acta reunión julio 2026.pdf', 'Presupuesto anual.xlsx', 'Plan estratégico 2026-2027.pdf']
const tareas = [
  { estado: 'Pendiente', txt: 'Revisar postulaciones nuevas' },
  { estado: 'En proceso', txt: 'Redactar informe semestral' },
  { estado: 'Completado', txt: 'Definir calendario de eventos' },
]
const tareaTono = { Pendiente: 'gris', 'En proceso': 'caribbean', Completado: 'rainforest' }

export default function EspacioJunta() {
  return (
    <>
      <PageHeader eyebrow="Junta Directiva" title="Espacio de la Junta" description="Área privada: biblioteca propia, comunicaciones oficiales, seguimiento de decisiones y tablero de tareas." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Biblioteca de la Junta</h2>
              <Btn tone="ghost">+ Subir</Btn>
            </div>
            <ul className="mt-4 space-y-2">
              {documentosJunta.map((d) => (
                <li key={d} className="flex items-center justify-between rounded-lg border border-tea/10 bg-black/15 px-4 py-2.5 text-sm text-tea">
                  <span>📄 {d}</span>
                  <button className="font-mono text-xs font-semibold uppercase tracking-wide text-caribbean/80 hover:text-caribbean">Abrir</button>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={100}>
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Seguimiento de decisiones</h2>
            <ul className="mt-4 space-y-3">
              {decisiones.map((d, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-caribbean shadow-[0_0_8px_rgba(0,230,188,0.6)]" />
                  <div className="flex-1">
                    <p className="text-sm text-tea/85">{d.txt}</p>
                    <p className="font-mono text-xs text-tea/40">{d.fecha}</p>
                  </div>
                  <Chip tone={d.estado === 'Aprobada' ? 'rainforest' : 'terracotta'}>{d.estado}</Chip>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={160}>
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Comunicaciones oficiales</h2>
            <p className="mt-2 text-sm text-tea/60">Canal interno de la Junta para acuerdos y anuncios. Los artículos públicos se gestionan en <strong className="text-tea/80">Transparencia</strong>.</p>
            <Btn className="mt-4">Nueva comunicación</Btn>
          </Card>
        </Reveal>

        <Reveal delay={220}>
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Tablero de tareas</h2>
            <ul className="mt-4 space-y-2">
              {tareas.map((t, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg border border-tea/10 bg-black/15 px-4 py-2.5 text-sm text-tea">
                  <span>{t.txt}</span><Chip tone={tareaTono[t.estado]}>{t.estado}</Chip>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
      <DemoNote />
    </>
  )
}
