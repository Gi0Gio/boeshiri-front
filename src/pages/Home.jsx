import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { pilares, colaboradores } from '../data/contenido'
import { publicationsApi } from '../api/publications'
import { communityApi } from '../api/community'
import { useFetch } from '../hooks/useFetch'
import { useSession } from '../auth/SessionContext'
import { useSeo } from '../hooks/useSeo'
import { gradientFor } from '../utils/gradient'

const TIPO = {
  News: { label: 'Noticia', clase: 'bg-terracotta text-jungle' },
  Article: { label: 'Artículo', clase: 'bg-rainforest text-white' },
  Photo: { label: 'Foto', clase: 'bg-caribbean text-jungle' },
  Video: { label: 'Video', clase: 'bg-terracotta text-jungle' },
  Music: { label: 'Música', clase: 'bg-candy text-white' },
}
const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })

/** Rostros del hero: los primeros N con foto, en un orden que cambia por visita. */
const ROSTROS = 6

/** Marca de la última visita al inicio, para resaltar lo publicado desde entonces. */
const VISTO_KEY = 'boeshiri-inicio-visto'

export default function Home() {
  useSeo({
    titulo: 'Colectivo cultural de Chiriquí',
    descripcion: 'Boesh Irí es un colectivo cultural de Chiriquí, Panamá: artistas, diseñadores y mentes alternativas resignificando los símbolos de nuestras raíces.',
  })

  const { user, loading: cargandoSesion } = useSession()
  const { data: pubs } = useFetch(() => publicationsApi.list())
  const recientes = (pubs ?? []).slice(0, 3)

  // La portada enseña a la gente que hace el colectivo, no solo lo cuenta.
  // Se barajan una vez por visita para que nadie quede siempre en primera fila.
  const { data: miembros } = useFetch(() => communityApi.list().catch(() => []))
  const totalMiembros = miembros?.length ?? 0
  const rostros = useMemo(() => {
    const conFoto = (miembros ?? []).filter((m) => m.photoUrl)
    return conFoto
      .map((m) => ({ m, orden: Math.random() }))
      .sort((a, b) => a.orden - b.orden)
      .slice(0, ROSTROS)
      .map(({ m }) => m)
  }, [miembros])

  // Se lee UNA vez al montar: si se leyera en cada render, al guardar la visita
  // actual abajo las novedades dejarían de marcarse en el acto.
  const [ultimaVisita] = useState(() => localStorage.getItem(VISTO_KEY))
  useEffect(() => {
    if (user) localStorage.setItem(VISTO_KEY, new Date().toISOString())
  }, [user])

  // En la primera visita no hay marca: no se inventa que todo es nuevo.
  const esNueva = (pub) => Boolean(ultimaVisita) && new Date(pub.createdAt) > new Date(ultimaVisita)
  const nuevas = recientes.filter(esNueva).length

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-dorace-pattern relative flex items-center overflow-hidden bg-jungle pt-16 lg:min-h-screen">
        {/* Resplandor ambiental (gradientes radiales: mismo efecto que blur() pero sin costo de GPU) */}
        <div className="pointer-events-none absolute -left-40 top-1/4 h-[44rem] w-[44rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-[36rem] w-[36rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.14),transparent_70%)]" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-20 md:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Reveal>
              <p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">
                {user ? `Hola, ${user.fullName.split(' ')[0]} · Bienvenido de vuelta` : 'Colectivo cultural · Chiriquí, Panamá'}
              </p>
            </Reveal>
            <Reveal delay={140}>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-7xl">
                El puente <span className="text-caribbean">vivo</span> hacia nuestra historia
              </h1>
            </Reveal>
            <Reveal delay={280}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-tea/85">
                Somos Boesh Irí: artistas, diseñadores y mentes alternativas que desempolvamos el
                pasado para crear cultura con intención. No somos un museo frío — somos comunidad.
              </p>
            </Reveal>
            {/* Acciones: con sesión llevan al panel; sin ella, invitan a entrar (igual que el Navbar). */}
            <Reveal delay={420}>
              <div className="mt-10 flex flex-wrap gap-4">
                {cargandoSesion ? null : user ? (
                  <>
                    <Link
                      to="/panel"
                      className="rounded-full bg-caribbean px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,230,188,0.35)]"
                    >
                      Ir a mi panel
                    </Link>
                    <Link
                      to="/explorar"
                      className="rounded-full border border-tea/40 px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-tea transition hover:border-caribbean hover:text-caribbean"
                    >
                      Explorar el colectivo
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/explorar"
                      className="rounded-full bg-caribbean px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,230,188,0.35)]"
                    >
                      Explorar el colectivo
                    </Link>
                    <Link
                      to="/postularme"
                      className="rounded-full border border-tea/40 px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-tea transition hover:border-caribbean hover:text-caribbean"
                    >
                      Quiero ser parte
                    </Link>
                  </>
                )}
              </div>
            </Reveal>

            {/* En móvil el mosaico no cabe: la gente aparece como una fila de caras
                que lleva a Comunidad. */}
            {rostros.length > 0 && (
              <Reveal delay={500} className="lg:hidden">
                <Link to="/comunidad" className="mt-10 flex min-h-11 items-center gap-4">
                  <span className="flex -space-x-3">
                    {rostros.slice(0, 4).map((m) => (
                      <img key={m.id} src={m.photoUrl} alt="" className="h-11 w-11 rounded-full border-2 border-jungle object-cover" />
                    ))}
                  </span>
                  <span className="text-sm text-tea/85 underline decoration-caribbean/40 underline-offset-4">
                    {totalMiembros} personas hacen Boesh Irí
                  </span>
                </Link>
              </Reveal>
            )}

            {/* Alerta de novedades: atajo directo a lo último publicado (solo con sesión). */}
            {user && recientes.length > 0 && (
              <Reveal delay={560}>
                <div className="mt-12 max-w-2xl rounded-2xl border border-caribbean/25 bg-jungle-deep/60 p-6 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-caribbean">
                      {nuevas > 0
                        ? `${nuevas} ${nuevas === 1 ? 'publicación nueva' : 'publicaciones nuevas'} desde tu última visita`
                        : 'Lo último publicado'}
                    </p>
                    <Link to="/explorar" className="inline-flex min-h-11 items-center font-mono text-xs font-semibold uppercase tracking-[0.12em] text-tea/70 transition hover:text-caribbean">
                      Ver todo →
                    </Link>
                  </div>

                  <ul className="mt-4 divide-y divide-tea/10">
                    {recientes.map((pub) => (
                      <li key={pub.id}>
                        <Link to={`/publicaciones/${pub.id}`} className="group flex items-center justify-between gap-4 py-3">
                          <span className="min-w-0">
                            <span className="block truncate font-display text-sm font-semibold uppercase tracking-wide text-cream transition group-hover:text-caribbean">
                              {pub.title}
                            </span>
                            <span className="mt-0.5 block truncate font-mono text-xs text-tea/70">
                              {TIPO[pub.type]?.label ?? pub.type} · {pub.authorName} · {fmtFecha(pub.createdAt)}
                            </span>
                          </span>
                          {esNueva(pub) && (
                            <span className="flex-none rounded-full bg-candy px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-white">
                              Nuevo
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>

          {/* Mosaico de rostros: ocupa la mitad derecha, que antes quedaba vacía. */}
          {rostros.length >= 3 && (
            <Reveal delay={300} className="hidden lg:block">
              <div className="grid grid-cols-3 gap-3">
                {rostros.map((m, i) => (
                  <Link
                    key={m.id}
                    to={`/perfil/${m.id}`}
                    className={`group relative block aspect-[3/4] overflow-hidden rounded-2xl ${i % 3 === 1 ? 'translate-y-8' : ''}`}
                  >
                    <img src={m.photoUrl} alt={m.fullName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-jungle-deep/90 to-transparent px-3 pb-2.5 pt-8 text-xs font-semibold uppercase tracking-[0.12em] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {m.fullName}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                to="/comunidad"
                className="mt-12 inline-flex min-h-11 items-center font-display text-sm uppercase tracking-[0.2em] text-caribbean underline-offset-8 transition hover:underline"
              >
                Conoce a las {totalMiembros} personas del colectivo →
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Pilares ──────────────────────────────────────────── */}
      <section id="pilares" className="relative bg-cream py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">
              ¿Qué es Boesh Irí?
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">
              Crear con intención
            </h2>
          </Reveal>

          {/* Tres ideas, no tres tarjetas numeradas: no son pasos de una secuencia,
              así que se leen como texto, separadas por un filo. */}
          <div className="mt-12 grid gap-x-12 md:grid-cols-3">
            {pilares.map((p, i) => (
              <Reveal key={p.titulo} delay={i * 130} className="border-t-2 border-rainforest/25 py-7">
                <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-rainforest">
                  {p.titulo}
                </h3>
                <p className="mt-3 leading-relaxed text-jungle/80">{p.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Eventos / Noticias / Blog ────────────────────────── */}
      <section id="publicaciones" className="relative bg-tea/40 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">
                Lo que se mueve
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">
                Eventos, noticias y blog
              </h2>
            </div>
            <Link
              to="/explorar"
              className="inline-flex min-h-11 items-center font-display text-sm uppercase tracking-[0.2em] text-rainforest underline-offset-8 transition hover:text-jungle hover:underline"
            >
              Ver todo →
            </Link>
          </Reveal>

          {recientes.length > 0 ? (
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {recientes.map((pub, i) => (
                <Reveal
                  as={Link}
                  to={`/publicaciones/${pub.id}`}
                  key={pub.id}
                  delay={i * 130}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
                >
                  {/* Portada real o, sin ella, el degradado de marca con la rana:
                      la tarjeta enseña algo antes de pedir que se lea. */}
                  <div className="relative aspect-[16/10] overflow-hidden" style={pub.coverImage ? undefined : { background: gradientFor(pub.id) }}>
                    {pub.coverImage ? (
                      <img src={pub.coverImage} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <FrogIcon className="absolute -bottom-6 -right-4 h-32 w-32 text-white/20" />
                    )}
                    <span className={`absolute left-4 top-4 rounded-full px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em] ${TIPO[pub.type]?.clase ?? 'bg-rainforest text-white'}`}>
                      {TIPO[pub.type]?.label ?? pub.type}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-jungle transition-colors group-hover:text-rainforest">{pub.title}</h3>
                    <p className="mt-2 text-sm text-jungle/70">
                      {pub.authorName} · {fmtFecha(pub.createdAt)}
                      {pub.readingMinutes > 0 && ` · ${pub.readingMinutes} min`}
                    </p>
                    {pub.tags?.length > 0 && (
                      <p className="mt-3 flex-1 text-sm text-rainforest">{pub.tags.slice(0, 3).map((t) => `#${t}`).join('  ')}</p>
                    )}
                    <span className="mt-5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest transition-colors group-hover:text-jungle">Leer más →</span>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal delay={120}>
              <div className="mt-14 rounded-2xl border border-dashed border-rainforest/25 bg-white/50 py-16 text-center">
                <FrogIcon className="mx-auto h-14 w-14 text-rainforest/40" />
                <p className="mt-4 font-display text-sm uppercase tracking-[0.15em] text-jungle/70">Pronto habrá publicaciones aquí</p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Colaboradores ────────────────────────────────────── */}
      <section id="colaboradores" className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">
              Caminan con nosotros
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-jungle md:text-4xl">
              Negocios y espacios aliados
            </h2>
          </Reveal>
        </div>

        {/* Lista fija, no carrusel: con pocos aliados un marquee los repite para
            llenar la banda y aparenta más de los que hay. */}
        <Reveal delay={150} className="mx-auto mt-10 flex max-w-6xl flex-col items-center gap-8 px-5">
          <ul className="flex flex-wrap justify-center gap-x-14 gap-y-6">
            {colaboradores.map((nombre) => (
              <li
                key={nombre}
                className="flex items-center gap-3 font-display text-2xl font-semibold uppercase tracking-[0.2em] text-rainforest"
              >
                <FrogIcon className="h-6 w-6" />
                {nombre}
              </li>
            ))}
          </ul>
          <Link
            to="/contacto"
            className="inline-flex min-h-11 items-center text-sm text-jungle/70 underline decoration-rainforest/40 underline-offset-4 transition-colors hover:text-rainforest hover:decoration-rainforest"
          >
            ¿Tienes un espacio o negocio en Chiriquí? Escríbenos
          </Link>
        </Reveal>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section id="unete" className="bg-dorace-pattern relative overflow-hidden bg-jungle py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(0,115,94,0.35),transparent_70%)]" />

        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <FrogIcon className="mx-auto h-20 w-20 text-caribbean" />
          </Reveal>
          <Reveal delay={140}>
            <h2 className="mt-8 font-display text-4xl font-semibold uppercase leading-tight tracking-wide text-cream md:text-5xl">
              ¿Sientes el llamado de Boesh?
            </h2>
          </Reveal>
          <Reveal delay={280}>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-tea/80">
              Si el arte, la cultura y la comunidad te mueven, este es tu refugio. Postúlate y
              construyamos juntos el próximo capítulo de nuestra historia.
            </p>
          </Reveal>
          <Reveal delay={420}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/postularme"
                className="rounded-full bg-candy px-9 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-terracotta hover:shadow-[0_8px_30px_rgba(229,0,49,0.35)]"
              >
                Quiero ser parte
              </Link>
              <Link
                to="/contacto"
                className="rounded-full border border-tea/40 px-9 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-tea transition hover:border-caribbean hover:text-caribbean"
              >
                Escríbenos
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
