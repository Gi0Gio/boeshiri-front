import { useState, useRef, useEffect } from 'react'
import { PageHeader, Card, Chip, Btn, Reveal, inputCls, labelCls } from '../ui'
import InfoTooltip from '../../components/InfoTooltip'
import { documentsApi } from '../../api/documents'
import { uploadFile } from '../../api/uploads'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

/**
 * Los estantes se derivan de los dos campos que ya tiene la API —`library`
 * (quién lo produjo) y `accessLevel` (quién puede abrirlo)—, sin tocar el back.
 *
 * El orden de `pertenece` importa: se evalúa de arriba abajo y cada documento
 * cae en el primero que lo reclame. Así el reparto es total y sin solapes, y un
 * archivo restringido nunca puede colarse en un estante abierto por venir de la
 * biblioteca "equivocada".
 */
const ESTANTES = [
  {
    id: 'junta',
    titulo: 'Reservado a la Junta',
    para: 'Solo la Junta Directiva',
    detalle: 'Material de uso interno: cartas membretadas, borradores y documentación que no sale de la Junta.',
    tono: 'terracotta',
    soloAdmin: true,
    opcion: 'Solo la Junta Directiva',
    pertenece: (d) => d.accessLevel === 'Administration',
    destino: { library: 'Administration', accessLevel: 'Administration' },
  },
  {
    id: 'oficiales',
    titulo: 'Recursos oficiales',
    para: 'Toda la membresía',
    detalle: 'Lo que la Junta publica para que el colectivo lo use: plantillas de propuesta de evento, guías de uso de la tipografía, formatos.',
    tono: 'caribbean',
    opcion: 'Toda la membresía — como recurso oficial',
    pertenece: (d) => d.library === 'Administration',
    destino: { library: 'Administration', accessLevel: 'Members' },
  },
  {
    id: 'comunidad',
    titulo: 'Aportes de la comunidad',
    para: 'Toda la membresía',
    detalle: 'Lo que aporta cualquier miembro para que los demás se apoyen: apuntes, tesis, ensayos, referencias.',
    tono: 'tea',
    opcion: 'Toda la membresía — como aporte mío',
    pertenece: () => true,
    destino: { library: 'Community', accessLevel: 'Members' },
  },
]

const estanteDe = (d) => ESTANTES.find((e) => e.pertenece(d)) ?? ESTANTES[ESTANTES.length - 1]

/**
 * En pantalla mandan los estantes que más se usan; el reservado va al final.
 * Va aparte del orden de `ESTANTES` porque aquel obedece a la lógica del
 * reparto (lo restringido primero) y mezclarlos ataría una cosa a la otra.
 */
const ORDEN_VISUAL = ['oficiales', 'comunidad', 'junta']

/** Color por familia de archivo: el bloque se reconoce antes de leer el nombre. */
const TONO_EXT = {
  PDF: 'bg-terracotta/20 text-terracotta border-terracotta/30',
  DOC: 'bg-caribbean/15 text-caribbean border-caribbean/25',
  DOCX: 'bg-caribbean/15 text-caribbean border-caribbean/25',
  ODT: 'bg-caribbean/15 text-caribbean border-caribbean/25',
  XLS: 'bg-rainforest/30 text-tea border-tea/20',
  XLSX: 'bg-rainforest/30 text-tea border-tea/20',
  CSV: 'bg-rainforest/30 text-tea border-tea/20',
  PPT: 'bg-candy/15 text-candy border-candy/25',
  PPTX: 'bg-candy/15 text-candy border-candy/25',
  ZIP: 'bg-tea/10 text-tea/60 border-tea/20',
  RAR: 'bg-tea/10 text-tea/60 border-tea/20',
  PNG: 'bg-tea/15 text-tea border-tea/25',
  JPG: 'bg-tea/15 text-tea border-tea/25',
  SVG: 'bg-tea/15 text-tea border-tea/25',
}

const extDe = (d) => {
  const m = (d.fileName || d.name || '').match(/\.([a-z0-9]{1,5})$/i)
  return m ? m[1].toUpperCase() : 'ARCHIVO'
}

const fmtSize = (b) => {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })

/** Bloque de tipo de archivo: el ancla visual de la fila, como la fecha en Eventos. */
function TipoBloque({ doc }) {
  const ext = extDe(doc)
  return (
    <div className={`flex h-16 w-16 flex-none flex-col items-center justify-center rounded-xl border ${TONO_EXT[ext] ?? 'bg-tea/8 text-tea/50 border-tea/15'}`}>
      <span className="font-display text-sm font-semibold uppercase tracking-wide">{ext}</span>
      <span className="mt-0.5 font-mono text-[0.6rem] opacity-70">{fmtSize(doc.sizeBytes)}</span>
    </div>
  )
}

