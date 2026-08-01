import { useState } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { publicationsApi } from '../api/publications'
import { communityApi } from '../api/community'
import { useFetch } from '../hooks/useFetch'
import { gradientFor, iniciales } from '../utils/gradient'

const tabs = [
  { id: 'feed', label: 'Feed' },
  { id: 'perfiles', label: 'Comunidad' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'articulos', label: 'Artículos' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'video', label: 'Video' },
  { id: 'musica', label: 'Música' },
]

/* Metadatos por tipo del API (PublicationType) */
const META = {
  News: { key: 'noticia', label: 'Noticia', clase: 'bg-terracotta text-white' },
  Article: { key: 'articulo', label: 'Artículo', clase: 'bg-tea text-jungle' },
  Photo: { key: 'foto', label: 'Foto', clase: 'bg-caribbean text-jungle' },
  Video: { key: 'video', label: 'Video', clase: 'bg-terracotta text-white' },
  Music: { key: 'musica', label: 'Música', clase: 'bg-candy text-white' },
}

const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })

function Badge({ type }) {
  const m = META[type]
  if (!m) return null
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${m.clase}`}>
      <FrogIcon className="h-3 w-3" />
      {m.label}
    </span>
  )
}

/* Portada: imagen real o gradiente de marca con la rana */
function Cover({ p, className = '', aspect = 'aspect-square', play = false }) {
  return (
    <div className={`relative overflow-hidden ${aspect} ${className}`} style={p.coverImage ? undefined : { background: gradientFor(p.id) }}>
      {p.coverImage ? (
        <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <FrogIcon className="absolute bottom-3 right-3 h-16 w-16 text-white/15 transition-transform duration-500 group-hover:scale-110" />
      )}
      {play && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 pl-1 text-xl text-jungle transition-transform duration-300 group-hover:scale-110">▶</span>
        </span>
      )}
    </div>
  )
}

function Tags({ tags }) {
  if (!tags?.length) return null
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.slice(0, 4).map((t) => (
        <span key={t} className="rounded-full bg-rainforest/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide text-rainforest">#{t}</span>
      ))}
    </div>
  )
}

/* ── Tarjetas por tipo (todas enlazan al detalle) ───────────── */
function CardVisual({ p, aspect }) {
  const play = p.type === 'Video' || p.type === 'Music'
  return (
    <Link to={`/publicaciones/${p.id}`} className="group relative block overflow-hidden rounded-2xl">
      <Cover p={p} aspect={aspect} play={play} />
      <span className="absolute left-3 top-3"><Badge type={p.type} /></span>
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-jungle/90 via-jungle/10 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{p.title}</h3>
        <p className="text-xs uppercase tracking-[0.15em] text-tea/70">{p.authorName}</p>
      </div>
    </Link>
  )
}

function CardTexto({ p, dark = false }) {
  return (
    <Link
      to={`/publicaciones/${p.id}`}
      className={`group block rounded-2xl p-7 shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)] ${dark ? 'relative overflow-hidden bg-jungle text-tea' : 'bg-white'}`}
    >
      {dark && <FrogIcon className="pointer-events-none absolute -bottom-8 -right-6 h-40 w-40 text-white/5" />}
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <Badge type={p.type} />
          <span className={`text-xs font-medium uppercase tracking-wide ${dark ? 'text-tea/50' : 'text-jungle/50'}`}>{fmtFecha(p.createdAt)}</span>
        </div>
        <h3 className={`mt-4 font-display text-xl font-semibold uppercase tracking-wide ${dark ? 'text-cream' : 'text-jungle transition-colors group-hover:text-rainforest'}`}>{p.title}</h3>
        <Tags tags={p.tags} />
        <p className={`mt-5 font-display text-xs font-semibold uppercase tracking-[0.2em] ${dark ? 'text-caribbean' : 'text-rainforest'}`}>Por {p.authorName} · Leer más →</p>
      </div>
    </Link>
  )
}

function Vacio({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-rainforest/25 bg-white/50 py-16 text-center">
      <FrogIcon className="mx-auto h-14 w-14 text-rainforest/40" />
      <p className="mt-4 font-display text-sm uppercase tracking-[0.15em] text-jungle/50">{children}</p>
    </div>
  )
}

/* ── Vistas ─────────────────────────────────────────────────── */
function Feed({ pubs }) {
  if (!pubs.length) return <Vacio>Aún no hay publicaciones</Vacio>
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {pubs.map((p, i) => (
        <Reveal key={p.id} delay={(i % 3) * 80} className="break-inside-avoid">
          {p.type === 'Article' || p.type === 'News'
            ? <CardTexto p={p} dark={p.type === 'Article'} />
            : <CardVisual p={p} aspect={p.type === 'Photo' ? 'aspect-[3/4]' : 'aspect-video'} />}
        </Reveal>
      ))}
    </div>
  )
}

function Perfiles() {
  const { data, loading, error } = useFetch(() => communityApi.list())
  if (loading) return <p className="text-center text-jungle/50">Cargando perfiles…</p>
  if (error) return <Vacio>No se pudo cargar la comunidad</Vacio>
  if (!data?.length) return <Vacio>Aún no hay miembros públicos</Vacio>
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((p, i) => (
        <Reveal as={Link} to={`/perfil/${p.id}`} key={p.id} delay={(i % 3) * 100}
          className="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]">
          <div className="relative aspect-[4/3] overflow-hidden" style={p.photoUrl ? undefined : { background: gradientFor(p.id) }}>
            {p.photoUrl
              ? <img src={p.photoUrl} alt={p.fullName} className="h-full w-full object-cover" />
              : <span className="absolute left-6 top-5 font-display text-6xl font-semibold text-white/90">{iniciales(p.fullName)}</span>}
          </div>
          <div className="flex items-end justify-between p-6">
            <div>
              <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-jungle">{p.fullName}</h3>
              {p.discipline && <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-rainforest">{p.discipline}</p>}
            </div>
            <span className="font-display text-sm text-rainforest transition-transform group-hover:translate-x-1">→</span>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

function GridTexto({ pubs, vacio }) {
  if (!pubs.length) return <Vacio>{vacio}</Vacio>
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {pubs.map((p, i) => <Reveal key={p.id} delay={(i % 2) * 100}><CardTexto p={p} dark={p.type === 'Article'} /></Reveal>)}
    </div>
  )
}

function GridVisual({ pubs, vacio, cols = 'md:grid-cols-3', aspect = 'aspect-square' }) {
  if (!pubs.length) return <Vacio>{vacio}</Vacio>
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${cols}`}>
      {pubs.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 90}><CardVisual p={p} aspect={aspect} /></Reveal>)}
    </div>
  )
}

