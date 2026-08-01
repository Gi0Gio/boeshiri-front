import { useState } from 'react'
import { Card, Chip, Btn, inputCls, labelCls } from './ui'
import { tasksApi, COLUMNAS_KANBAN, COLUMNAS_RESPONSABLE } from '../api/tasks'
import { useFetch } from '../hooks/useFetch'
import { useToast } from '../components/Toast'

/**
 * Tablero Kanban de un grupo (§7.4, RF-KAN-01…03).
 *
 * La autorización real vive en la API; aquí solo se pinta lo que corresponde al
 * rol CONTEXTUAL del usuario dentro de este grupo (no a sus permisos globales):
 * el líder/coordinador crea tareas y las mueve a cualquier columna; el responsable
 * mueve la suya a En revisión/Completado y añade enlaces; el resto solo mira.
 */
export default function KanbanBoard({ groupId, members = [], currentUserId }) {
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const toast = useToast()

  const miRol = members.find((m) => m.userId === currentUserId)?.role
  const esIntegrante = Boolean(miRol)
  const esGestor = miRol === 'Coordinator' || miRol === 'Leader'

  const { data: tareas, loading, error } = useFetch(
    () => (esIntegrante ? tasksApi.board(groupId) : Promise.resolve([])),
    [groupId, version, esIntegrante],
  )

  const [creando, setCreando] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', assigneeIds: [] })
  const [busy, setBusy] = useState(null)
  const [enlaceEn, setEnlaceEn] = useState(null)
  const [enlace, setEnlace] = useState({ title: '', url: '' })

  // El tablero es contextual: quien no pertenece al grupo recibiría 403 de la API.
  if (!esIntegrante) {
    return (
      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Tablero de tareas</h2>
        <p className="mt-2 text-sm text-tea/50">El tablero solo es visible para los integrantes del grupo.</p>
      </Card>
    )
  }

  function toggleAssignee(userId) {
    setForm((f) => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(userId)
        ? f.assigneeIds.filter((id) => id !== userId)
        : [...f.assigneeIds, userId],
    }))
  }

  async function crearTarea() {
    if (!form.title.trim()) { toast.error('El título de la tarea es obligatorio.'); return }
    setBusy('nueva')
    try {
      await tasksApi.create(groupId, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        assigneeIds: form.assigneeIds,
      })
      toast.success('Tarea creada.')
      setForm({ title: '', description: '', assigneeIds: [] })
      setCreando(false)
      reload()
    } catch (e) {
      toast.error(e.message || 'No se pudo crear la tarea.')
    } finally { setBusy(null) }
  }

  async function mover(tarea, status) {
    if (!status || status === tarea.status) return
    setBusy(tarea.id)
    try {
      await tasksApi.move(tarea.id, status)
      reload()
    } catch (e) {
      toast.error(e.message || 'No se pudo mover la tarea.')
    } finally { setBusy(null) }
  }

  async function agregarEnlace(tareaId) {
    if (!enlace.title.trim() || !enlace.url.trim()) { toast.error('Título y URL del enlace son obligatorios.'); return }
    setBusy(tareaId)
    try {
      await tasksApi.addLink(tareaId, { title: enlace.title.trim(), url: enlace.url.trim() })
      toast.success('Enlace añadido.')
      setEnlace({ title: '', url: '' })
      setEnlaceEn(null)
      reload()
    } catch (e) {
      toast.error(e.message || 'No se pudo añadir el enlace.')
    } finally { setBusy(null) }
  }

  /** Columnas a las que este usuario puede mover una tarea concreta. */
  function destinos(tarea) {
    const esResponsable = (tarea.assignees ?? []).some((a) => a.userId === currentUserId)
    if (esGestor) return COLUMNAS_KANBAN.filter((c) => c.id !== tarea.status)
    if (esResponsable) return COLUMNAS_KANBAN.filter((c) => COLUMNAS_RESPONSABLE.includes(c.id) && c.id !== tarea.status)
    return []
  }

  const lista = tareas ?? []

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">
          Tablero de tareas ({lista.length})
        </h2>
        {esGestor && (
          <Btn tone={creando ? 'ghost' : 'primary'} onClick={() => setCreando((v) => !v)}>
            {creando ? 'Cancelar' : '+ Nueva tarea'}
          </Btn>
        )}
      </div>

      {esGestor && creando && (
        <Card className="mb-4">
          <label className={labelCls}>Título</label>
          <input className={`${inputCls} mt-1.5`} value={form.title} placeholder="¿Qué hay que hacer?" onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />

          <label className={`${labelCls} mt-4 block`}>Descripción</label>
          <textarea className={`${inputCls} mt-1.5`} rows={3} value={form.description} placeholder="Detalles, contexto, criterios de terminado…" onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

          <label className={`${labelCls} mt-4 block`}>Responsables</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {members.map((m) => {
              const activo = form.assigneeIds.includes(m.userId)
              return (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => toggleAssignee(m.userId)}
                  className={`rounded-full px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${activo ? 'bg-caribbean text-jungle' : 'bg-tea/10 text-tea/55 hover:bg-tea/20 hover:text-tea'}`}
                >
                  {m.name}
                </button>
              )
            })}
          </div>

          <Btn className="mt-4" onClick={crearTarea} disabled={busy === 'nueva'}>
            {busy === 'nueva' ? 'Creando…' : 'Crear tarea'}
          </Btn>
        </Card>
      )}

      {loading && <p className="text-tea/50">Cargando tablero…</p>}
      {error && <p className="text-candy">No se pudo cargar el tablero.</p>}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNAS_KANBAN.map((col) => {
            const enColumna = lista.filter((t) => t.status === col.id)
            return (
              <div key={col.id} className="rounded-2xl border border-tea/10 bg-jungle p-4">
                <div className="flex items-center justify-between">
                  <Chip tone={col.tone}>{col.label}</Chip>
                  <span className="font-mono text-xs text-tea/40">{enColumna.length}</span>
                </div>

                <div className="mt-3 space-y-3">
                  {enColumna.length === 0 && <p className="py-2 text-xs text-tea/30">Sin tareas.</p>}

                  {enColumna.map((t) => {
                    const puedeMover = destinos(t).length > 0
                    const esResponsable = (t.assignees ?? []).some((a) => a.userId === currentUserId)
                    return (
                      <div key={t.id} className="rounded-xl border border-tea/10 bg-jungle-deep/50 p-3">
                        <p className="text-sm font-medium leading-snug text-tea">{t.title}</p>
                        {t.description && <p className="mt-1 text-xs leading-relaxed text-tea/50">{t.description}</p>}

                        {(t.assignees ?? []).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {t.assignees.map((a) => <Chip key={a.userId} tone="tea">{a.name}</Chip>)}
                          </div>
                        )}

                        {(t.links ?? []).length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {t.links.map((l) => (
                              <li key={l.url}>
                                <a href={l.url} target="_blank" rel="noreferrer" className="font-mono text-xs text-caribbean/80 hover:text-caribbean">↗ {l.title}</a>
                              </li>
                            ))}
                          </ul>
                        )}

                        {puedeMover && (
                          <select
                            className={`${inputCls} mt-3 py-1.5 text-xs`}
                            value=""
                            disabled={busy === t.id}
                            onChange={(e) => mover(t, e.target.value)}
                          >
                            <option value="">{busy === t.id ? 'Moviendo…' : 'Mover a…'}</option>
                            {destinos(t).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                        )}

                        {(esGestor || esResponsable) && (
                          enlaceEn === t.id ? (
                            <div className="mt-2 space-y-2">
                              <input className={`${inputCls} py-1.5 text-xs`} placeholder="Título del enlace" value={enlace.title} onChange={(e) => setEnlace((f) => ({ ...f, title: e.target.value }))} />
                              <input className={`${inputCls} py-1.5 text-xs`} placeholder="https://…" value={enlace.url} onChange={(e) => setEnlace((f) => ({ ...f, url: e.target.value }))} />
                              <div className="flex gap-2">
                                <Btn className="px-3 py-1.5" onClick={() => agregarEnlace(t.id)} disabled={busy === t.id}>Guardar</Btn>
                                <Btn tone="ghost" className="px-3 py-1.5" onClick={() => { setEnlaceEn(null); setEnlace({ title: '', url: '' }) }}>Cancelar</Btn>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setEnlaceEn(t.id); setEnlace({ title: '', url: '' }) }}
                              className="mt-2 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-caribbean/70 hover:text-caribbean"
                            >
                              + Enlace
                            </button>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!esGestor && (
        <p className="mt-4 font-mono text-xs text-tea/40">
          Solo el líder o coordinador del grupo crea tareas. Como responsable puedes mover las tuyas a En revisión o Completado.
        </p>
      )}
    </div>
  )
}