export default function Documentos() {
  const { user, hasPermission } = useSession()
  const verAdmin = hasPermission('documentos.ver_admin')
  const subirComunidad = hasPermission('documentos.subir_comunidad')

  const [version, setVersion] = useState(0)
  // Sin filtro de biblioteca: la API ya devuelve solo lo que esta persona puede
  // ver, y el reparto en estantes se hace aquí.
  const { data, loading, error } = useFetch(() => documentsApi.list(), [version])
  const reload = () => setVersion((v) => v + 1)

  const estantesVisibles = ESTANTES
    .filter((e) => !e.soloAdmin || verAdmin)
    .sort((a, b) => ORDEN_VISUAL.indexOf(a.id) - ORDEN_VISUAL.indexOf(b.id))
  const destinos = estantesVisibles.filter((e) => (e.id === 'comunidad' ? subirComunidad : verAdmin))
  const puedeSubir = destinos.length > 0

  const [busqueda, setBusqueda] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [bajando, setBajando] = useState(null)

  const [abierto, setAbierto] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', estante: '' })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }
  const replaceRef = useRef(null)
  const [replacing, setReplacing] = useState(null)

  // Espacio Junta enlaza aquí con #junta; sin esto el enlace no llevaría a nada
  // visible en una página que puede ser larga.
  useEffect(() => {
    if (loading || !window.location.hash) return
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const abrirFormulario = () => {
    // Por defecto, el estante menos restrictivo al que se tenga acceso: que un
    // descuido deje un archivo demasiado abierto se corrige; que lo deje
    // encerrado en la Junta hace que nadie sepa que existe.
    const porDefecto = destinos.find((e) => e.id === 'comunidad') ?? destinos[0]
    setForm({ name: '', category: '', estante: porDefecto?.id ?? '' })
    setFile(null)
    setAbierto(true)
  }
  const cerrar = () => { setAbierto(false); setForm({ name: '', category: '', estante: '' }); setFile(null) }

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
    const destino = ESTANTES.find((e) => e.id === form.estante)?.destino
    if (!destino) { setMsg({ ok: false, text: 'Elige quién debe poder abrirlo.' }); return }

    setSaving(true)
    try {
      const url = await uploadFile(file, 'documentos')
      await documentsApi.create({
        name: form.name.trim(),
        category: form.category.trim(),
        ...destino,
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

  const hayFiltro = busqueda.trim() !== '' || filtroCat !== ''

  // El back deja gestionar al autor o a Administración; la interfaz lo escondía
  // a todo el mundo salvo a la Junta, dejando a la gente sin poder corregir lo
  // que ella misma subió.
  const puedeGestionar = (d) => verAdmin || d.authorId === user?.id

  return (
    <>
      <PageHeader
        eyebrow="Miembro"
        title="Documentos y biblioteca"
        description="Los archivos que el colectivo comparte para apoyarse."
        actions={puedeSubir && <Btn tone="candy" onClick={() => (abierto ? cerrar() : abrirFormulario())}>{abierto ? 'Cerrar' : '+ Subir documento'}</Btn>}
      />

      <div className="-mt-4 mb-6 flex items-center gap-2">
        <span className="font-mono text-xs text-tea/45">Para qué sirve esta sección</span>
        <InfoTooltip label="Para qué sirve la biblioteca de documentos">
          Aquí vive lo que el colectivo comparte para apoyarse: guías de uso de la tipografía,
          plantillas de cartas, formatos para proponer un evento.
          <br /><br />
          No es tu almacenamiento personal. Según el estante donde lo dejes, el archivo lo verá
          toda la membresía o solo la Junta Directiva. Es también donde la Junta guarda lo suyo
          fuera de los grupos y comisiones.
        </InfoTooltip>
      </div>

      {abierto && (
        <Reveal className="mb-8">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Subir documento</h2>
            <div className="mt-5 space-y-5">
              <div>
                <label className={labelCls}>Archivo</label>
                <input type="file" onChange={onFile} className="mt-1.5 block w-full text-sm text-tea/70 file:mr-4 file:rounded-full file:border-0 file:bg-caribbean file:px-4 file:py-2 file:font-mono file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-jungle hover:file:bg-caribbean/80" />
                {file && <p className="mt-1.5 font-mono text-[0.65rem] text-tea/40">{file.name} · {fmtSize(file.size)}</p>}
              </div>

              {/* Una sola pregunta en vez de "biblioteca" + "nivel de acceso":
                  son dos campos técnicos para una única decisión humana. */}
              <div>
                <label className={labelCls}>¿Quién debe poder abrirlo?</label>
                <div className="mt-2 space-y-2">
                  {destinos.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => set({ estante: e.id })}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                        form.estante === e.id
                          ? 'border-caribbean bg-caribbean/[0.08]'
                          : 'border-tea/12 hover:border-tea/25'
                      }`}
                    >
                      <span className={`mt-0.5 h-4 w-4 flex-none rounded-full border-2 ${form.estante === e.id ? 'border-caribbean bg-caribbean' : 'border-tea/30'}`} />
                      <span>
                        <span className="block font-display text-sm font-semibold uppercase tracking-wide text-cream">{e.opcion}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-tea/50">{e.detalle}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Nombre visible</label>
                  <input className={`${inputCls} mt-1.5`} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ej. Propuesta de evento" />
                </div>
                <div>
                  <label className={labelCls}>Categoría</label>
                  <input className={`${inputCls} mt-1.5`} value={form.category} onChange={(e) => set({ category: e.target.value })} placeholder="Plantillas, Marca, Legal…" list="cats-doc" />
                  <datalist id="cats-doc">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Btn onClick={subir} disabled={saving}>{saving ? 'Subiendo…' : 'Subir documento'}</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      <input ref={replaceRef} type="file" className="hidden" onChange={onReplaceFile} />

      {/* Buscador: una biblioteca crece rápido y recorrerla entera deja de ser viable. */}
      {!loading && !error && todos.length > 0 && (
        <div className="mb-8 rounded-2xl border border-tea/10 bg-jungle p-4">
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
          {hayFiltro && <p className="mt-3 font-mono text-xs text-tea/40">{lista.length} de {todos.length} documentos</p>}
        </div>
      )}

      {loading && <p className="text-tea/50">Cargando documentos…</p>}
      {error && (noAutorizado
        ? <Card><p className="text-sm text-tea/60">Tu rol no tiene acceso a la biblioteca.</p></Card>
        : <p className="text-candy">No se pudieron cargar los documentos.</p>)}

      {!loading && !error && todos.length === 0 && (
        <Card><p className="text-sm text-tea/55">Aún no hay documentos en la biblioteca.{puedeSubir && ' Usa «+ Subir documento».'}</p></Card>
      )}

      {!loading && !error && todos.length > 0 && lista.length === 0 && (
        <Card><p className="text-sm text-tea/55">Ningún documento coincide con la búsqueda.</p></Card>
      )}

      {!loading && !error && lista.length > 0 && (
        <div className="space-y-12">
          {estantesVisibles.map((estante) => {
            const docs = lista.filter((d) => estanteDe(d).id === estante.id)
            // Con un filtro puesto, un estante vacío es ruido; sin filtro, es
            // información: dice que ese estante todavía está por llenar.
            if (docs.length === 0 && hayFiltro) return null

            return (
              <section key={estante.id} id={estante.id}>
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-tea/10 pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-cream">{estante.titulo}</h2>
                    <Chip tone={estante.tono}>{estante.para}</Chip>
                  </div>
                  <span className="font-mono text-xs text-tea/40">
                    {docs.length} {docs.length === 1 ? 'archivo' : 'archivos'}
                  </span>
                </div>
                <p className="mb-5 text-xs leading-relaxed text-tea/45">{estante.detalle}</p>

                {docs.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-tea/12 px-4 py-6 text-center text-xs text-tea/35">
                    Este estante todavía está vacío.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {docs.map((d, i) => (
                      <Reveal key={d.id} delay={Math.min(i, 5) * 60}>
                        <div className="flex flex-col gap-4 rounded-2xl border border-tea/10 bg-jungle p-4 transition hover:border-tea/25 sm:flex-row sm:items-center">
                          <TipoBloque doc={d} />

                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-caribbean/80">{d.category}</p>
                            <h3 className="mt-1 truncate font-display text-base font-semibold uppercase tracking-wide text-cream">{d.name}</h3>
                            <p className="mt-1 font-mono text-[0.65rem] text-tea/40">
                              {d.authorName} · {fmtFecha(d.createdAt)}
                              {d.updatedAt && ` · actualizado ${fmtFecha(d.updatedAt)}`}
                            </p>
                          </div>

                          <div className="flex flex-none flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                            <button onClick={() => descargar(d)} disabled={bajando === d.id} className="rounded-full bg-caribbean/15 px-4 py-2 text-caribbean transition hover:bg-caribbean hover:text-jungle disabled:opacity-40">
                              {bajando === d.id ? 'Bajando…' : 'Descargar'}
                            </button>
                            {puedeGestionar(d) && (
                              <button onClick={() => { setReplacing(d); replaceRef.current?.click() }} className="text-caribbean/70 hover:text-caribbean">Reemplazar</button>
                            )}
                            {puedeGestionar(d) && (
                              <button onClick={() => eliminar(d.id)} className="text-candy/80 hover:text-candy">Eliminar</button>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      <p className="mt-10 font-mono text-xs text-tea/35">v1: al reemplazar solo se conserva la última versión (sin versionado).</p>
    </>
  )
}
