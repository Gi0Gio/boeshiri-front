import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Btn, Reveal, inputCls, labelCls } from '../ui'
import { publicationsApi } from '../../api/publications'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import ImageUpload from '../../components/ImageUpload'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const TIPOS = [
  { api: 'Article', label: 'Artículo', desc: 'Texto largo, con imagen de portada y etiquetas.' },
  { api: 'Photo', label: 'Foto', desc: 'Una imagen. Por ahora se pega la URL (subida real con el storage).' },
  { api: 'Video', label: 'Video', desc: 'Enlace de YouTube; se incrusta en el detalle.' },
  { api: 'Music', label: 'Música', desc: 'Enlace de Spotify, SoundCloud o YouTube.' },
  { api: 'News', label: 'Noticia', desc: 'Aviso oficial del colectivo.', perm: 'noticias.publicar' },
]
const label = (api) => TIPOS.find((t) => t.api === api)?.label ?? api

const MAX_IMAGENES = 3

const MAX_ENLACES = 3

const BLANK = { type: 'Article', title: '', body: '', externalUrl: '', images: [], links: [], tags: '', visibility: 'Public' }

export default function Publicaciones() {
  const { hasPermission } = useSession()
  const puedeCrear = hasPermission('publicaciones.crear')
  const tiposDisponibles = TIPOS.filter((t) => !t.perm || hasPermission(t.perm))

  const [version, setVersion] = useState(0)
  const { data, loading, error } = useFetch(() => publicationsApi.mine(), [version])
  const reload = () => setVersion((v) => v + 1)

  const [abierto, setAbierto] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const tipoMeta = TIPOS.find((t) => t.api === form.type)
  const esTexto = form.type === 'Article' || form.type === 'News'
  const esEnlace = form.type === 'Video' || form.type === 'Music'

  const nuevo = () => { setEditId(null); setForm(BLANK); setMsg(null); setAbierto(true) }
  const cerrar = () => { setAbierto(false); setEditId(null); setForm(BLANK) }

  async function editar(id) {
    setMsg(null)
    try {
      const p = await publicationsApi.get(id)
      setForm({
        type: p.type,
        title: p.title ?? '',
        body: p.body ?? '',
        externalUrl: p.externalUrl ?? '',
        images: p.images ?? [],
        links: p.links ?? [],
        tags: (p.tags ?? []).join(', '),
        visibility: p.visibility ?? 'Public',
      })
      setEditId(id)
      setAbierto(true)
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo abrir la publicación.' })
    }
  }

  async function guardar() {
    if (!form.title.trim()) { setMsg({ ok: false, text: 'El título es obligatorio.' }); return }
    setSaving(true); setMsg(null)
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    try {
      if (editId) {
        await publicationsApi.update(editId, {
          title: form.title.trim(),
          body: form.body || null,
          externalUrl: form.externalUrl || null,
          visibility: form.visibility,
          // Lista final: lo que no venga aquí se elimina, también del bucket.
          images: form.images,
          // Las filas a medio llenar no se envían: el backend exige ambos campos.
          links: form.links.filter((l) => l.title.trim() && l.url.trim()),
          tags,
        })
      } else {
        await publicationsApi.create({
          type: form.type,
          title: form.title.trim(),
          body: form.body || null,
          externalUrl: form.externalUrl || null,
          visibility: form.visibility,
          images: form.images,
          // Las filas a medio llenar no se envían: el backend exige ambos campos.
          links: form.links.filter((l) => l.title.trim() && l.url.trim()),
          tags,
        })
      }
      setMsg({ ok: true, text: editId ? 'Publicación actualizada.' : 'Publicación creada.' })
      cerrar()
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo guardar.' })
    } finally {
      setSaving(false)
    }
  }

  async function cambiarEstado(id, action) {
    if (action === 'Delete' && !(await confirm({ message: '¿Eliminar esta publicación? No se puede deshacer.', danger: true, confirmLabel: 'Eliminar' }))) return
    try {
      await publicationsApi.changeStatus(id, action)
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo cambiar el estado.' })
    }
  }

  const pubs = (data ?? []).filter((p) => p.status !== 'Deleted')

  return (
    <>
      <PageHeader
        eyebrow="Miembro"
        title="Mis publicaciones"
        description="Publicas sin aprobación previa; la administración puede moderar."
        actions={puedeCrear && <Btn tone="candy" onClick={() => (abierto ? cerrar() : nuevo())}>{abierto ? 'Cerrar' : '+ Nueva publicación'}</Btn>}
      />


      {!puedeCrear && (
        <Card className="mb-6"><p className="text-sm text-tea/60">Tu rol aún no tiene permiso para publicar. Pídeselo a la administración.</p></Card>
      )}

      {abierto && (
        <Reveal className="mb-8">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{editId ? 'Editar publicación' : 'Nueva publicación'}</h2>

            {!editId && (
              <>
                <p className="mt-3 font-mono text-xs uppercase tracking-wide text-tea/45">Tipo</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tiposDisponibles.map((t) => (
                    <button key={t.api} type="button" onClick={() => set({ type: t.api })}
                      className={`rounded-full px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${form.type === t.api ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/55 hover:bg-tea/15'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 rounded-lg border border-tea/10 bg-black/20 px-4 py-2 text-xs text-tea/60">{tipoMeta?.desc}</p>
              </>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls}>Título</label>
                <input className={`${inputCls} mt-1.5`} value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Título de la publicación" />
              </div>

              {esTexto && (
                <div>
                  <label className={labelCls}>Cuerpo</label>
                  <textarea rows={6} className={`${inputCls} mt-1.5 resize-none`} value={form.body} onChange={(e) => set({ body: e.target.value })} placeholder="Escribe el contenido…" />
                </div>
              )}

              {esEnlace && (
                <>
                  <div>
                    <label className={labelCls}>{form.type === 'Video' ? 'Enlace de YouTube' : 'Enlace (Spotify / SoundCloud / YouTube)'}</label>
                    <input className={`${inputCls} mt-1.5`} value={form.externalUrl} onChange={(e) => set({ externalUrl: e.target.value })} placeholder="https://…" />
                  </div>
                  <div>
                    <label className={labelCls}>Descripción (opcional)</label>
                    <textarea rows={3} className={`${inputCls} mt-1.5 resize-none`} value={form.body} onChange={(e) => set({ body: e.target.value })} placeholder="Contexto de la pieza…" />
                  </div>
                </>
              )}

              {/* Galería: hasta 3 imágenes, y ahora también al EDITAR. Antes la
                  imagen solo se podía elegir al crear, así que una portada mal
                  puesta obligaba a borrar la publicación y rehacerla. */}
              {(form.type === 'Photo' || esTexto) && (
                <div>
                  <label className={labelCls}>
                    {form.type === 'Photo' ? 'Imágenes' : 'Imágenes (opcional)'}
                    <span className="ml-2 font-normal normal-case tracking-normal text-tea/40">
                      {form.images.length}/{MAX_IMAGENES}
                    </span>
                  </label>
                  <div className="mt-2 space-y-3">
                    {form.images.map((url, i) => (
                      <ImageUpload
                        key={`${url}-${i}`}
                        value={url}
                        onChange={(u) => set({
                          images: u
                            ? form.images.map((x, j) => (j === i ? u : x))
                            : form.images.filter((_, j) => j !== i),   // vaciar = quitar
                        })}
                        folder="publicaciones"
                        label={`Imagen ${i + 1}`}
                      />
                    ))}
                    {form.images.length < MAX_IMAGENES && (
                      <ImageUpload
                        key={`nueva-${form.images.length}`}
                        value=""
                        onChange={(u) => u && set({ images: [...form.images, u] })}
                        folder="publicaciones"
                        label={form.images.length === 0 ? 'Añadir imagen' : 'Añadir otra'}
                      />
                    )}
                  </div>
                  {form.type === 'Photo' && form.images.length === 0 && (
                    <p className="mt-2 text-xs text-terracotta">Una publicación de tipo Foto necesita al menos una imagen.</p>
                  )}
                </div>
              )}

              {/* Enlaces de referencia: solo en textos, que es donde el §4.3 los
                  contempla. El backend acepta hasta 3 al crear y al editar. */}
              {esTexto && (
                <div>
                  <label className={labelCls}>
                    Enlaces de referencia
                    <span className="ml-2 font-normal normal-case tracking-normal text-tea/40">{form.links.length}/{MAX_ENLACES}</span>
                  </label>
                  <div className="mt-2 space-y-2">
                    {form.links.map((l, i) => (
                      <div key={i} className="flex flex-col gap-2 sm:flex-row">
                        <input
                          className={`${inputCls} sm:w-1/3`}
                          value={l.title}
                          onChange={(e) => set({ links: form.links.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })}
                          placeholder="Título"
                        />
                        <input
                          className={`${inputCls} flex-1`}
                          value={l.url}
                          onChange={(e) => set({ links: form.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })}
                          placeholder="https://…"
                        />
                        <button
                          type="button"
                          onClick={() => set({ links: form.links.filter((_, j) => j !== i) })}
                          className="flex-none px-2 text-lg text-tea/40 transition hover:text-candy"
                          aria-label="Quitar enlace"
                        >✕</button>
                      </div>
                    ))}
                    {form.links.length < MAX_ENLACES && (
                      <button
                        type="button"
                        onClick={() => set({ links: [...form.links, { title: '', url: '' }] })}
                        className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-caribbean/80 transition hover:text-caribbean"
                      >
                        + Añadir enlace
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className={`${labelCls} inline-flex items-center gap-1.5`}>
                  Etiquetas
                  {/* El orden importa y no es evidente: sin avisarlo, alguien pone
                      "chiriquí" primero y su artículo de poesía sale como
                      "Artículo · Chiriquí". */}
                  <span
                    tabIndex={0}
                    role="note"
                    title="La primera etiqueta acompaña al tipo en las tarjetas y en el detalle. Si escribes «poesía, texto, dolega», se mostrará «Artículo · Poesía»."
                    aria-label="La primera etiqueta acompaña al tipo. Escribe primero la más representativa."
                    className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-tea/15 font-mono text-[0.6rem] normal-case text-tea/60 transition hover:bg-caribbean hover:text-jungle"
                  >i</span>
                </label>
                <input className={`${inputCls} mt-1.5`} value={form.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="Separadas por coma: poesía, chiriquí, colectivo" />
                <p className="mt-1.5 font-mono text-[0.65rem] text-tea/40">
                  La primera se muestra junto al tipo: «{label(form.type)}{form.tags.split(',')[0]?.trim() ? ` · ${form.tags.split(',')[0].trim()}` : ''}»
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-tea/70">
                <input type="checkbox" checked={form.visibility === 'Public'} onChange={(e) => set({ visibility: e.target.checked ? 'Public' : 'Members' })} className="h-4 w-4 accent-[#00e6bc]" />
                Pública (si la desmarcas, solo la ven miembros)
              </label>
              <Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Publicar'}</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      {loading && <p className="text-tea/50">Cargando publicaciones…</p>}
      {error && <p className="text-candy">No se pudieron cargar tus publicaciones.</p>}
      {!loading && !error && pubs.length === 0 && (
        <Card><p className="text-sm text-tea/55">Aún no has publicado nada. {puedeCrear && 'Usa «+ Nueva publicación» para empezar.'}</p></Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {pubs.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 80}>
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Chip tone="tea">{label(p.type)}</Chip>
                  {p.visibility === 'Members' && <Chip tone="terracotta">Solo miembros</Chip>}
                </div>
                <Chip tone={p.status === 'Published' ? 'caribbean' : 'gris'}>{p.status === 'Published' ? 'Pública' : 'Oculta'}</Chip>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold uppercase tracking-wide text-cream">{p.title}</h3>
              <p className="mt-2 font-mono text-xs text-tea/40">
                Creada {new Date(p.createdAt).toLocaleDateString('es-PA')}{p.editedAt && ` · editada ${new Date(p.editedAt).toLocaleDateString('es-PA')}`}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 border-t border-tea/8 pt-4 text-xs font-semibold uppercase tracking-wide">
                <Link to={`/publicaciones/${p.id}`} target="_blank" className="text-caribbean/80 hover:text-caribbean">Ver</Link>
                <button onClick={() => editar(p.id)} className="text-caribbean/80 hover:text-caribbean">Editar</button>
                {p.status === 'Published'
                  ? <button onClick={() => cambiarEstado(p.id, 'Hide')} className="text-caribbean/80 hover:text-caribbean">Ocultar</button>
                  : <button onClick={() => cambiarEstado(p.id, 'Show')} className="text-caribbean/80 hover:text-caribbean">Mostrar</button>}
                <button onClick={() => cambiarEstado(p.id, 'Delete')} className="text-candy hover:underline">Eliminar</button>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </>
  )
}
