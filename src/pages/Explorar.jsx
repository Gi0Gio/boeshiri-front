import { useState } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import {
  perfiles,
  noticias,
  articulos,
  fotos,
  videos,
  canciones,
} from '../data/contenido'

const tabs = [
  { id: 'feed', label: 'Feed' },
  { id: 'perfiles', label: 'Perfiles' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'articulos', label: 'Artículos' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'video', label: 'Video' },
  { id: 'musica', label: 'Música' },
]

const chipColor = {
  Evento: 'bg-caribbean text-jungle',
  Noticia: 'bg-terracotta text-white',
  Convocatoria: 'bg-candy text-white',
}

/* Etiqueta decorada por tipo de item del feed */
const tipoBadge = {
  noticia: { label: 'Noticia', clase: 'bg-rainforest text-white' },
  articulo: { label: 'Artículo', clase: 'bg-tea text-jungle' },
  foto: { label: 'Foto', clase: 'bg-caribbean text-jungle' },
  video: { label: 'Video', clase: 'bg-terracotta text-white' },
  musica: { label: 'Música', clase: 'bg-candy text-white' },
}

function Badge({ tipo }) {
  const b = tipoBadge[tipo]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${b.clase}`}
    >
      <FrogIcon className="h-3 w-3" />
      {b.label}
    </span>
  )
}

function iniciales(nombre) {
  return nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
}

/* ── Feed (collage estilo Pinterest, todo mezclado) ─────────── */
function construirFeed() {
  const grupos = [
    fotos.map((d) => ({ tipo: 'foto', d })),
    noticias.map((d) => ({ tipo: 'noticia', d })),
    videos.map((d) => ({ tipo: 'video', d })),
    articulos.map((d) => ({ tipo: 'articulo', d })),
    canciones.map((d) => ({ tipo: 'musica', d })),
  ]
  const out = []
  const max = Math.max(...grupos.map((g) => g.length))
  for (let i = 0; i < max; i++) {
    for (const g of grupos) if (g[i]) out.push(g[i])
  }
  return out
}

function FeedFoto({ d }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl">
      <div
        className={`${d.alto ? 'aspect-[3/4]' : 'aspect-square'} w-full`}
        style={{ background: `linear-gradient(150deg, ${d.colores[0]}, ${d.colores[1]})` }}
      >
        <FrogIcon className="absolute bottom-3 right-3 h-16 w-16 text-white/15 transition-transform duration-500 group-hover:scale-110" />
      </div>
      <span className="absolute left-3 top-3">
        <Badge tipo="foto" />
      </span>
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-jungle/85 via-jungle/10 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">
          {d.titulo}
        </h3>
        <p className="text-xs uppercase tracking-[0.15em] text-tea/70">{d.autor}</p>
      </div>
    </article>
  )
}

function FeedVideo({ d }) {
  return (
    <article className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]">
      <div
        className="relative flex aspect-video items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${d.colores[0]}, ${d.colores[1]})` }}
      >
        <span className="absolute left-3 top-3">
          <Badge tipo="video" />
        </span>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 pl-1 text-xl text-jungle transition-transform duration-300 group-hover:scale-110">
          ▶
        </span>
        <span className="absolute bottom-3 right-3 rounded bg-jungle/80 px-2 py-0.5 font-display text-xs font-semibold text-tea">
          {d.duracion}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-jungle">
          {d.titulo}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-rainforest">{d.autor}</p>
      </div>
    </article>
  )
}

function FeedMusica({ d }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-jungle to-rainforest">
        <span className="absolute left-3 top-3 z-10">
          <Badge tipo="musica" />
        </span>
        {/* Disco / vinilo */}
        <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-jungle-deep/70 ring-1 ring-white/15 transition-transform duration-700 group-hover:rotate-45">
          <div className="absolute inset-3 rounded-full border border-white/10" />
          <div className="absolute inset-7 rounded-full border border-white/10" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-candy">
            <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-jungle">
          {d.titulo}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-rainforest">
          {d.artista} · {d.duracion}
        </p>
      </div>
    </article>
  )
}

function FeedNoticia({ d }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]">
      <div className="flex items-center justify-between gap-2">
        <Badge tipo="noticia" />
        <span className="text-xs font-medium uppercase tracking-wide text-jungle/50">{d.fecha}</span>
      </div>
      <span
        className={`mt-4 inline-block rounded-full px-3 py-0.5 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${chipColor[d.tipo] || 'bg-rainforest text-white'}`}
      >
        {d.tipo}
      </span>
      <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-jungle">
        {d.titulo}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-jungle/70">{d.resumen}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.15em] text-jungle/50">📍 {d.lugar}</p>
    </article>
  )
}

