import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import Mural from '../components/Mural'
import { GritoPieza, GritoVelado, GritoForm } from '../components/Gritos'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/ConfirmDialog'
import { useSession } from '../auth/SessionContext'
import { publicationsApi } from '../api/publications'
import { marketplaceApi } from '../api/marketplace'
import { gritosApi } from '../api/gritos'
import { useFetch } from '../hooks/useFetch'
import { gradientFor } from '../utils/gradient'
import { useSeo } from '../hooks/useSeo'

/**
 * Un solo nivel de navegación: las pestañas. «Mural» lo junta todo y las demás
 * enseñan una sola cosa. El Mural no lleva filtros propios; dos sistemas de
 * filtro con los mismos nombres obligaban a aprender cuál hacía qué.
 *
 * Los perfiles no son una pestaña: viven en /comunidad, que está en el menú. Una
 * segunda vista de la comunidad aquí, con otra tarjeta, partía la gente en dos.
 */
const tabs = [
  { id: 'mural', label: 'Mural' },
  { id: 'gritos', label: 'Gritos' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'articulos', label: 'Artículos' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'video', label: 'Video' },
  { id: 'musica', label: 'Música' },
]

/* Metadatos por tipo del API (PublicationType) */
const META = {
  News: { key: 'noticia', label: 'Noticia', clase: 'bg-terracotta text-jungle' },
  Article: { key: 'articulo', label: 'Artículo', clase: 'bg-tea text-jungle' },
  Photo: { key: 'foto', label: 'Foto', clase: 'bg-caribbean text-jungle' },
  Video: { key: 'video', label: 'Video', clase: 'bg-terracotta text-jungle' },
  Music: { key: 'musica', label: 'Música', clase: 'bg-candy text-white' },
}

const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Etiqueta del tipo. La PRIMERA etiqueta de la publicación se muestra al lado
 * como subcategoría: "Artículo · Poesía" dice mucho más que "Artículo" a secas,
 * y aprovecha algo que quien publica ya escribe.
 */
