import { useState } from 'react'
import { Btn, Avatar, inputCls, labelCls } from './ui'
import { tasksApi, COLUMNAS_KANBAN, COLUMNAS_RESPONSABLE } from '../api/tasks'
import { useFetch } from '../hooks/useFetch'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import { siguientePaso, TEXTO_PASO, ESTADO } from './tareas'
import Ico from './Ico'

/**
 * Tareas de un grupo (§7.4, RF-KAN-01…03).
 *
 * Antes eran cuatro columnas de kanban que en el celular quedaban una debajo de
 * otra, con un desplegable «Mover a…» en cada tarjeta. Ahora es una lista por
 * estado con un filtro arriba (activas, mías, hechas) y, en cada tarea, un botón
 * con su siguiente paso. Cambiar a un estado cualquiera sigue disponible para
 * quien coordina o lidera, plegado bajo «Cambiar estado».
 *
 * La autorización real vive en la API; aquí solo se pinta lo que corresponde al
 * rol CONTEXTUAL del usuario dentro de este grupo, no a sus permisos globales.
 */
const SECCIONES = ['InProgress', 'Pending', 'InReview']

export default function KanbanBoard({ groupId, members = [], currentUserId }) {
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const toast = useToast()
  const confirm = useConfirm()

  const miRol = members.find((m) => m.userId === currentUserId)?.role
  const esIntegrante = Boolean(miRol)
  const esGestor = miRol === 'Coordinator' || miRol === 'Leader'

  const { data: tareas, loading, error } = useFetch(
    () => (esIntegrante ? tasksApi.board(groupId) : Promise.resolve([])),
    [groupId, version, esIntegrante],
  )

  const [filtro, setFiltro] = useState('activas')
  const [creando, setCreando] = useState(false)
  // Id de la tarea que se edita con el mismo formulario de «Nueva» (null = crear).
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', assigneeIds: [] })
  const [busy, setBusy] = useState(null)
  const [enlaceEn, setEnlaceEn] = useState(null)
  const [abiertaId, setAbiertaId] = useState(null)
  const [enlace, setEnlace] = useState({ title: '', url: '' })

  // El tablero es contextual: quien no pertenece al grupo recibiría 403 de la API.
  if (!esIntegrante) {
    return (
      <p className="rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">
        Las tareas solo las ven quienes forman parte del grupo.
      </p>
    )
  }

  function toggleAssignee(userId) {
    setForm((f) => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(userId) ? f.assigneeIds.filter((id) => id !== userId) : [...f.assigneeIds, userId],
    }))
  }

  function cerrarFormulario() {
    setForm({ title: '', description: '', assigneeIds: [] })
    setCreando(false)
    setEditandoId(null)
  }

  function editar(t) {
    setForm({ title: t.title, description: t.description ?? '', assigneeIds: (t.assignees ?? []).map((a) => a.userId) })
    setEditandoId(t.id)
    setCreando(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function guardarTarea() {
    if (!form.title.trim()) { toast.error('Ponle un título a la tarea.'); return }
    setBusy('nueva')
    const datos = { title: form.title.trim(), description: form.description.trim() || null, assigneeIds: form.assigneeIds }
    try {
      if (editandoId) await tasksApi.update(editandoId, datos)
      else await tasksApi.create(groupId, datos)
      toast.success(editandoId ? 'Tarea actualizada.' : 'Tarea creada.')
      cerrarFormulario()
      reload()
    } catch (e) {
      toast.error(e.message || 'No se pudo guardar la tarea.')
    } finally { setBusy(null) }
  }

  async function borrar(t) {
    const ok = await confirm({
      title: '¿Borrar la tarea?',
      message: `«${t.title}» desaparece del tablero con sus enlaces. No se puede deshacer.`,
      danger: true,
      confirmLabel: 'Borrar',
    })
    if (!ok) return
    setBusy(t.id)
    try {
      await tasksApi.remove(t.id)
      toast.success('Tarea borrada.')
      setAbiertaId(null)
      reload()
    } catch (e) {
      toast.error(e.message || 'No se pudo borrar la tarea.')
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
    if (!enlace.title.trim() || !enlace.url.trim()) { toast.error('El enlace necesita título y dirección.'); return }
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

  /** Estados a los que esta persona puede llevar una tarea concreta. */
  function destinos(tarea) {
    const esResponsable = (tarea.assignees ?? []).some((a) => a.userId === currentUserId)
    if (esGestor) return COLUMNAS_KANBAN.filter((c) => c.id !== tarea.status)
    if (esResponsable) return COLUMNAS_KANBAN.filter((c) => COLUMNAS_RESPONSABLE.includes(c.id) && c.id !== tarea.status)
    return []
  }

  const lista = tareas ?? []
  const esMia = (t) => (t.assignees ?? []).some((a) => a.userId === currentUserId)
  const activas = lista.filter((t) => t.status !== 'Done')
  const conteo = { activas: activas.length, mias: activas.filter(esMia).length, hechas: lista.length - activas.length }
  const visibles = filtro === 'hechas' ? lista.filter((t) => t.status === 'Done') : filtro === 'mias' ? activas.filter(esMia) : activas
  const fotos = new Map(members.map((m) => [m.userId, m.photoUrl]))

  // Función de render, no componente: un componente definido aquí dentro se
  // remontaría en cada render y el campo del enlace perdería el foco al teclear.
  const tarea = (t) => {
    const paso = siguientePaso(t, { esGestor, userId: currentUserId })
    const otros = destinos(t).filter((c) => c.id !== paso)
    const puedeEnlazar = esGestor || esMia(t)
    const abierta = abiertaId === t.id
    const tieneMas = Boolean(t.description) || (t.links ?? []).length > 0 || esGestor || puedeEnlazar
    return (
      <li key={t.id} className="rounded-2xl border border-tea/10 bg-jungle">
        {/* Cerrada, una tarea dice qué es, de quién y su siguiente paso. Los
            detalles (descripción, enlaces, cambiar estado) se abren al tocarla:
            así caben varias en la pantalla del celular. */}
        <div className="flex items-start gap-3 p-3.5 sm:p-4">
          <div className="min-w-0 flex-1">
            {tieneMas ? (
              <button type="button" onClick={() => setAbiertaId(abierta ? null : t.id)} aria-expanded={abierta}
                className="flex w-full items-start gap-1.5 text-left">
                <span className={`font-medium leading-snug ${t.status === 'Done' ? 'text-tea/70 line-through decoration-tea/40' : 'text-cream'}`}>{t.title}</span>
                <Ico name="abajo" className={`mt-0.5 h-4 w-4 flex-none text-tea/70 transition-transform ${abierta ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <p className={`font-medium leading-snug ${t.status === 'Done' ? 'text-tea/70 line-through decoration-tea/40' : 'text-cream'}`}>{t.title}</p>
            )}
            {(t.assignees ?? []).length > 0 && (
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-tea/80">
                {t.assignees.map((a) => (
                  <span key={a.userId} className="inline-flex items-center gap-1.5">
                    <Avatar id={a.userId} nombre={a.name} foto={fotos.get(a.userId)} size="xs" />
                    {a.userId === currentUserId ? 'Tú' : a.name.split(' ')[0]}
                  </span>
                ))}
              </p>
            )}
          </div>
          {paso && (
            <button
              type="button"
              onClick={() => mover(t, paso)}
              disabled={busy === t.id}
              className="min-h-11 flex-none rounded-full bg-caribbean px-4 text-sm font-semibold text-jungle transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {busy === t.id ? '…' : TEXTO_PASO[paso]}
            </button>
          )}
        </div>

        {abierta && (
          <div className="border-t border-tea/10 px-3.5 pb-3.5 pt-3 sm:px-4">
            {t.description && <p className="text-sm leading-relaxed text-tea/85">{t.description}</p>}
            {(t.links ?? []).length > 0 && (
              <ul className="mt-1">
                {t.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-caribbean hover:underline">
                      <Ico name="enlace" className="h-4 w-4" />{l.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {(esGestor || puedeEnlazar) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {esGestor && otros.length > 0 && (
                  <label className="relative">
                    <span className="sr-only">Cambiar estado de «{t.title}»</span>
                    <select
                      className="min-h-11 cursor-pointer appearance-none rounded-full border border-tea/15 bg-transparent pl-4 pr-9 text-sm text-tea/85 hover:border-caribbean/50"
                      value=""
                      disabled={busy === t.id}
                      onChange={(e) => mover(t, e.target.value)}
                    >
                      <option value="">Cambiar estado</option>
                      {otros.map((c) => <option key={c.id} value={c.id}>{ESTADO[c.id].label}</option>)}
                    </select>
                    <Ico name="abajo" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tea/70" />
                  </label>
                )}
                {puedeEnlazar && enlaceEn !== t.id && (
                  <button type="button" onClick={() => { setEnlaceEn(t.id); setEnlace({ title: '', url: '' }) }}
                    className="inline-flex min-h-11 items-center gap-1 px-2 text-sm font-semibold text-caribbean hover:underline">
                    <Ico name="mas" className="h-4 w-4" /> Añadir enlace
                  </button>
                )}
                {esGestor && (
                  <>
                    <button type="button" onClick={() => editar(t)}
                      className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-tea/80 hover:text-caribbean hover:underline">
                      Editar
                    </button>
                    <button type="button" onClick={() => borrar(t)} disabled={busy === t.id}
                      className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-candy hover:underline disabled:opacity-50">
                      Borrar
                    </button>
                  </>
                )}
              </div>
            )}
            {enlaceEn === t.id && (
              <div className="mt-3 space-y-2">
                <input className={inputCls} placeholder="Título del enlace" value={enlace.title} onChange={(e) => setEnlace((f) => ({ ...f, title: e.target.value }))} />
                <input className={inputCls} type="url" placeholder="https://…" value={enlace.url} onChange={(e) => setEnlace((f) => ({ ...f, url: e.target.value }))} />
                <div className="flex gap-2">
                  <Btn onClick={() => agregarEnlace(t.id)} disabled={busy === t.id}>Guardar</Btn>
                  <Btn tone="ghost" onClick={() => { setEnlaceEn(null); setEnlace({ title: '', url: '' }) }}>Cancelar</Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </li>
    )
  }

  const filtros = [
    { id: 'activas', label: 'Activas' },
    { id: 'mias', label: 'Mías' },
    { id: 'hechas', label: 'Hechas' },
  ]

  return (
    <div>
      {/* Filtro y «Nueva» comparten fila: en el celular la primera tarea tiene
          que quedar a la vista sin bajar. */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 rounded-full border border-tea/15 bg-tea/5 p-1" role="group" aria-label="Qué tareas ver">
          {filtros.map((f) => (
            <button key={f.id} type="button" onClick={() => setFiltro(f.id)} aria-pressed={filtro === f.id}
              className={`min-h-10 whitespace-nowrap rounded-full px-2.5 text-sm font-semibold transition-colors sm:px-4 ${filtro === f.id ? 'bg-jungle text-cream shadow-sm' : 'text-tea/70 hover:text-tea'}`}>
              {f.label} <span className="font-mono text-xs opacity-80">{conteo[f.id]}</span>
            </button>
          ))}
        </div>
        {esGestor && !creando && (
          <button type="button" onClick={() => { cerrarFormulario(); setCreando(true) }} aria-label="Nueva tarea"
            className="inline-flex min-h-11 flex-none items-center gap-1.5 rounded-full bg-caribbean px-4 font-display text-sm font-semibold uppercase tracking-[0.12em] text-jungle transition hover:-translate-y-0.5">
            <Ico name="mas" className="h-4 w-4" /><span>Nueva</span>
          </button>
        )}
      </div>

      {esGestor && creando && (
        <div className="mb-6 rounded-2xl border border-tea/10 bg-jungle p-5">
          {editandoId && <p className="mb-3 text-sm font-semibold text-caribbean">Editando tarea</p>}
          <label className={labelCls} htmlFor="t-titulo">Título</label>
          <input id="t-titulo" className={`${inputCls} mt-1.5`} value={form.title} placeholder="¿Qué hay que hacer?" onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />

          <label className={`${labelCls} mt-4 block`} htmlFor="t-desc">Detalles <span className="font-normal normal-case tracking-normal text-tea/70">(opcional)</span></label>
          <textarea id="t-desc" className={`${inputCls} mt-1.5`} rows={3} value={form.description} placeholder="Contexto, qué cuenta como terminado…" onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

          <p className={`${labelCls} mt-4`}>¿Quién se encarga?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {members.map((m) => {
              const activo = form.assigneeIds.includes(m.userId)
              return (
                <button key={m.userId} type="button" onClick={() => toggleAssignee(m.userId)} aria-pressed={activo}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-sm transition ${activo ? 'bg-caribbean font-semibold text-jungle' : 'bg-tea/5 text-tea/85 hover:bg-tea/10'}`}>
                  <Avatar id={m.userId} nombre={m.name} foto={m.photoUrl} size="xs" />
                  {m.name.split(' ')[0]}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex gap-2">
            <Btn onClick={guardarTarea} disabled={busy === 'nueva'}>
              {busy === 'nueva' ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear tarea'}
            </Btn>
            <Btn tone="ghost" onClick={cerrarFormulario}>Cancelar</Btn>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-tea/70">Cargando tareas…</p>
      ) : error ? (
        <div className="rounded-2xl border border-candy/30 bg-jungle p-5">
          <p className="text-tea">No se pudieron cargar las tareas.</p>
          <button type="button" onClick={reload} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">Reintentar</button>
        </div>
      ) : visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">
          {filtro === 'hechas' ? 'Todavía no se ha terminado ninguna tarea.' : filtro === 'mias' ? 'No tienes tareas pendientes en este grupo.' : esGestor ? 'No hay tareas activas. Crea la primera con «Nueva tarea».' : 'No hay tareas activas en este grupo.'}
        </p>
      ) : filtro === 'hechas' ? (
        <ul className="space-y-2.5">{visibles.map(tarea)}</ul>
      ) : (
        <div className="space-y-5">
          {SECCIONES.map((estado) => {
            const enEstado = visibles.filter((t) => t.status === estado)
            if (enEstado.length === 0) return null
            return (
              <section key={estado}>
                <h3 className="mb-2 text-sm font-semibold text-tea/80">{ESTADO[estado].label} · {enEstado.length}</h3>
                <ul className="space-y-2.5">{enEstado.map(tarea)}</ul>
              </section>
            )
          })}
        </div>
      )}

      {!esGestor && (
        <p className="mt-5 text-sm text-tea/70">
          Las tareas las crea quien coordina o lidera el grupo. Cuando una es tuya, la entregas para revisión y luego la das por hecha.
        </p>
      )}
    </div>
  )
}
