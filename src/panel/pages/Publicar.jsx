import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Btn, inputCls } from '../ui'
import { publicationsApi } from '../../api/publications'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import CompartirBoton from '../../components/CompartirBoton'
import { PiezaPublicacion } from '../../components/Mural'
import { detectarMedio, esSoloEnlace } from '../../utils/medios'
import FotosPublicacion from '../publicar/FotosPublicacion'
import EtiquetasInput from '../publicar/EtiquetasInput'
import Ico from '../Ico'

/**
 * Compositor: «Publicar» abre aquí directamente (antes caía en una lista y había
 * que pedir el formulario). Se empieza por el contenido; el tipo se cambia con un
 * toque y, al pegar un enlace, se deduce solo. Al lado (o debajo, en el celular)
 * está la pieza tal como saldrá en el Mural, con el mismo componente que el Mural.
 * Lo que se escribe se guarda en este dispositivo hasta publicarlo.
 * Con `:id` edita una publicación existente (el tipo ya no cambia: la API no lo deja).
 */
const TIPOS = [
  { api: 'Article', label: 'Escrito', ico: 'pluma', tarjeta: 'Artículo' },
  { api: 'Photo', label: 'Fotos', ico: 'imagen', tarjeta: 'Foto' },
  { api: 'Video', label: 'Video', ico: 'play', tarjeta: 'Video' },
  { api: 'Music', label: 'Música', ico: 'nota', tarjeta: 'Música' },
  { api: 'News', label: 'Noticia', ico: 'megaphone', tarjeta: 'Noticia', perm: 'noticias.publicar' },
]
const tipo = (api) => TIPOS.find((t) => t.api === api) ?? TIPOS[0]

const MAX_FOTOS = { Article: 3, News: 3, Photo: 3, Video: 1, Music: 1 }
const MAX_ENLACES = 3
const BLANCO = { type: 'Article', title: '', body: '', externalUrl: '', images: [], links: [], tags: [], visibility: 'Public' }
const CHARS_POR_MINUTO = 1240 // la misma cuenta que la API para la tarjeta

const claveBorrador = (userId) => `boeshiri-borrador-publicacion-${userId}`
const vacio = (f) => !f.title.trim() && !f.body.trim() && !f.externalUrl.trim() && f.images.length === 0 && f.links.length === 0 && f.tags.length === 0

