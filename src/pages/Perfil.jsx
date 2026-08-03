import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { communityApi } from '../api/community'
import { useFetch } from '../hooks/useFetch'

const combos = [
  { id: 'jungla', nombre: 'Jungla', bg: '#002420', ink: '#f6fbef', accent: '#00e6bc', line: 'rgba(217,242,194,0.16)', circle: '#00e6bc', duoDark: '#002420', duoLight: '#d9f2c2' },
  { id: 'caribe', nombre: 'Caribe', bg: '#00110e', ink: '#f6fbef', accent: '#00e6bc', line: 'rgba(0,230,188,0.18)', circle: '#00e6bc', duoDark: '#00110e', duoLight: '#00e6bc' },
  { id: 'terracota', nombre: 'Terracota', bg: '#002420', ink: '#f6fbef', accent: '#d67a63', line: 'rgba(214,122,99,0.2)', circle: '#d67a63', duoDark: '#1f0f0a', duoLight: '#d67a63' },
  { id: 'candy', nombre: 'Candy', bg: '#002420', ink: '#f6fbef', accent: '#e60035', line: 'rgba(230,0,53,0.2)', circle: '#e60035', duoDark: '#1a0209', duoLight: '#e60035' },
  { id: 'te', nombre: 'Té', bg: '#f6fbef', ink: '#002420', accent: '#00735e', line: 'rgba(0,37,32,0.14)', circle: '#00735e', duoDark: '#002420', duoLight: '#00735e' },
]

const grain = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"
function hex01(h) { const n = h.replace('#', ''); const b = n.length === 3 ? n.split('').map((c) => c + c).join('') : n; return [0, 2, 4].map((i) => (parseInt(b.slice(i, i + 2), 16) / 255).toFixed(3)) }
function hexRgba(h, a) { const n = h.replace('#', ''); const b = n.length === 3 ? n.split('').map((c) => c + c).join('') : n; const [r, g, bl] = [0, 2, 4].map((i) => parseInt(b.slice(i, i + 2), 16)); return `rgba(${r},${g},${bl},${a})` }

const iconos = {
  instagram: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>),
  whatsapp: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.1-1.7 1.1-.5 0-.9.2-3-.9-2.5-1.3-4-3.9-4.1-4.1s-1-1.3-1-2.5.6-1.8.8-2 .5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.5l-.3.5c-.2.2-.3.3-.1.6s.6 1 1.3 1.6c.9.8 1.6 1 1.9 1.2s.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.5.3s.1.7-.1 1.3z" /></svg>),
  discord: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M19.5 5.6A16 16 0 0 0 15.6 4l-.2.4a12 12 0 0 1 3.4 1.7 12 12 0 0 0-10.5 0A12 12 0 0 1 11.7 4.4L11.5 4a16 16 0 0 0-3.9 1.6C5 9.4 4.3 13 4.6 16.6a16 16 0 0 0 4.8 2.4l.6-1a10 10 0 0 1-1.6-.8l.4-.3a11 11 0 0 0 9.4 0l.4.3a10 10 0 0 1-1.7.8l.6 1a16 16 0 0 0 4.9-2.4c.3-4.3-.6-7.9-2.9-11z" /></svg>),
  tiktok: (<svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M16 3c.3 2 1.6 3.6 3.5 4v2.7c-1.3 0-2.5-.4-3.5-1.1v5.7A5.3 5.3 0 1 1 10.7 9v2.8a2.6 2.6 0 1 0 2.6 2.5V3H16z" /></svg>),
  mail: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>),
  web: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" /></svg>),
}
const marcas = {
  instagram: { background: 'linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)', color: '#fff' },
  whatsapp: { background: '#25D366', color: '#fff' }, discord: { background: '#5865F2', color: '#fff' },
  tiktok: { background: '#010101', color: '#fff' }, mail: { background: '#EA4335', color: '#fff' }, web: { background: '#00735e', color: '#fff' },
}
const iconKey = (type) => String(type).toLowerCase()

/** Rango si lo hay (servicios), precio si no, y "a convenir" cuando vale 0. */
const precioAnuncio = (a) =>
  a.priceMax != null && a.priceMax > a.price ? `$${a.price} – $${a.priceMax}` : a.price > 0 ? `$${a.price}` : 'A convenir'

