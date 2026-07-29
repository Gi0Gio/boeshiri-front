import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { pilares, publicaciones, colaboradores } from '../data/contenido'

const chipColor = {
  Evento: 'bg-caribbean text-jungle',
  Noticia: 'bg-terracotta text-white',
  Blog: 'bg-rainforest text-white',
}

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-dorace-pattern relative flex min-h-screen items-center overflow-hidden bg-jungle pt-16">
        {/* Resplandor ambiental (gradientes radiales: mismo efecto que blur() pero sin costo de GPU) */}
        <div className="pointer-events-none absolute -left-40 top-1/4 h-[44rem] w-[44rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-[36rem] w-[36rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.14),transparent_70%)]" />

        <div className="relative mx-auto w-full max-w-6xl px-5 py-24">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">
              Colectivo cultural · Chiriquí, Panamá
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
          <Reveal delay={420}>
            <div className="mt-10 flex flex-wrap gap-4">
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
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Pilares ──────────────────────────────────────────── */}
      <section id="pilares" className="relative bg-cream py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">
              ¿Qué es Boesh Irí?
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">
              Crear con intención
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {pilares.map((p, i) => (
              <Reveal
                key={p.titulo}
                delay={i * 130}
                className="group rounded-2xl border border-rainforest/15 bg-white p-8 transition duration-300 hover:-translate-y-1.5 hover:border-rainforest/40 hover:shadow-[0_18px_40px_rgba(0,37,32,0.12)]"
              >
                <span className="font-display text-5xl font-semibold text-tea transition-colors group-hover:text-caribbean">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold uppercase tracking-wide text-rainforest">
                  {p.titulo}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-jungle/75">{p.texto}</p>
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
              className="font-display text-sm uppercase tracking-[0.2em] text-rainforest underline-offset-8 transition hover:text-jungle hover:underline"
            >
              Ver todo →
            </Link>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {publicaciones.map((pub, i) => (
              <Reveal
                key={pub.titulo}
                delay={i * 130}
                className="flex flex-col rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em] ${chipColor[pub.tipo]}`}
                  >
                    {pub.tipo}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-jungle/50">
                    {pub.fecha}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold uppercase tracking-wide text-jungle">
                  {pub.titulo}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-jungle/70">{pub.resumen}</p>
                <Link
                  to="/explorar"
                  className="mt-6 font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest transition hover:text-caribbean"
                >
                  Leer más →
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="mt-8 text-center text-xs italic text-jungle/40">
              Contenido de ejemplo — se conectará al gestor de publicaciones del colectivo.
            </p>
          </Reveal>
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

        <Reveal delay={150}>
          <div className="group relative mt-12 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-cream to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-cream to-transparent" />
            <div className="flex w-max animate-marquee gap-16 pr-16 will-change-transform group-hover:[animation-play-state:paused]">
              {[...colaboradores, ...colaboradores].map((nombre, i) => (
                <span
                  key={`${nombre}-${i}`}
                  className="flex items-center gap-3 whitespace-nowrap font-display text-2xl font-semibold uppercase tracking-[0.2em] text-rainforest/50 transition hover:text-rainforest"
                >
                  <FrogIcon className="h-6 w-6 opacity-60" />
                  {nombre}
                </span>
              ))}
            </div>
          </div>
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
              ¿Sientes el llamado de la rana?
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
                Postularme ahora
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
