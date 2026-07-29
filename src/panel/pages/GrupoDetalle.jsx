import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, Chip, Btn, DemoNote } from '../ui'
import { misGrupos, kanbanColumnas, kanbanTareas } from '../../data/panel'

const colAcento = { Pendiente: '#9fb3ad', 'En proceso': '#00e6bc', 'En revisión': '#d67a63', Completado: '#00735e' }

export default function GrupoDetalle() {
  const { id } = useParams()
  const grupo = misGrupos.find((g) => g.id === id) || { nombre: 'Equipo', tipo: 'Equipo', rol: 'Integrante' }
  const [tareas, setTareas] = useState(kanbanTareas)
  const [sel, setSel] = useState(null)
  const mover = (tid, estado) => setTareas((ts) => ts.map((t) => (t.id === tid ? { ...t, estado } : t)))
  const seleccionada = tareas.find((t) => t.id === sel)

  return (
    <>
      <Link to="/panel/grupos" className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-caribbean">← Mis grupos</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-cream">{grupo.nombre}</h1>
        <Chip tone={grupo.tipo === 'Comisión' ? 'caribbean' : 'terracotta'}>{grupo.tipo}</Chip>
        <Chip tone="gris">Tu rol: {grupo.rol}</Chip>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[{ k: 'Integrantes', v: '5' }, { k: 'Biblioteca de enlaces', v: '7', s: 'enlaces con título' }, { k: 'Documentos', v: '3', s: 'archivos del grupo' }].map((x) => (
          <Card key={x.k}>
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-caribbean">{x.k}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-cream">{x.v}</p>
            {x.s && <p className="font-mono text-xs text-tea/40">{x.s}</p>}
          </Card>
        ))}
        <Card>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-caribbean">Instructivo</p>
          <p className="mt-2 text-sm text-tea/70">instructivo-evento.pdf</p>
          <button className="mt-1 font-mono text-xs font-semibold uppercase tracking-wide text-caribbean">Descargar</button>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-cream">Tablero</h2>
        {grupo.rol === 'Líder' && <Btn>+ Nueva tarea</Btn>}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {kanbanColumnas.map((col) => {
          const items = tareas.filter((t) => t.estado === col)
          return (
            <div key={col} className="rounded-2xl border border-tea/10 bg-black/15 p-3" style={{ borderTop: `3px solid ${colAcento[col]}` }}>
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-tea/70">{col}</span>
                <span className="rounded-full bg-tea/10 px-2 font-mono text-xs text-tea/60">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <button key={t.id} onClick={() => setSel(t.id)} className="w-full rounded-xl border border-tea/10 bg-jungle p-3 text-left transition hover:-translate-y-0.5 hover:border-caribbean/40">
                    <p className="text-sm font-medium leading-snug text-tea">{t.titulo}</p>
                    <div className="mt-2 flex items-center justify-between font-mono text-[0.7rem] text-tea/45">
                      <span>{t.responsables.join(', ')}</span>{t.enlaces > 0 && <span>🔗 {t.enlaces}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-tea/45">Solo el <strong className="text-tea/70">líder</strong> mueve tareas y edita el tablero. El responsable actualiza descripción, enlaces y marca como lista.</p>

      {seleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-jungle-deep/70 backdrop-blur-sm" onClick={() => setSel(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-tea/10 bg-jungle p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <Chip tone="tea">{seleccionada.estado}</Chip>
              <button onClick={() => setSel(null)} className="text-2xl leading-none text-tea/40 hover:text-tea">×</button>
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold uppercase tracking-wide text-cream">{seleccionada.titulo}</h3>
            <p className="mt-3 text-sm leading-relaxed text-tea/60">Descripción de la tarea con los detalles que el responsable necesita para ejecutarla.</p>
            <div className="mt-4 space-y-2 text-sm text-tea/70">
              <p><span className="text-tea/45">Responsables:</span> {seleccionada.responsables.join(', ')}</p>
              <p><span className="text-tea/45">Enlaces:</span> {seleccionada.enlaces} adjuntos</p>
            </div>
            <div className="mt-5">
              <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-caribbean">Mover a (líder)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {kanbanColumnas.map((col) => (
                  <button key={col} onClick={() => mover(seleccionada.id, col)} className={`rounded-full px-3 py-1 font-mono text-xs font-semibold transition ${seleccionada.estado === col ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/60 hover:bg-tea/15'}`}>{col}</button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Btn tone="ghost" onClick={() => setSel(null)}>Cerrar</Btn>
              <Btn onClick={() => { mover(seleccionada.id, 'Completado'); setSel(null) }}>Marcar como lista</Btn>
            </div>
          </div>
        </div>
      )}
      <DemoNote />
    </>
  )
}