const proceso = [
  { t: 'Investigar', d: 'Entender el símbolo, su origen y su contexto.' },
  { t: 'Explorar', d: 'Bocetar direcciones. Preguntar. Refinar.' },
  { t: 'Crear', d: 'Construir con intención y con raíz.' },
  { t: 'Sembrar', d: 'Llevarlo al presente con orgullo.' },
]
const tabsPerfil = [
  { id: 'introduccion', label: 'Intro' }, { id: 'obra', label: 'Obra' },
  { id: 'habilidades', label: 'Habilidades' }, { id: 'publicaciones', label: 'Publicaciones' }, { id: 'contacto', label: 'Contacto' },
]

function Retrato({ filtro }) {
  return (
    <svg viewBox="0 0 300 380" className="h-full w-full" style={{ filter: `url(#${filtro})` }} preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="piel" cx="44%" cy="36%" r="62%"><stop offset="0%" stopColor="#ededed" /><stop offset="58%" stopColor="#a2a2a2" /><stop offset="100%" stopColor="#4a4a4a" /></radialGradient>
        <linearGradient id="pelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2b2b2b" /><stop offset="100%" stopColor="#585858" /></linearGradient>
      </defs>
      <path d="M34,380 C34,298 88,264 150,264 C212,264 266,298 266,380 Z" fill="#5a5a5a" />
      <rect x="123" y="222" width="54" height="62" fill="#8a8a8a" />
      <ellipse cx="150" cy="158" rx="80" ry="96" fill="url(#piel)" />
      <path d="M70,158 C70,78 104,50 150,50 C196,50 230,78 230,158 C230,120 202,102 150,102 C98,102 70,120 70,158 Z" fill="url(#pelo)" />
    </svg>
  )
}
function Head({ num, accent, muted, children }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.25em]" style={{ color: accent }}>{children}</h2>
      <span className="font-mono text-[0.7rem] tracking-wide" style={muted}>{num}</span>
    </div>
  )
}