function Musica({ pubs }) {
  if (!pubs.length) return <Vacio>Aún no hay música</Vacio>
  return (
    <div className="overflow-hidden rounded-2xl border border-rainforest/15 bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)]">
      {pubs.map((p) => (
        <Link to={`/publicaciones/${p.id}`} key={p.id} className="flex items-center gap-5 border-b border-rainforest/10 px-5 py-4 transition-colors last:border-0 hover:bg-tea/30">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-jungle pl-0.5 text-sm text-tea">▶</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-lg font-semibold uppercase tracking-wide text-jungle">{p.title}</span>
            <span className="block truncate text-xs uppercase tracking-[0.15em] text-rainforest">{p.authorName}</span>
          </span>
          <span className="flex-none font-display text-sm text-jungle/50">{fmtFecha(p.createdAt)}</span>
        </Link>
      ))}
    </div>
  )
}

export default function Explorar() {
  const [activa, setActiva] = useState('feed')
  const { data, loading, error } = useFetch(() => publicationsApi.list())
  const pubs = data ?? []
  const por = (t) => pubs.filter((p) => p.type === t)

  const vistas = {
    feed: <Feed pubs={pubs} />,
    perfiles: <Perfiles />,
    noticias: <GridTexto pubs={por('News')} vacio="Aún no hay noticias" />,
    articulos: <GridTexto pubs={por('Article')} vacio="Aún no hay artículos" />,
    fotos: <GridVisual pubs={por('Photo')} vacio="Aún no hay fotos" aspect="aspect-[3/4]" />,
    video: <GridVisual pubs={por('Video')} vacio="Aún no hay videos" aspect="aspect-video" cols="md:grid-cols-3" />,
    musica: <Musica pubs={por('Music')} />,
  }

  return (
    <div className="pt-16">
      <div className="sticky top-16 z-30 border-b border-rainforest/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <button type="button" key={t.id} onClick={() => setActiva(t.id)}
              className={`flex-none rounded-full px-5 py-2 font-display text-sm font-semibold uppercase tracking-[0.15em] transition ${activa === t.id ? 'bg-jungle text-tea' : 'text-jungle/60 hover:bg-tea/50 hover:text-jungle'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className="min-h-[60vh] bg-cream py-12">
        <div className="mx-auto max-w-6xl px-5">
          {activa !== 'perfiles' && loading && <p className="text-center text-jungle/50">Cargando…</p>}
          {activa !== 'perfiles' && error && <Vacio>No se pudo cargar el contenido</Vacio>}
          {(activa === 'perfiles' || (!loading && !error)) && <div key={activa}>{vistas[activa]}</div>}
        </div>
      </section>
    </div>
  )
}
