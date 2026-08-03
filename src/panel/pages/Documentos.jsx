import { useState, useRef } from 'react'
import { PageHeader, Card, Chip, Btn, Reveal, PillTabs, Table, Th, Td, Tr, inputCls, labelCls } from '../ui'
import { documentsApi } from '../../api/documents'
import { uploadFile } from '../../api/uploads'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const accesoTono = { Members: 'caribbean', Administration: 'terracotta' }
const accesoLabel = { Members: 'Miembros', Administration: 'Administración' }

const fmtSize = (b) => {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

export default function Documentos() {
  const { hasPermission } = useSession()
  const verAdmin = hasPermission('documentos.ver_admin')
  const subirComunidad = hasPermission('documentos.subir_comunidad')

  const [tab, setTab] = useState('Community')
  const [version, setVersion] = useState(0)
  const { data, loading, error } = useFetch(() => documentsApi.list(tab), [tab, version])
  const reload = () => setVersion((v) => v + 1)

  const puedeSubir = tab === 'Community' ? subirComunidad : verAdmin
  const tabs = [{ id: 'Community', label: 'Comunidad' }, ...(verAdmin ? [{ id: 'Administration', label: 'Administración' }] : [])]

  const [busqueda, setBusqueda] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [bajando, setBajando] = useState(null)

  const [abierto, setAbierto] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', accessLevel: 'Members' })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }
  const replaceRef = useRef(null)
  const [replacing, setReplacing] = useState(null)

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const cerrar = () => { setAbierto(false); setForm({ name: '', category: '', accessLevel: 'Members' }); setFile(null) }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    if (!form.name) set({ name: f.name.replace(/\.[^.]+$/, '') })
  }

  async function descargar(d) {
    setBajando(d.id)
    try {
      await documentsApi.download(d.id, d.fileName || d.name)
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo descargar.' })
    } finally { setBajando(null) }
  }

  async function subir() {
    if (!file) { setMsg({ ok: false, text: 'Elige un archivo.' }); return }
    if (!form.name.trim() || !form.category.trim()) { setMsg({ ok: false, text: 'Nombre y categoría son obligatorios.' }); return }
    setSaving(true); setMsg(null)
    try {
      const url = await uploadFile(file, 'documentos')
      await documentsApi.create({
        name: form.name.trim(),
        category: form.category.trim(),
        library: tab,
        accessLevel: tab === 'Administration' ? form.accessLevel : 'Members',
        fileUrl: url,
        fileName: file.name,
        contentType: file.type || null,
        sizeBytes: file.size,
      })
      setMsg({ ok: true, text: 'Documento subido.' })
      cerrar()
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo subir el documento.' })
    } finally {
      setSaving(false)
    }
  }

  async function onReplaceFile(e) {
    const f = e.target.files?.[0]
    const doc = replacing
    e.target.value = ''
    if (!f || !doc) return
    setMsg(null)
    try {
      const url = await uploadFile(f, 'documentos')
      await documentsApi.replace(doc.id, {
        name: doc.name, category: doc.category,
        fileUrl: url, fileName: f.name, contentType: f.type || null, sizeBytes: f.size,
      })
      setMsg({ ok: true, text: 'Archivo reemplazado.' })
      reload()
    } catch (err) {
      setMsg({ ok: false, text: err.message || 'No se pudo reemplazar.' })
    } finally {
      setReplacing(null)
    }
  }

  async function eliminar(id) {
    if (!(await confirm({ message: '¿Eliminar este documento?', danger: true, confirmLabel: 'Eliminar' }))) return
    try { await documentsApi.remove(id); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo eliminar.' }) }
  }

  const noAutorizado = error?.status === 401 || error?.status === 403
  const todos = data ?? []

  // Las categorías las escribe quien sube, así que salen de los propios datos.
  const categorias = [...new Set(todos.map((d) => d.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))

  const lista = todos.filter((d) => {
    const q = busqueda.trim().toLowerCase()
    if (q && !`${d.name} ${d.category} ${d.authorName}`.toLowerCase().includes(q)) return false
    if (filtroCat && d.category !== filtroCat) return false
    return true
  })

  return (
    <>
      <PageHeader
        eyebrow="Miembro"
        title="Documentos y biblioteca"
        description="Repositorio interno, exclusivo para miembros. Sube archivos directamente desde tu equipo."
        actions={puedeSubir && <Btn tone="candy" onClick={() => (abierto ? cerrar() : setAbierto(true))}>{abierto ? 'Cerrar' : '+ Subir documento'}</Btn>}
      />

      <PillTabs tabs={tabs} active={tab} onChange={(t) => { setTab(t); cerrar() }} />


      <p className="mb-4 rounded-xl border border-tea/10 bg-black/20 px-4 py-3 text-xs leading-relaxed text-tea/60">
        {tab === 'Community'
          ? 'Material aportado por los miembros (anteproyectos, tesis, ensayos). Subida libre, sin curaduría.'
          : 'Plantillas y cartas membretadas de la Junta. La documentación de nivel Administración queda restringida por permisos.'}
      </p>

      {abierto && (
        <Reveal className="mb-6">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Subir a {tab === 'Community' ? 'Comunidad' : 'Administración'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>Archivo</label>
                <input type="file" onChange={onFile} className="mt-1.5 block w-full text-sm text-tea/70 file:mr-4 file:rounded-full file:border-0 file:bg-caribbean file:px-4 file:py-2 file:font-mono file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-jungle hover:file:bg-caribbean/80" />
                {file && <p className="mt-1.5 font-mono text-[0.65rem] text-tea/40">{file.name} · {fmtSize(file.size)}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Nombre visible</label>
                  <input className={`${inputCls} mt-1.5`} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ej. Estatutos del colectivo" />
                </div>
                <div>
                  <label className={labelCls}>Categoría</label>
                  <input className={`${inputCls} mt-1.5`} value={form.category} onChange={(e) => set({ category: e.target.value })} placeholder="Legal, Plantillas, Tesis…" />
                </div>
              </div>
              {tab === 'Administration' && (
                <div>
                  <label className={labelCls}>Nivel de acceso</label>
                  <select className={`${inputCls} mt-1.5`} value={form.accessLevel} onChange={(e) => set({ accessLevel: e.target.value })}>
                    <option value="Members">Miembros (cualquier miembro)</option>
                    <option value="Administration">Administración (Junta / Super)</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Btn onClick={subir} disabled={saving}>{saving ? 'Subiendo…' : 'Subir documento'}</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      <input ref={replaceRef} type="file" className="hidden" onChange={onReplaceFile} />

      {/* Explorador: buscar por nombre, categoría o autor, y filtrar por categoría.
          Una biblioteca crece rápido y recorrerla entera deja de ser viable. */}
      {!loading && !error && todos.length > 0 && (
        <div className="mb-4 rounded-2xl border border-tea/10 bg-jungle p-4">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, categoría o autor…"
            className={inputCls}
            autoComplete="off"
          />
          {categorias.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[{ id: '', label: 'Todas' }, ...categorias.map((c) => ({ id: c, label: c }))].map((f) => (
                <button
                  key={f.id || 'todas'}
                  type="button"
                  onClick={() => setFiltroCat(f.id)}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${filtroCat === f.id ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/55 hover:bg-tea/15 hover:text-tea'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          <p className="mt-3 font-mono text-xs text-tea/40">{lista.length} de {todos.length} documentos</p>
        </div>
      )}

      {loading && <p className="text-tea/50">Cargando documentos…</p>}
      {error && (noAutorizado
        ? <Card><p className="text-sm text-tea/60">Tu rol no tiene acceso a esta biblioteca.</p></Card>
        : <p className="text-candy">No se pudieron cargar los documentos.</p>)}

      {!loading && !error && todos.length === 0 && (
        <Card><p className="text-sm text-tea/55">Aún no hay documentos en esta biblioteca.{puedeSubir && ' Usa «+ Subir documento».'}</p></Card>
      )}

      {!loading && !error && todos.length > 0 && lista.length === 0 && (
        <Card><p className="text-sm text-tea/55">Ningún documento coincide con la búsqueda.</p></Card>
      )}

      {!loading && !error && lista.length > 0 && (
        <Reveal>
          <Table minW="680px">
            <thead>
              <Tr className="hover:bg-transparent">
                <Th>Nombre</Th><Th className="hidden sm:table-cell">Categoría</Th><Th className="hidden md:table-cell">Autor</Th><Th className="hidden lg:table-cell">Tamaño</Th><Th>Acceso</Th><Th> </Th>
              </Tr>
            </thead>
            <tbody>
              {lista.map((d) => (
                <Tr key={d.id}>
                  <Td className="font-medium text-tea">📄 {d.name}</Td>
                  <Td className="hidden sm:table-cell text-tea/55">{d.category}</Td>
                  <Td className="hidden md:table-cell text-tea/55">{d.authorName}</Td>
                  <Td className="hidden lg:table-cell font-mono text-xs text-tea/40">{fmtSize(d.sizeBytes)}</Td>
                  <Td><Chip tone={accesoTono[d.accessLevel]}>{accesoLabel[d.accessLevel] ?? d.accessLevel}</Chip></Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                      <button onClick={() => descargar(d)} disabled={bajando === d.id} className="text-caribbean/80 hover:text-caribbean disabled:opacity-40">
                        {bajando === d.id ? '…' : 'Descargar'}
                      </button>
                      {puedeSubir && <button onClick={() => { setReplacing(d); replaceRef.current?.click() }} className="text-caribbean/80 hover:text-caribbean">Reemplazar</button>}
                      {puedeSubir && <button onClick={() => eliminar(d.id)} className="text-candy hover:underline">Eliminar</button>}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Reveal>
      )}

      <p className="mt-4 font-mono text-xs text-tea/40">v1: al reemplazar solo se conserva la última versión (sin versionado).</p>
    </>
  )
}
