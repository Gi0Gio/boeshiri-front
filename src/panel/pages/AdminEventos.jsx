import { useState } from 'react'
import { PageHeader, Card, Chip, Btn, Reveal, PillTabs, Table, Th, Td, Tr, inputCls, labelCls } from '../ui'
import { eventsApi } from '../../api/events'
import { useFetch } from '../../hooks/useFetch'
import ImageUpload from '../../components/ImageUpload'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const TABS = [{ id: 'All', label: 'Todos' }, { id: 'Upcoming', label: 'Próximos' }, { id: 'Past', label: 'Pasados' }]
const BLANK = { category: '', title: '', description: '', date: '', location: '', cost: '', visibility: 'Public', images: [] }

const fmtFecha = (iso) => new Date(iso).toLocaleString('es-PA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
// ISO → valor para <input type="datetime-local"> (local, sin zona)
const toLocalInput = (iso) => {
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

export default function AdminEventos() {
  const [tab, setTab] = useState('All')
  const [version, setVersion] = useState(0)
  const { data, loading, error } = useFetch(() => eventsApi.listManage(tab), [tab, version])
  const reload = () => setVersion((v) => v + 1)

  const [abierto, setAbierto] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }
  const [asistId, setAsistId] = useState(null)
  const [asistCount, setAsistCount] = useState('')

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const nuevo = () => { setEditId(null); setForm(BLANK); setMsg(null); setAbierto(true) }
  const cerrar = () => { setAbierto(false); setEditId(null); setForm(BLANK) }

  async function editar(id) {
    setMsg(null)
    try {
      const e = await eventsApi.getManage(id)
      setForm({ category: e.category ?? '', title: e.title ?? '', description: e.description ?? '', date: e.date ? toLocalInput(e.date) : '', location: e.location ?? '', cost: String(e.cost ?? ''), visibility: e.visibility ?? 'Public', images: e.images ?? [] })
      setEditId(id); setAbierto(true)
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo abrir el evento.' }) }
  }

  async function guardar() {
    if (!form.title.trim() || !form.category.trim() || !form.date) { setMsg({ ok: false, text: 'Categoría, título y fecha son obligatorios.' }); return }
    setSaving(true); setMsg(null)
    const base = {
      category: form.category.trim(), title: form.title.trim(), description: form.description || null,
      date: new Date(form.date).toISOString(), location: form.location || null,
      cost: Number(form.cost) || 0, visibility: form.visibility,
    }
    try {
      if (editId) await eventsApi.update(editId, base)
      else await eventsApi.create({ ...base, images: form.images.filter(Boolean) })
      setMsg({ ok: true, text: editId ? 'Evento actualizado.' : 'Evento creado.' })
      cerrar(); reload()
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo guardar.' }) }
    finally { setSaving(false) }
  }

  async function cambiarEstado(id, action) {
    if (action === 'Delete' && !(await confirm({ message: '¿Eliminar este evento? No se puede deshacer.', danger: true, confirmLabel: 'Eliminar' }))) return
    try { await eventsApi.changeStatus(id, action); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo cambiar el estado.' }) }
  }

  async function guardarAsistencia(id) {
    const count = Number(asistCount)
    if (!Number.isFinite(count) || count < 0) { setMsg({ ok: false, text: 'Ingresa un número válido.' }); return }
    try {
      await eventsApi.recordAttendance(id, count, [])
      setMsg({ ok: true, text: 'Asistencia registrada.' })
      setAsistId(null); setAsistCount(''); reload()
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo registrar la asistencia.' }) }
  }

  const eventos = data ?? []
  const esFuturo = (iso) => new Date(iso) >= new Date()

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Gestión de eventos"
        description="Crea, oculta y elimina eventos. Un evento tiene lugar, costo, imágenes, visibilidad y registro de asistencia."
        actions={<Btn tone="candy" onClick={() => (abierto ? cerrar() : nuevo())}>{abierto ? 'Cerrar' : '+ Nuevo evento'}</Btn>}
      />


      {abierto && (
        <Reveal className="mb-8">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{editId ? 'Editar evento' : 'Nuevo evento'}</h2>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                <div>
                  <label className={labelCls}>Título</label>
                  <input className={`${inputCls} mt-1.5`} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Nombre del evento" />
                </div>
                <div>
                  <label className={labelCls}>Categoría</label>
                  <input className={`${inputCls} mt-1.5`} value={form.category} onChange={(e) => set({ category: e.target.value })} placeholder="Taller, Concierto…" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Fecha y hora</label>
                  <input type="datetime-local" className={`${inputCls} mt-1.5`} value={form.date} onChange={(e) => set({ date: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Lugar</label>
                  <input className={`${inputCls} mt-1.5`} value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="David, en línea…" />
                </div>
                <div>
                  <label className={labelCls}>Costo (USD)</label>
                  <input type="number" min="0" step="0.01" className={`${inputCls} mt-1.5`} value={form.cost} onChange={(e) => set({ cost: e.target.value })} placeholder="0 = gratis" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={4} className={`${inputCls} mt-1.5 resize-none`} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="De qué trata el evento…" />
              </div>
              {!editId && form.images.map((url, i) => (
                <ImageUpload key={i} value={url} onChange={(u) => set({ images: u ? form.images.map((x, j) => (j === i ? u : x)) : form.images.filter((_, j) => j !== i) })} folder="publicaciones" label={`Imagen ${i + 1}`} />
              ))}
              {!editId && form.images.length < 4 && (
                <ImageUpload key={`new-${form.images.length}`} value="" onChange={(u) => u && set({ images: [...form.images, u] })} folder="publicaciones" label="Añadir imagen (hasta 4)" />
              )}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-tea/70">
                <input type="checkbox" checked={form.visibility === 'Public'} onChange={(e) => set({ visibility: e.target.checked ? 'Public' : 'Members' })} className="h-4 w-4 accent-[#00e6bc]" />
                Público (si lo desmarcas, solo lo ven miembros)
              </label>
              <Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear evento'}</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      <PillTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading && <p className="text-tea/50">Cargando eventos…</p>}
      {error && <p className="text-candy">No se pudieron cargar los eventos.</p>}
      {!loading && !error && eventos.length === 0 && <Card><p className="text-sm text-tea/55">No hay eventos en esta vista.</p></Card>}

      {!loading && !error && eventos.length > 0 && (
        <Reveal>
          <Table minW="720px">
            <thead>
              <Tr className="hover:bg-transparent"><Th>Evento</Th><Th className="hidden sm:table-cell">Categoría</Th><Th>Fecha</Th><Th>Estado</Th><Th className="hidden lg:table-cell">Asist.</Th><Th> </Th></Tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <Tr key={e.id}>
                  <Td className="font-medium text-tea">{e.title}</Td>
                  <Td className="hidden sm:table-cell text-tea/55">{e.category}</Td>
                  <Td className="font-mono text-xs text-tea/50">{fmtFecha(e.date)}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Chip tone={e.status === 'Published' ? 'caribbean' : 'gris'}>{e.status === 'Published' ? 'Visible' : 'Oculto'}</Chip>
                      <Chip tone={esFuturo(e.date) ? 'tea' : 'gris'}>{esFuturo(e.date) ? 'Próximo' : 'Pasado'}</Chip>
                      {e.visibility === 'Members' && <Chip tone="terracotta">Miembros</Chip>}
                    </div>
                  </Td>
                  <Td className="hidden lg:table-cell font-mono text-xs text-tea/50">
                    {asistId === e.id ? (
                      <span className="flex items-center gap-1">
                        <input type="number" min="0" value={asistCount} onChange={(ev) => setAsistCount(ev.target.value)} className="w-16 rounded border border-tea/20 bg-jungle-deep/60 px-2 py-1 text-tea" autoFocus />
                        <button onClick={() => guardarAsistencia(e.id)} className="text-caribbean hover:underline">✓</button>
                        <button onClick={() => setAsistId(null)} className="text-tea/40 hover:text-candy">✕</button>
                      </span>
                    ) : (
                      <button onClick={() => { setAsistId(e.id); setAsistCount(String(e.attendanceCount || '')) }} className="hover:text-caribbean">{e.attendanceCount || 0} ✎</button>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                      <button onClick={() => editar(e.id)} className="text-caribbean/80 hover:text-caribbean">Editar</button>
                      {e.status === 'Published'
                        ? <button onClick={() => cambiarEstado(e.id, 'Hide')} className="text-caribbean/80 hover:text-caribbean">Ocultar</button>
                        : <button onClick={() => cambiarEstado(e.id, 'Show')} className="text-caribbean/80 hover:text-caribbean">Mostrar</button>}
                      <button onClick={() => cambiarEstado(e.id, 'Delete')} className="text-candy hover:underline">Eliminar</button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Reveal>
      )}
    </>
  )
}