export default function Perfil() {
  const { slug } = useParams()
  const { data: perfil, loading, error } = useFetch(() => communityApi.get(slug), [slug])
  const [comboId, setComboId] = useState('jungla')
  const [activa, setActiva] = useState('introduccion')
  const c = combos.find((x) => x.id === comboId)

  useEffect(() => {
    if (!perfil) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiva(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    tabsPerfil.forEach((t) => { const el = document.getElementById(t.id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [perfil])

  if (loading) return <section className="flex min-h-screen items-center justify-center bg-jungle pt-16 text-tea/60">Cargando perfil…</section>
  if (error || !perfil) {
    return (
      <section className="bg-dorace-pattern flex min-h-screen items-center justify-center bg-jungle pt-16 text-center text-tea">
        <div className="px-6">
          <FrogIcon className="mx-auto h-20 w-20 text-caribbean" />
          <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide text-cream">Perfil no disponible</h1>
          <Link to="/comunidad" className="mt-8 inline-block rounded-full border border-caribbean px-6 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-caribbean transition hover:bg-caribbean hover:text-jungle">Volver a Comunidad</Link>
        </div>
      </section>
    )
  }

  const d = hex01(c.duoDark), l = hex01(c.duoLight)
  const filtroId = `duo-${c.id}`
  const muted = { color: c.ink, opacity: 0.6 }
  const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const roles = perfil.roles ?? []
  const rango = roles.find((r) => r !== 'Miembro') ?? 'Miembro'
  const intro = perfil.intro || perfil.bio
  const idCode = `BI/2026/${String(perfil.id).replace(/-/g, '').slice(-2).toUpperCase()}`
  const articulos = (perfil.gallery ?? []).filter((g) => g.type === 'Article')
  // La API solo devuelve anuncios si está dado de alta como vendedor.
  const tieneAnuncios = (perfil.marketplace ?? []).length > 0
  const contactos = [
    ...(perfil.email ? [{ red: 'mail', valor: perfil.email }] : []),
    ...(perfil.phone ? [{ red: 'whatsapp', valor: perfil.phone }] : []),
    ...(perfil.socialLinks ?? []).map((s) => ({ red: iconKey(s.type), valor: s.value })),
  ]

  return (
    <div className="perfil-tema relative min-h-screen pt-16" style={{ backgroundColor: c.bg, color: c.ink, '--acc': c.accent, '--line': c.line }}>
      {/* Fondo: patrón diagonal + grano + marca de agua */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url("${grain}")`, opacity: 0.08, mixBlendMode: 'overlay' }} />
        <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${c.ink} 0, ${c.ink} 1px, transparent 1px, transparent 7px)`, opacity: 0.05 }} />
        <FrogIcon className="absolute -bottom-24 -right-20 h-[32rem] w-[32rem]" style={{ color: c.ink, opacity: 0.04 }} />
      </div>
      {['left-4 top-20', 'right-4 top-20', 'left-4 bottom-6', 'right-4 bottom-6'].map((pos, i) => (
        <span key={i} className={`pointer-events-none fixed ${pos} z-20 font-mono text-sm`} style={{ color: c.ink, opacity: 0.35 }}>+</span>
      ))}

      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id={filtroId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0" />
            <feComponentTransfer><feFuncR type="table" tableValues={`${d[0]} ${l[0]}`} /><feFuncG type="table" tableValues={`${d[1]} ${l[1]}`} /><feFuncB type="table" tableValues={`${d[2]} ${l[2]}`} /></feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Tabs */}
      <div className="sticky top-16 z-30 border-b backdrop-blur" style={{ borderColor: c.line, backgroundColor: hexRgba(c.bg, 0.85) }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2.5">
          <Link to="/comunidad" className="flex-none font-mono text-sm font-semibold" style={{ color: c.accent }} title="Volver a Comunidad">←</Link>
          <nav className="flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabsPerfil.map((t) => (
              <button key={t.id} onClick={() => irA(t.id)} className="flex-none rounded-full px-4 py-1.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.1em] transition" style={activa === t.id ? { backgroundColor: c.accent, color: c.bg } : { color: c.ink, opacity: 0.55 }}>{t.label}</button>
            ))}
          </nav>
          <div className="flex flex-none items-center gap-2">
            {combos.map((cb) => (
              <button key={cb.id} onClick={() => setComboId(cb.id)} aria-label={cb.nombre} title={cb.nombre} className="h-5 w-5 rounded-full" style={{ backgroundColor: cb.accent, outline: cb.id === comboId ? `2px solid ${c.ink}` : '2px solid transparent', outlineOffset: 2 }} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        {/* Hero */}
        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="text-center lg:text-left">
            <Reveal>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em]" style={muted}>ID·{idCode}{perfil.location ? ` · ${perfil.location}` : ''}</p>
              <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: c.accent }}>{[perfil.discipline, rango].filter(Boolean).join(' · ')}</p>
              {perfil.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {perfil.tags.map((e) => (<span key={e} className="rounded-full border px-3 py-1 font-display text-[0.7rem] font-semibold uppercase tracking-[0.12em]" style={{ borderColor: c.line }}>{e}</span>))}
                </div>
              )}
            </Reveal>
            <h1 className="mt-4 font-display text-6xl font-semibold uppercase leading-[0.9] tracking-tight sm:text-7xl md:text-8xl">
              {perfil.fullName.split(' ').map((w, i) => (<Reveal as="span" key={i} delay={160 + i * 120} className="block">{w}</Reveal>))}
            </h1>
            {perfil.bio && <Reveal delay={520}><p className="mx-auto mt-6 max-w-md text-lg leading-relaxed lg:mx-0" style={muted}>{perfil.bio}</p></Reveal>}
            <Reveal delay={620}>
              <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                <span className="rounded-full px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em]" style={{ backgroundColor: c.accent, color: c.bg }}>{rango}</span>
                {perfil.location && <span className="rounded-full border px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em]" style={{ borderColor: c.line }}>📍 {perfil.location}</span>}
              </div>
            </Reveal>
          </div>
          <Reveal delay={320} className="relative mx-auto aspect-square w-full max-w-sm">
            <div className="absolute inset-6 rounded-full" style={{ backgroundColor: c.circle }} />
            <div className="absolute inset-0 flex items-end justify-center">
              <div className="relative h-[92%] w-[82%] overflow-hidden">
                {perfil.photoUrl ? <img src={perfil.photoUrl} alt={perfil.fullName} className="h-full w-full rounded-2xl object-cover" /> : <Retrato filtro={filtroId} />}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Introducción */}
        <Reveal as="section" id="introduccion" className="mt-16 scroll-mt-32 border-t pt-10" style={{ borderColor: c.line }}>
          <Head num="01 / 05" accent={c.accent} muted={muted}>Introducción</Head>
          {intro ? <p className="max-w-3xl text-xl leading-relaxed">{intro}</p> : <p style={muted}>Aún sin introducción.</p>}
        </Reveal>

        {/* Obra + Proceso */}
        <Reveal as="section" id="obra" className="mt-16 grid scroll-mt-32 gap-10 border-t pt-10 lg:grid-cols-[1.5fr_1fr]" style={{ borderColor: c.line }}>
          <div>
            <Head num="02 / 05" accent={c.accent} muted={muted}>Obra seleccionada</Head>
            {perfil.gallery?.length > 0 ? (
              <div className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
                {perfil.gallery.slice(0, 6).map((o, i) => (
                  <div key={o.id} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[auto_9rem_1fr_auto]">
                    <span className="font-display text-4xl font-semibold tabular-nums sm:text-5xl" style={{ color: c.accent }}>{String(i + 1).padStart(2, '0')}</span>
                    <div className="relative hidden aspect-video overflow-hidden rounded-lg sm:block" style={{ background: `linear-gradient(150deg, ${c.duoDark}, ${c.accent})` }}>
                      {o.coverImage && <img src={o.coverImage} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold uppercase tracking-wide transition-colors group-hover:text-[color:var(--acc)]">{o.title}</h3>
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em]" style={muted}>{o.type}</p>
                    </div>
                    <span className="font-display text-xl transition-transform group-hover:translate-x-1" style={{ color: c.accent }}>↗</span>
                  </div>
                ))}
              </div>
            ) : <p style={muted}>Aún no hay obra publicada.</p>}
          </div>
          <div>
            <p className="mb-6 font-display text-sm font-semibold uppercase tracking-[0.25em]" style={{ color: c.accent }}>Proceso</p>
            <div className="divide-y" style={{ borderColor: c.line }}>
              {proceso.map((p, i) => (
                <div key={p.t} className="flex gap-4 py-4" style={{ borderColor: c.line }}>
                  <FrogIcon className="h-7 w-7 flex-none" style={{ color: c.accent }} />
                  <div>
                    <h3 className="font-display text-base font-semibold uppercase tracking-wide"><span className="font-mono" style={muted}>{String(i + 1).padStart(2, '0')}</span> {p.t}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed" style={muted}>{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Habilidades + frase */}
        <Reveal as="section" id="habilidades" className="mt-16 grid scroll-mt-32 gap-8 border-t pt-10 lg:grid-cols-[1.4fr_1fr]" style={{ borderColor: c.line }}>
          <div>
            <Head num="03 / 05" accent={c.accent} muted={muted}>Habilidades</Head>
            {perfil.skills?.length > 0 ? (
              <div className="mx-auto w-fit lg:mx-0">
                <div className="space-y-2.5">
                  {perfil.skills.map((sk) => (
                    <div key={sk.name} className="flex items-center gap-3">
                      <span className="w-36 flex-none font-mono text-[0.7rem] uppercase tracking-[0.05em]" style={muted}>{sk.name}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <span key={i} className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: i < sk.level ? c.accent : 'transparent', border: `1px solid ${c.line}` }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex w-full max-w-xs justify-between pl-36 font-mono text-[0.65rem] uppercase tracking-[0.12em]" style={muted}><span>Básico</span><span>Experto</span></div>
              </div>
            ) : <p style={muted}>Aún sin habilidades listadas.</p>}
          </div>
          {perfil.bio && (
            <div className="flex flex-col justify-center gap-4 text-center lg:text-left">
              <blockquote className="font-display text-2xl font-semibold uppercase leading-tight md:text-3xl"><span style={{ color: c.accent }}>“</span>{perfil.bio}<span style={{ color: c.accent }}>”</span></blockquote>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.15em]" style={muted}>— {perfil.fullName}</p>
            </div>
          )}
        </Reveal>

        {/* 04 · Sus anuncios si vende; si no, sus publicaciones. La galería ya sale
            en «Obra seleccionada», así que repetirla aquí no aportaba nada nuevo;
            los anuncios, en cambio, no aparecen en ningún otro punto del perfil. */}
        {tieneAnuncios ? (
          <Reveal as="section" id="marketplace" className="mt-16 scroll-mt-32 border-t pt-10" style={{ borderColor: c.line }}>
            <Head num="04 / 05" accent={c.accent} muted={muted}>En el marketplace</Head>

            {/* auto-fill: el viewport decide cuántas caben, sin fijar el número de columnas. */}
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))' }}>
              {perfil.marketplace.map((a) => (
                <Link
                  key={a.id}
                  to={`/marketplace/${a.id}`}
                  className="group block overflow-hidden rounded-xl transition hover:-translate-y-1"
                  style={{ backgroundColor: hexRgba(c.ink, 0.05) }}
                >
                  <div className="aspect-square overflow-hidden" style={{ background: `linear-gradient(150deg, ${c.duoDark}, ${c.accent})` }}>
                    {a.coverImage && <img src={a.coverImage} alt={a.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm font-semibold uppercase leading-snug tracking-wide">{a.name}</p>
                    <p className="mt-1 font-mono text-xs" style={muted}>
                      {a.kind === 'Service' ? 'Servicio' : 'Producto'} · {precioAnuncio(a)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to={`/marketplace?vendedor=${perfil.id}`}
              className="mt-6 inline-block font-mono text-xs font-semibold uppercase tracking-[0.15em] transition hover:opacity-70"
              style={{ color: c.accent }}
            >
              Ver todos los productos de {perfil.fullName.split(' ')[0]} →
            </Link>
          </Reveal>
        ) : (
        <Reveal as="section" id="publicaciones" className="mt-16 scroll-mt-32 border-t pt-10" style={{ borderColor: c.line }}>
          <Head num="04 / 05" accent={c.accent} muted={muted}>Últimas publicaciones</Head>
          {perfil.gallery?.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {perfil.gallery.slice(0, 6).map((o) => (
                  <div key={o.id} className="group relative aspect-square overflow-hidden rounded-xl" style={{ background: `linear-gradient(150deg, ${c.duoDark}, ${c.accent})` }}>
                    {o.coverImage && <img src={o.coverImage} alt={o.title} className="h-full w-full object-cover" />}
                    <div className="absolute inset-0 flex items-end p-3 opacity-0 transition group-hover:opacity-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                      <span className="font-display text-xs font-semibold uppercase tracking-wide text-white">{o.title}</span>
                    </div>
                  </div>
                ))}
              </div>
              {articulos.length > 0 && (
                <div>
                  <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em]" style={muted}>Artículos</p>
                  <div className="mt-3 divide-y" style={{ borderColor: c.line }}>
                    {articulos.slice(0, 5).map((a) => (
                      <div key={a.id} className="py-3" style={{ borderColor: c.line }}>
                        <h4 className="font-display text-sm font-semibold uppercase leading-snug tracking-wide">{a.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : <p style={muted}>Aún no hay publicaciones.</p>}
        </Reveal>
        )}

        {/* Contacto */}
        <Reveal as="section" id="contacto" className="mt-16 scroll-mt-32 border-t pt-10 text-center lg:text-left" style={{ borderColor: c.line }}>
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em]" style={muted}>05 / 05 · Contacto</p>
          <h2 className="mt-2 font-display text-5xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">Creemos<br />algo real.</h2>
          {contactos.length > 0 ? (
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              {contactos.map((ct, i) => (
                <span key={i} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.05em]" style={marcas[ct.red] ?? marcas.web}>{iconos[ct.red] ?? iconos.web}<span>{ct.valor}</span></span>
              ))}
            </div>
          ) : <p className="mt-6" style={muted}>Este miembro no ha publicado datos de contacto.</p>}
          <div className="mt-8"><Link to="/contacto" className="inline-block rounded-full px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] hover:-translate-y-0.5" style={{ backgroundColor: c.accent, color: c.bg }}>Trabajemos juntos ↗</Link></div>
        </Reveal>
      </div>
    </div>
  )
}