function Badge({ type, tags }) {
  const m = META[type]
  if (!m) return null
  const sub = tags?.[0]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-semibold uppercase tracking-[0.18em] ${m.clase}`}>
      <FrogIcon className="h-3 w-3" />
      {m.label}
      {sub && <span className="opacity-65">· {sub}</span>}
    </span>
  )
}

/** "5 min de lectura". No se pinta si no hay texto (foto, video, música). */
function Lectura({ minutos, className = '' }) {
  if (!minutos) return null
  return <span className={className}>{minutos} min de lectura</span>
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
        <span key={t} className="rounded-full bg-rainforest/10 px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide text-rainforest">#{t}</span>
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
      <span className="absolute left-3 top-3"><Badge type={p.type} tags={p.tags} /></span>
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
          <Badge type={p.type} tags={p.tags} />
          <span className={`text-xs font-medium uppercase tracking-wide ${dark ? 'text-tea/70' : 'text-jungle/70'}`}>{fmtFecha(p.createdAt)}</span>
        </div>
        <h3 className={`mt-4 font-display text-xl font-semibold uppercase tracking-wide ${dark ? 'text-cream' : 'text-jungle transition-colors group-hover:text-rainforest'}`}>{p.title}</h3>
        <Tags tags={p.tags} />
        <p className={`mt-5 font-display text-xs font-semibold uppercase tracking-[0.2em] ${dark ? 'text-caribbean' : 'text-rainforest'}`}>
          Por {p.authorName} · Leer más →
        </p>
        <Lectura minutos={p.readingMinutes} className={`mt-1 block font-mono text-xs ${dark ? 'text-tea/70' : 'text-jungle/70'}`} />
      </div>
    </Link>
  )
}

function Vacio({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-rainforest/25 bg-white/50 py-16 text-center">
      <FrogIcon className="mx-auto h-14 w-14 text-rainforest/40" />
      <p className="mt-4 font-display text-sm uppercase tracking-[0.15em] text-jungle/70">{children}</p>
    </div>
  )
}

/* ── Vistas de una sola familia ─────────────────────────────── */
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
          <span className="flex-none font-display text-sm text-jungle/70">{fmtFecha(p.createdAt)}</span>
        </Link>
      ))}
    </div>
  )
}

/** La sección de gritos: aquí sí van con botones, descripción y gestión. */
function SeccionGritos({ gritos, velados, sesion, puedeGritar, ocupado, onEchar, acciones }) {
  if (!sesion) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-dashed border-candy/40 bg-white/60 p-6">
          <p className="font-display text-lg font-semibold uppercase tracking-wide text-jungle">
            Los gritos son entre miembros
          </p>
          <p className="mt-2 max-w-prose text-sm text-jungle/70">
            Un grito es un plan abierto que lanza un miembro: «el sábado pintamos un mural, faltan
            tres». Lleva lugar, hora y a veces una cuota, por eso solo se ve con sesión
            iniciada. {velados > 0 && `Ahora mismo hay ${velados} abierto${velados === 1 ? '' : 's'}.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/login" className="rounded-full bg-jungle px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tea transition hover:bg-jungle-deep">
              Iniciar sesión
            </Link>
            <Link to="/postularme" className="rounded-full border border-rainforest/30 px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-jungle transition hover:bg-white">
              Quiero ser parte
            </Link>
          </div>
        </div>
        {velados > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: Math.min(velados, 3) }, (_, i) => (
              <div key={i} className="min-h-[190px]"><GritoVelado /></div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-prose text-sm text-jungle/70">
          Llamados abiertos de la gente del colectivo. Se apagan solos cuando se llenan o cuando
          pasa la fecha.
        </p>
        {puedeGritar && (
          <button
            type="button"
            onClick={onEchar}
            className="rounded-full bg-candy px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#c30030]"
          >
            Echa un grito
          </button>
        )}
      </div>

      {!gritos.length ? (
        <Vacio>Ahora mismo no hay gritos abiertos</Vacio>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {gritos.map((g, i) => (
            <Reveal key={g.id} delay={(i % 2) * 100}>
              <GritoPieza
                grito={g}
                ocupado={ocupado === g.id}
                onApuntarme={() => acciones.apuntarme(g)}
                onSalirme={() => acciones.salirme(g)}
                onCerrar={() => acciones.cerrar(g)}
                onCancelar={() => acciones.cancelar(g)}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Explorar() {
  useSeo({
    titulo: 'Explorar',
    descripcion: 'El mural del colectivo Boesh Irí: noticias, artículos, fotografía, música, video, gritos y el mercado de sus miembros.',
  })

  const [activa, setActiva] = useState('mural')
  const { user, hasPermission } = useSession()
  const toast = useToast()
  const confirmar = useConfirm()

  const { data, loading, error } = useFetch(() => publicationsApi.list())
  // Memorizadas para que la composición del mural no se rehaga en cada render:
  // `data ?? []` devolvería un arreglo nuevo cada vez y tiraría abajo el useMemo.
  const pubs = useMemo(() => data ?? [], [data])
  const por = (t) => pubs.filter((p) => p.type === t)

  // El mercado entra al mural, pero sus piezas llevan a /marketplace: el mural es
  // una ventana al mercado, no una segunda puerta que haya que mantener aparte.
  const { data: datosMercado } = useFetch(() => marketplaceApi.list().catch(() => []))
  const productos = useMemo(() => datosMercado ?? [], [datosMercado])

  /* ── Gritos ─────────────────────────────────────────────── */
  const [gritos, setGritos] = useState([])
  const [velados, setVelados] = useState(0)
  const [ocupado, setOcupado] = useState(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const puedeGritar = !!user && hasPermission('gritos.publicar')

  const cargarGritos = useCallback(async () => {
    if (user) {
      try {
        setGritos(await gritosApi.list())
      } catch {
        // Que falle el módulo más nuevo no debería vaciar el resto de la pared.
        setGritos([])
      }
      return
    }
    try {
      const resumen = await gritosApi.summary()
      setVelados(resumen?.open ?? 0)
    } catch {
      setVelados(0)
    }
  }, [user])

  useEffect(() => {
    cargarGritos()
  }, [cargarGritos])

  const conAviso = async (id, fn, exito) => {
    setOcupado(id)
    try {
      await fn()
      toast.success(exito)
      await cargarGritos()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setOcupado(null)
    }
  }

  const acciones = {
    apuntarme: (g) => conAviso(g.id, () => gritosApi.apuntarme(g.id), 'Te apuntaste. Nos vemos allá.'),
    salirme: (g) => conAviso(g.id, () => gritosApi.salirme(g.id), 'Listo, soltaste tu cupo.'),
    cerrar: (g) => conAviso(g.id, () => gritosApi.changeStatus(g.id, 'Close'), 'Grito cerrado.'),
    cancelar: async (g) => {
      const acompañan = g.taken - 1
      const ok = await confirmar({
        message:
          acompañan > 0
            ? `¿Cancelar «${g.title}»? Se le avisará a ${acompañan} persona${acompañan === 1 ? '' : 's'} que iba${acompañan === 1 ? '' : 'n'} contigo.`
            : `¿Cancelar «${g.title}»? Todavía no se ha apuntado nadie.`,
        danger: true,
      })
      if (!ok) return
      return conAviso(g.id, () => gritosApi.changeStatus(g.id, 'Cancel'), 'Grito cancelado.')
    },
  }

  const crearGrito = async (datos) => {
    setEnviando(true)
    try {
      await gritosApi.create(datos)
      toast.success('Tu grito ya está en la pared.')
      setFormAbierto(false)
      await cargarGritos()
      setActiva('gritos')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const vistas = {
    mural: (
      <Mural
        publicaciones={pubs}
        productos={productos}
        gritos={gritos}
        gritosVelados={velados}
        puedeGritar={puedeGritar}
        onEchar={() => setFormAbierto(true)}
        onVerGritos={() => setActiva('gritos')}
      />
    ),
    gritos: (
      <SeccionGritos
        gritos={gritos}
        velados={velados}
        sesion={!!user}
        puedeGritar={puedeGritar}
        ocupado={ocupado}
        onEchar={() => setFormAbierto(true)}
        acciones={acciones}
      />
    ),
    noticias: <GridTexto pubs={por('News')} vacio="Aún no hay noticias" />,
    articulos: <GridTexto pubs={por('Article')} vacio="Aún no hay artículos" />,
    fotos: <GridVisual pubs={por('Photo')} vacio="Aún no hay fotos" aspect="aspect-[3/4]" />,
    video: <GridVisual pubs={por('Video')} vacio="Aún no hay videos" aspect="aspect-video" cols="md:grid-cols-3" />,
    musica: <Musica pubs={por('Music')} />,
  }

  // Los gritos traen sus propios datos: no dependen de las publicaciones.
  const propia = activa === 'gritos'

  return (
    <div className="pt-16">
      {/* Cabecera breve, no un hero: quien llega aquí viene a ver contenido, y
          basta con decir qué es esta pared antes de las pestañas. */}
      <header className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 pb-2 pt-10">
          <h1 className="font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">Explorar</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-jungle/75">
            El Mural es la pared del colectivo: noticias, artículos, fotos, video, música, gritos y
            mercado, todo junto. Las pestañas muestran una sola cosa.
          </p>
        </div>
      </header>

      <div className="sticky top-16 z-30 border-b border-rainforest/10 bg-cream/95 backdrop-blur">
        {/* El degradado del borde derecho avisa de que hay más pestañas al deslizar;
            sin él, «ARTÍ…» cortado se lee como un error y no como una fila que sigue. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-cream to-transparent lg:hidden" aria-hidden="true" />
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 pr-12 [scrollbar-width:none] lg:pr-5 [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <button type="button" key={t.id} onClick={() => setActiva(t.id)}
              className={`min-h-11 flex-none rounded-full px-5 py-2 font-display text-sm font-semibold uppercase tracking-[0.15em] transition ${activa === t.id ? 'bg-jungle text-tea' : 'text-jungle/70 hover:bg-tea/50 hover:text-jungle'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className="min-h-[60vh] bg-cream py-12">
        <div className="mx-auto max-w-6xl px-5">
          {!propia && loading && <p className="text-center text-jungle/70">Cargando…</p>}
          {!propia && error && <Vacio>No se pudo cargar el contenido</Vacio>}
          {(propia || (!loading && !error)) && <div key={activa}>{vistas[activa]}</div>}
        </div>
      </section>

      {formAbierto && (
        <GritoForm onEnviar={crearGrito} onCerrar={() => setFormAbierto(false)} enviando={enviando} />
      )}
    </div>
  )
}
