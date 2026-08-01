import { useState } from 'react'
import { PageHeader, Card, Chip, Btn, Reveal, inputCls, labelCls } from '../ui'
import { transparencyApi } from '../../api/transparency'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const estadoTono = { Published: 'caribbean', Hidden: 'gris' }
const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })
const BLANK = { title: '', category: '', body: '' }

export default function AdminTransparencia() {
  const { hasPermission } = useSession()
  const puedeGestionar = hasPermission('transparencia.gestionar')

  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data, loading, error } = useFetch(() => transparencyApi.list(puedeGestionar), [version, puedeGestionar])

  const [abierto, setAbierto] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const nuevo = () => { setEditId(null); setForm(BLANK); setMsg(null); setAbierto(true) }
  const cerrar = () => { setAbierto(false); setEditId(null); setForm(BLANK) }

  async function editar(id) {
    setMsg(null)
    try {
      const a = await transparencyApi.get(id)
      setForm({ title: a.title ?? '', category: a.category ?? '', body: a.body ?? '' })
      setEditId(id); setAbierto(true)
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo abrir el artículo.' }) }
  }

  async function guardar() {
    if (!form.title.trim() || !form.category.trim() || !form.body.trim()) { setMsg({ ok: false, text: 'Título, categoría y cuerpo son obligatorios.' }); return }
    setSaving(true); setMsg(null)
    const body = { title: form.title.trim(), category: form.category.trim(), body: form.body }
    try {
      if (editId) await transparencyApi.update(editId, body)
      else await transparencyApi.create(body)
      setMsg({ ok: true, text: editId ? 'Artículo actualizado.' : 'Artículo publicado. Se notificó a los miembros.' })
      cerrar(); reload()
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo guardar.' }) }
    finally { setSaving(false) }
  }

  async function cambiarEstado(id, action) {
    if (action === 'Delete' && !(await confirm({ message: '¿Eliminar este artículo oficial?', danger: true, confirmLabel: 'Eliminar' }))) return
    try { await transparencyApi.changeStatus(id, action); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo cambiar el estado.' }) }
  }

  const articulos = data ?? []

  return (
    <>
      <PageHeader
        eyebrow="Administración · Junta"
        title="Transparencia"
        description="Artículos oficiales de la Junta. Al publicarse, se notifica a cada integrante en su panel."
        actions={puedeGestionar && <Btn tone="candy" onClick={() => (abierto ? cerrar() : nuevo())}>{abierto ? 'Cerrar' : '+ Nuevo artículo'}</Btn>}
      />


      {abierto && puedeGestionar && (
        <Reveal className="mb-6">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{editId ? 'Editar artículo' : 'Nuevo artículo oficial'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>Título</label>
                <input className={`${inputCls} mt-1.5`} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Título del artículo" />
              </div>
              <div>
                <label className={labelCls}>Categoría</label>
                <input className={`${inputCls} mt-1.5`} value={form.category} onChange={(e) => set({ category: e.target.value })} placeholder="Informe, Aviso, Normativa…" />
              </div>
              <div>
                <label className={labelCls}>Cuerpo</label>
                <textarea rows={6} className={`${inputCls} mt-1.5 resize-none`} value={form.body} onChange={(e) => set({ body: e.target.value })} placeholder="Contenido del artículo…" />
              </div>
            </div>
            <div className="mt-4 flex justify-end"><Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Publicar y notificar'}</Btn></div>
          </Card>
        </Reveal>
      )}

      {loading && <p className="text-tea/50">Cargando artículos…</p>}
      {error && <p className="text-candy">No se pudieron cargar los artículos.</p>}
      {!loading && !error && articulos.length === 0 && <Card><p className="text-sm text-tea/55">Aún no hay artículos oficiales.</p></Card>}

      <div className="space-y-4">
        {articulos.map((a, i) => (
          <Reveal key={a.id} delay={(i % 3) * 80}>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="caribbean">{a.category}</Chip>
                  <Chip tone={estadoTono[a.status] ?? 'gris'}>{a.status === 'Published' ? 'Publicado' : 'Oculto'}</Chip>
                  <span className="font-mono text-xs text-tea/40">{fmtFecha(a.createdAt)} · {a.authorName}</span>
                </div>
                {puedeGestionar && (
                  <div className="flex gap-3 text-xs font-semibold uppercase tracking-wide">
                    <button onClick={() => editar(a.id)} className="text-caribbean/80 hover:text-caribbean">Editar</button>
                    {a.status === 'Published'
                      ? <button onClick={() => cambiarEstado(a.id, 'Hide')} className="text-caribbean/80 hover:text-caribbean">Ocultar</button>
                      : <button onClick={() => cambiarEstado(a.id, 'Show')} className="text-caribbean/80 hover:text-caribbean">Mostrar</button>}
                    <button onClick={() => cambiarEstado(a.id, 'Delete')} className="text-candy hover:underline">Eliminar</button>
                  </div>
                )}
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-cream">{a.title}</h3>
            </Card>
          </Reveal>
        ))}
      </div>
    </>
  )
}