function leerBorrador(userId) {
  try {
    const b = JSON.parse(localStorage.getItem(claveBorrador(userId)) ?? 'null')
    return b?.form && !vacio({ ...BLANCO, ...b.form }) ? b : null
  } catch { return null }
}
function hace(ms) {
  const min = Math.round((Date.now() - ms) / 60000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} días`
}

/** Etiqueta de campo del compositor: Montserrat semibold, no la mono de antes. */
const Etiqueta = ({ htmlFor, children, extra }) => (
  <label htmlFor={htmlFor} className="text-sm font-semibold text-cream">
    {children}{extra && <span className="font-normal text-tea/70"> {extra}</span>}
  </label>
)

export default function Publicar() {
  const { id: editId } = useParams()
  const { user, hasPermission } = useSession()
  const toast = useToast()
  const navigate = useNavigate()
  const tipos = TIPOS.filter((t) => !t.perm || hasPermission(t.perm))
  const puedeCrear = hasPermission('publicaciones.crear')

  const [form, setForm] = useState(BLANCO)
  const [cargando, setCargando] = useState(Boolean(editId))
  const [enviando, setEnviando] = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [publicada, setPublicada] = useState(null) // { id, visibility } tras publicar
  const [borrador, setBorrador] = useState(() => (editId ? null : leerBorrador(user.id)))
  const [aviso, setAviso] = useState(null) // «Detectamos Spotify…»
  const [conocidas, setConocidas] = useState([])
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  // Editar: se carga la publicación.
  useEffect(() => {
    if (!editId) return
    let vivo = true
    publicationsApi.get(editId)
      .then((p) => {
        if (!vivo) return
        setForm({ type: p.type, title: p.title ?? '', body: p.body ?? '', externalUrl: p.externalUrl ?? '', images: p.images ?? [], links: p.links ?? [], tags: p.tags ?? [], visibility: p.visibility ?? 'Public' })
        setCargando(false)
      })
      .catch((e) => { toast.error(e.message || 'No se pudo abrir la publicación.'); navigate('/panel/publicaciones') })
    return () => { vivo = false }
  }, [editId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Etiquetas que ya usa el colectivo, por frecuencia y con su forma más común.
  useEffect(() => {
    publicationsApi.list().then((ps) => {
      const cuenta = new Map()
      for (const p of ps) for (const t of p.tags ?? []) {
        const k = t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        const e = cuenta.get(k) ?? { n: 0, formas: new Map() }
        e.n += 1; e.formas.set(t, (e.formas.get(t) ?? 0) + 1)
        cuenta.set(k, e)
      }
      setConocidas([...cuenta.values()].sort((a, b) => b.n - a.n)
        .map((e) => [...e.formas.entries()].sort((a, b) => b[1] - a[1])[0][0]))
    }).catch(() => {})
  }, [])

  // Borrador: se guarda solo, un momento después de dejar de escribir.
  const reloj = useRef(null)
  useEffect(() => {
    if (editId || publicada || borrador) return
    clearTimeout(reloj.current)
    reloj.current = setTimeout(() => {
      try {
        if (vacio(form)) localStorage.removeItem(claveBorrador(user.id))
        else localStorage.setItem(claveBorrador(user.id), JSON.stringify({ form, guardadoEn: Date.now() }))
      } catch { /* sin almacenamiento: el compositor funciona igual */ }
    }, 600)
    return () => clearTimeout(reloj.current)
  }, [form, editId, publicada, borrador, user.id])

  const medio = form.type === 'Video' || form.type === 'Music' ? detectarMedio(form.externalUrl) : null
  const enlaceRoto = (form.type === 'Video' || form.type === 'Music') && form.externalUrl.trim() && !medio
  const esTexto = form.type === 'Article' || form.type === 'News'
  const sugerirMedio = esTexto && esSoloEnlace(form.body) ? detectarMedio(form.body) : null

  // Al pegar un enlace se deduce si es video o música.
  function cambiarEnlace(url) {
    const m = detectarMedio(url)
    if (m && m.tipo !== form.type && !editId) {
      set({ externalUrl: url, type: m.tipo })
      setAviso(`Es de ${m.proveedor}: lo pusimos como ${tipo(m.tipo).label}.`)
    } else {
      set({ externalUrl: url })
      setAviso(null)
    }
  }

  function cambiarTipo(api) {
    // Las fotos que sobren al pasar a un tipo con menos sitio se quedan fuera.
    setForm((f) => ({ ...f, type: api, images: f.images.slice(0, MAX_FOTOS[api]) }))
    setAviso(null)
  }

  const faltan = [
    !form.title.trim() && 'un título',
    form.type === 'Photo' && form.images.length === 0 && 'al menos una foto',
    (form.type === 'Video' || form.type === 'Music') && !form.externalUrl.trim() && 'el enlace',
    enlaceRoto && 'un enlace de YouTube, Spotify o SoundCloud',
  ].filter(Boolean)

  async function publicar() {
    setIntentado(true)
    if (faltan.length) { toast.error(`Falta ${faltan.join(' y ')}.`); return }
    setEnviando(true)
    const datos = {
      title: form.title.trim(),
      body: form.body.trim() || null,
      externalUrl: form.externalUrl.trim() || null,
      visibility: form.visibility,
      images: form.images,
      links: form.links.filter((l) => l.title.trim() && l.url.trim()),
      tags: form.tags,
    }
    try {
      if (editId) {
        await publicationsApi.update(editId, datos)
        toast.success('Publicación actualizada.')
        navigate('/panel/publicaciones')
        return
      }
      const r = await publicationsApi.create({ type: form.type, ...datos })
      try { localStorage.removeItem(claveBorrador(user.id)) } catch { /* nada */ }
      setPublicada({ id: r?.id, visibility: form.visibility })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      toast.error(e.message || 'No se pudo publicar.')
    } finally { setEnviando(false) }
  }

  // La pieza de la vista previa: los mismos datos que el Mural recibe de la API.
  const pieza = useMemo(() => ({
    id: publicada?.id ?? 'vista-previa',
    type: form.type,
    title: form.title.trim() || 'Tu título aquí',
    authorName: user.fullName,
    coverImage: form.images[0] ?? null,
    readingMinutes: form.body.trim() ? Math.floor(form.body.trim().length / CHARS_POR_MINUTO) + 1 : 0,
  }), [form, user.fullName, publicada])

  const vistaPrevia = (
    <figure>
      <figcaption className="mb-2 text-sm font-semibold text-tea/80">Así se verá en el Mural</figcaption>
      {/* Es una imagen de la pieza, no un enlace: no se puede navegar desde aquí. */}
      {/* La pared del Mural en sus colores reales (colores-sitio), no los del sombrero. */}
      <div aria-hidden="true" className="colores-sitio bg-dorace-pattern pointer-events-none aspect-[4/5] select-none rounded-2xl bg-jungle p-2.5 [&_a]:cursor-default">
        <PiezaPublicacion p={pieza} />
      </div>
      <p className="mt-2 text-xs text-tea/70">
        {tipo(form.type).tarjeta}{form.tags[0] ? ` · ${form.tags[0]}` : ''} · {form.visibility === 'Public' ? 'la ve todo el mundo' : 'solo la ven miembros'}
      </p>
    </figure>
  )

  if (!puedeCrear) {
    return (
      <>
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-cream md:text-4xl">Publicar</h1>
        <p className="mt-4 rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">Tu rol aún no tiene permiso para publicar. Pídeselo a la Junta.</p>
      </>
    )
  }
  if (cargando) return <p className="text-tea/70">Cargando…</p>

  // ── Pantalla de después de publicar ──
  if (publicada) {
    return (
      <div className="mx-auto max-w-md text-center">
        <Ico name="pluma" className="mx-auto h-9 w-9 text-caribbean" />
        <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-cream md:text-4xl">¡Publicada!</h1>
        <p className="mt-2 text-tea/80">
          {publicada.visibility === 'Public' ? 'Ya está en el Mural para todo el mundo.' : 'Ya está en el Mural para los miembros del colectivo.'}
        </p>
        <div className="mx-auto mt-6 max-w-[240px] text-left">{vistaPrevia}</div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Btn as={Link} to={`/publicaciones/${publicada.id}`}>Ver en el Mural</Btn>
          {/* Compartir solo lo público: un enlace solo-miembros mostraría «inicia sesión» a quien lo reciba. */}
          {publicada.visibility === 'Public' && <CompartirBoton tipo="publicacion" id={publicada.id} titulo={form.title} variant="panel" />}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-x-5">
          <button type="button" onClick={() => { setForm(BLANCO); setPublicada(null); setIntentado(false) }}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">Publicar otra</button>
          <Link to="/panel/publicaciones" className="inline-flex min-h-11 items-center text-sm font-semibold text-tea/80 hover:text-caribbean hover:underline">Mis publicaciones</Link>
        </div>
      </div>
    )
  }

  const t = tipo(form.type)
  const maxFotos = MAX_FOTOS[form.type]

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-cream md:text-4xl">{editId ? 'Editar' : 'Publicar'}</h1>
        <Link to="/panel/publicaciones" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-caribbean hover:underline">
          <Ico name="list" className="h-4 w-4" />Mis publicaciones
        </Link>
      </div>

      {borrador && (
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-caribbean/30 bg-caribbean/8 px-4 py-3">
          <p className="min-w-0 flex-1 text-sm text-tea">
            Tienes un borrador sin publicar{borrador.form.title ? <>: <strong className="font-semibold">«{borrador.form.title}»</strong></> : ''} <span className="text-tea/70">({hace(borrador.guardadoEn)})</span>
          </p>
          <span className="flex gap-3">
            <button type="button" onClick={() => { setForm({ ...BLANCO, ...borrador.form }); setBorrador(null) }}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">Seguir con él</button>
            <button type="button" onClick={() => { try { localStorage.removeItem(claveBorrador(user.id)) } catch { /* nada */ } setBorrador(null) }}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-tea/70 hover:text-candy hover:underline">Descartar</button>
          </span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_224px]">
        <div className="space-y-6">
          {/* Tipo: con un toque; al editar ya no se cambia. */}
          {editId ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-tea/8 px-4 py-2 text-sm font-semibold text-tea"><Ico name={t.ico} className="h-4 w-4" />{t.label}</p>
          ) : (
            <div role="group" aria-label="Qué vas a publicar" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tipos.map((x) => (
                <button key={x.api} type="button" onClick={() => cambiarTipo(x.api)} aria-pressed={form.type === x.api}
                  className={`inline-flex min-h-11 flex-none items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${form.type === x.api ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/80 hover:bg-tea/15 hover:text-tea'}`}>
                  <Ico name={x.ico} className="h-[18px] w-[18px]" />{x.label}
                </button>
              ))}
            </div>
          )}

          {/* Video y música empiezan por el enlace: es lo que define la pieza. */}
          {(form.type === 'Video' || form.type === 'Music') && (
            <div>
              <Etiqueta htmlFor="p-enlace">Enlace</Etiqueta>
              <input id="p-enlace" type="url" inputMode="url" className={`${inputCls} mt-1.5`} value={form.externalUrl}
                onChange={(e) => cambiarEnlace(e.target.value)} placeholder="Pega el enlace de YouTube, Spotify o SoundCloud" />
              {aviso && <p className="mt-1.5 text-sm text-caribbean">{aviso}</p>}
              {enlaceRoto && <p className="mt-1.5 text-sm text-terracotta">No reconocemos este enlace. Usa uno de YouTube, Spotify o SoundCloud.</p>}
              {medio && (
                <div className={`mt-3 overflow-hidden rounded-2xl border border-tea/10 bg-jungle-deep/60 ${medio.alto ? '' : 'aspect-video'}`}>
                  <iframe src={medio.embed} title={`Vista previa en ${medio.proveedor}`} height={medio.alto ?? undefined} loading="lazy"
                    className={`w-full ${medio.alto ? '' : 'h-full'}`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
                </div>
              )}
            </div>
          )}

          {form.type === 'Photo' && (
            <FotosPublicacion value={form.images} onChange={(images) => set({ images })} max={maxFotos} requerida={intentado} etiqueta="Fotos" />
          )}

          <div>
            <Etiqueta htmlFor="p-titulo">Título</Etiqueta>
            <input id="p-titulo" className={`${inputCls} mt-1.5 text-base`} value={form.title} maxLength={200}
              onChange={(e) => set({ title: e.target.value })} placeholder={form.type === 'Photo' ? 'Cómo se llama la obra' : '¿De qué va?'} />
            {intentado && !form.title.trim() && <p className="mt-1.5 text-sm text-terracotta">Ponle un título.</p>}
          </div>

          <div>
            <Etiqueta htmlFor="p-cuerpo" extra={esTexto ? undefined : '(opcional)'}>{esTexto ? 'Texto' : 'Descripción'}</Etiqueta>
            <textarea id="p-cuerpo" rows={esTexto ? 9 : 3} className={`${inputCls} mt-1.5 text-base leading-relaxed`} value={form.body}
              onChange={(e) => set({ body: e.target.value })}
              placeholder={esTexto ? 'Escribe aquí. Los saltos de línea se respetan.' : 'Contexto de la pieza, créditos, dónde se hizo…'} />
            {sugerirMedio && (
              <p className="mt-1.5 text-sm text-tea/85">
                Esto parece {sugerirMedio.tipo === 'Video' ? 'un video' : 'música'} de {sugerirMedio.proveedor}.{' '}
                <button type="button" onClick={() => { set({ type: sugerirMedio.tipo, externalUrl: form.body.trim(), body: '' }); setAviso(null) }}
                  className="font-semibold text-caribbean hover:underline">Publicarlo como {tipo(sugerirMedio.tipo).label}</button>
              </p>
            )}
          </div>

          {form.type !== 'Photo' && (
            <FotosPublicacion value={form.images} onChange={(images) => set({ images })} max={maxFotos}
              etiqueta={maxFotos === 1 ? 'Portada (opcional)' : 'Fotos (opcional)'} />
          )}

          {esTexto && (
            <div>
              <p className="text-sm font-semibold text-cream">Enlaces de referencia <span className="font-normal text-tea/70">(opcional)</span></p>
              <div className="mt-1.5 space-y-2">
                {form.links.map((l, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-xl sm:flex-row sm:items-center">
                    <input aria-label={`Título del enlace ${i + 1}`} className={`${inputCls} sm:w-2/5`} value={l.title} placeholder="Título"
                      onChange={(e) => set({ links: form.links.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                    <span className="flex flex-1 items-center gap-2">
                      <input aria-label={`Dirección del enlace ${i + 1}`} type="url" className={`${inputCls} flex-1`} value={l.url} placeholder="https://…"
                        onChange={(e) => set({ links: form.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
                      <button type="button" onClick={() => set({ links: form.links.filter((_, j) => j !== i) })} aria-label={`Quitar el enlace ${i + 1}`}
                        className="grid h-11 w-11 flex-none place-items-center rounded-full text-tea/70 transition hover:bg-tea/5 hover:text-candy">
                        <Ico name="cerrar" className="h-4 w-4" />
                      </button>
                    </span>
                  </div>
                ))}
                {form.links.length < MAX_ENLACES && (
                  <button type="button" onClick={() => set({ links: [...form.links, { title: '', url: '' }] })}
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-caribbean hover:underline">
                    <Ico name="mas" className="h-4 w-4" />Añadir enlace
                  </button>
                )}
              </div>
            </div>
          )}

          <EtiquetasInput value={form.tags} onChange={(tags) => set({ tags })} conocidas={conocidas} tipoLabel={t.tarjeta} />

          <div>
            <p id="p-quien" className="text-sm font-semibold text-cream">¿Quién la ve?</p>
            <div role="radiogroup" aria-labelledby="p-quien" className="mt-1.5 inline-flex rounded-full border border-tea/15 bg-tea/5 p-1">
              {[['Public', 'Todo el mundo'], ['Members', 'Solo miembros']].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={form.visibility === v} onClick={() => set({ visibility: v })}
                  className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${form.visibility === v ? 'bg-jungle text-cream shadow-sm' : 'text-tea/70 hover:text-tea'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* En el celular la vista previa va aquí, justo antes de publicar. */}
          <div className="lg:hidden">{vistaPrevia}</div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-tea/10 pt-5">
            <Btn onClick={publicar} disabled={enviando}>{enviando ? 'Publicando…' : editId ? 'Guardar cambios' : 'Publicar'}</Btn>
            {editId && <Link to="/panel/publicaciones" className="inline-flex min-h-11 items-center text-sm font-semibold text-tea/70 hover:text-tea hover:underline">Cancelar</Link>}
            {!editId && !vacio(form) && <span className="text-xs text-tea/70">Se guarda solo en este dispositivo mientras escribes.</span>}
            {intentado && faltan.length > 0 && <p className="w-full text-sm text-terracotta">Falta {faltan.join(' y ')}.</p>}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-10">{vistaPrevia}</div>
        </aside>
      </div>
    </>
  )
}