function FeedArticulo({ d }) {
  return (
    <article className="relative overflow-hidden rounded-2xl bg-jungle p-7 text-tea shadow-[0_4px_20px_rgba(0,37,32,0.14)] transition duration-300 hover:-translate-y-1">
      <FrogIcon className="pointer-events-none absolute -bottom-8 -right-6 h-40 w-40 text-white/5" />
      <div className="relative">
        <Badge tipo="articulo" />
        <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-caribbean">
          {d.categoria}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold uppercase tracking-wide text-cream">
          {d.titulo}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-tea/75">{d.resumen}</p>
        <div className="mt-5 flex items-center justify-between border-t border-tea/10 pt-4 text-xs uppercase tracking-[0.15em] text-tea/60">
          <span>Por {d.autor}</span>
          <span>{d.lectura}</span>
        </div>
      </div>
    </article>
  )
}

const feedRender = {
  foto: FeedFoto,
  video: FeedVideo,
  musica: FeedMusica,
  noticia: FeedNoticia,
  articulo: FeedArticulo,
}

function Feed() {
  const items = construirFeed()
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {items.map((item, i) => {
        const Card = feedRender[item.tipo]
        return (
          <Reveal key={`${item.tipo}-${i}`} delay={(i % 3) * 90} className="break-inside-avoid">
            <Card d={item.d} />
          </Reveal>
        )
      })}
    </div>
  )
}

/* ── Perfiles ───────────────────────────────────────────────── */
function Perfiles() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {perfiles.map((p, i) => (
        <Reveal
          as={Link}
          to={`/perfil/${p.slug}`}
          key={p.slug}
          delay={(i % 3) * 110}
          className="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
        >
          <div
            className="relative aspect-[4/3] overflow-hidden"
            style={{ background: `linear-gradient(150deg, ${p.colores[0]}, ${p.colores[1]})` }}
          >
            <FrogIcon className="absolute -bottom-8 -right-6 h-36 w-36 text-white/15 transition-transform duration-500 group-hover:scale-110" />
            <span className="absolute left-6 top-5 font-display text-6xl font-semibold text-white/90">
              {iniciales(p.nombre)}
            </span>
            {p.destacado && (
              <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-jungle">
                Fundador
              </span>
            )}
          </div>
          <div className="flex items-end justify-between p-6">
            <div>
              <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-jungle">
                {p.nombre}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-rainforest">
                {p.disciplina}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-jungle/60">{p.bio}</p>
            </div>
            <span className="font-display text-sm text-rainforest transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

/* ── Noticias ───────────────────────────────────────────────── */
function Noticias() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {noticias.map((n, i) => (
        <Reveal
          key={n.titulo}
          delay={(i % 2) * 120}
          className="flex flex-col rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
        >
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em] ${chipColor[n.tipo] || 'bg-rainforest text-white'}`}
            >
              {n.tipo}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-jungle/50">
              {n.fecha}
            </span>
          </div>
          <h3 className="mt-5 font-display text-2xl font-semibold uppercase tracking-wide text-jungle">
            {n.titulo}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-jungle/70">{n.resumen}</p>
          <div className="mt-6 flex items-center justify-between border-t border-rainforest/10 pt-4">
            <span className="text-xs uppercase tracking-[0.15em] text-jungle/50">📍 {n.lugar}</span>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest">
              Leer más →
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

/* ── Artículos ──────────────────────────────────────────────── */
function Articulos() {
  return (
    <div className="space-y-6">
      {articulos.map((a, i) => (
        <Reveal
          key={a.titulo}
          delay={i * 100}
          className="group grid gap-6 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)] md:grid-cols-[1fr_2fr] md:items-center"
        >
          <div
            className="relative hidden h-full min-h-[9rem] overflow-hidden rounded-xl md:block"
            style={{ background: 'linear-gradient(150deg, #00735e, #002420)' }}
          >
            <FrogIcon className="absolute -bottom-4 -right-2 h-24 w-24 text-white/15" />
            <span className="absolute left-4 top-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-caribbean">
              {a.categoria}
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.15em] text-jungle/50">
              <span className="font-display font-semibold text-rainforest md:hidden">
                {a.categoria}
              </span>
              <span>{a.fecha}</span>
              <span aria-hidden>·</span>
              <span>{a.lectura} de lectura</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold uppercase tracking-wide text-jungle transition-colors group-hover:text-rainforest">
              {a.titulo}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-jungle/70">{a.resumen}</p>
            <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest">
              Por {a.autor}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

/* ── Fotos (masonry) ────────────────────────────────────────── */
function Fotos() {
  return (
    <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
      {fotos.map((f, i) => (
        <Reveal
          key={f.titulo}
          delay={(i % 3) * 90}
          className="group relative block break-inside-avoid overflow-hidden rounded-2xl"
        >
          <div
            className={`${f.alto ? 'aspect-[3/4]' : 'aspect-square'} w-full`}
            style={{ background: `linear-gradient(150deg, ${f.colores[0]}, ${f.colores[1]})` }}
          >
            <FrogIcon className="absolute bottom-3 right-3 h-16 w-16 text-white/15 transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-jungle/80 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">
              {f.titulo}
            </h3>
            <p className="text-xs uppercase tracking-[0.15em] text-tea/70">Foto · {f.autor}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

/* ── Video ──────────────────────────────────────────────────── */
function Videos() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {videos.map((v, i) => (
        <Reveal
          key={v.titulo}
          delay={i * 110}
          className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
        >
          <div
            className="relative flex aspect-video items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(150deg, ${v.colores[0]}, ${v.colores[1]})` }}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 pl-1 text-2xl text-jungle transition-transform duration-300 group-hover:scale-110">
              ▶
            </span>
            <span className="absolute bottom-3 right-3 rounded bg-jungle/80 px-2 py-0.5 font-display text-xs font-semibold text-tea">
              {v.duracion}
            </span>
            <span className="absolute left-4 top-4 font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              {v.categoria}
            </span>
          </div>
          <div className="p-5">
            <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-jungle">
              {v.titulo}
            </h3>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-rainforest">{v.autor}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

/* ── Música ─────────────────────────────────────────────────── */
function Musica() {
  const [activa, setActiva] = useState(null)

  return (
    <div className="overflow-hidden rounded-2xl border border-rainforest/15 bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)]">
      {canciones.map((c, i) => {
        const sonando = activa === i
        return (
          <button
            type="button"
            key={c.titulo}
            onClick={() => setActiva(sonando ? null : i)}
            className={`flex w-full items-center gap-5 border-b border-rainforest/10 px-5 py-4 text-left transition-colors last:border-0 hover:bg-tea/30 ${sonando ? 'bg-tea/40' : ''}`}
          >
            <span
              className={`flex h-11 w-11 flex-none items-center justify-center rounded-full pl-0.5 text-sm transition ${sonando ? 'bg-caribbean text-jungle' : 'bg-jungle text-tea'}`}
            >
              {sonando ? '❚❚' : '▶'}
            </span>

            {/* Onda de audio decorativa */}
            <span className="hidden h-8 flex-none items-end gap-0.5 sm:flex" aria-hidden>
              {[9, 16, 24, 14, 28, 18, 10, 22, 13, 26, 12, 20].map((h, j) => (
                <span
                  key={j}
                  className={`w-0.5 rounded-full ${sonando ? 'bg-caribbean' : 'bg-rainforest/30'}`}
                  style={{ height: `${h}px` }}
                />
              ))}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-lg font-semibold uppercase tracking-wide text-jungle">
                {c.titulo}
              </span>
              <span className="block truncate text-xs uppercase tracking-[0.15em] text-rainforest">
                {c.artista} · {c.genero}
              </span>
            </span>

            <span className="flex-none font-display text-sm text-jungle/50">{c.duracion}</span>
          </button>
        )
      })}
    </div>
  )
}

const vistas = {
  feed: <Feed />,
  perfiles: <Perfiles />,
  noticias: <Noticias />,
  articulos: <Articulos />,
  fotos: <Fotos />,
  video: <Videos />,
  musica: <Musica />,
}

export default function Explorar() {
  const [activa, setActiva] = useState('feed')

  return (
    <div className="pt-16">
      {/* ── Barra de pestañas (sticky, justo bajo el navbar) ─── */}
      <div className="sticky top-16 z-30 border-b border-rainforest/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setActiva(t.id)}
              className={`flex-none rounded-full px-5 py-2 font-display text-sm font-semibold uppercase tracking-[0.15em] transition ${
                activa === t.id
                  ? 'bg-jungle text-tea'
                  : 'text-jungle/60 hover:bg-tea/50 hover:text-jungle'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido de la pestaña ──────────────────────────── */}
      <section className="min-h-[60vh] bg-cream py-12">
        <div className="mx-auto max-w-6xl px-5">
          {/* key fuerza el re-montaje → dispara los reveals al cambiar de pestaña */}
          <div key={activa}>{vistas[activa]}</div>

          <p className="mt-14 text-center text-xs italic text-jungle/40">
            Contenido de ejemplo — se conectará al gestor de publicaciones del colectivo.
          </p>
        </div>
      </section>
    </div>
  )
}
