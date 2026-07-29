import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { misionVision, valores, hitos, perfiles } from '../data/contenido'

export default function Sobre() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle pt-16">
        <div className="pointer-events-none absolute -right-32 top-10 h-[40rem] w-[40rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.16),transparent_70%)]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[34rem] w-[34rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-[1.4fr_1fr] md:py-28">
          <div>
            <Reveal>
              <p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">
                Sobre el colectivo
              </p>
            </Reveal>
            <Reveal delay={140}>
              <h1 className="mt-5 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-7xl">
                Somos memoria <span className="text-caribbean">en movimiento</span>
              </h1>
            </Reveal>
            <Reveal delay={280}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-tea/85">
                Boesh Irí nació de una inquietud sencilla y terca: que la historia de Chiriquí no se
                quede en el pasado. Somos artistas y mentes alternativas construyendo un refugio para
                crear con raíz.
              </p>
            </Reveal>
          </div>

          <Reveal delay={360} className="hidden justify-self-center md:block">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-caribbean/30">
              <div className="absolute inset-4 rounded-full border border-tea/10" />
              <FrogIcon className="h-28 w-28 text-caribbean" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Misión y visión ──────────────────────────────────── */}
      <section className="relative bg-cream py-24">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-2">
          <Reveal className="rounded-3xl bg-jungle p-10 text-tea">
            <span className="font-display text-sm uppercase tracking-[0.3em] text-caribbean">
              Misión
            </span>
            <p className="mt-5 font-display text-2xl font-medium leading-snug text-cream md:text-3xl">
              {misionVision.mision}
            </p>
          </Reveal>
          <Reveal
            delay={140}
            className="rounded-3xl border border-rainforest/20 bg-white p-10"
          >
            <span className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">
              Visión
            </span>
            <p className="mt-5 font-display text-2xl font-medium leading-snug text-jungle md:text-3xl">
              {misionVision.vision}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Valores ──────────────────────────────────────────── */}
      <section className="relative bg-tea/40 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">
              Lo que nos sostiene
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">
              Nuestros valores
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {valores.map((v, i) => (
              <Reveal
                key={v.titulo}
                delay={i * 110}
                className="group rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
              >
                <FrogIcon className="h-9 w-9 text-tea transition-colors group-hover:text-caribbean" />
                <h3 className="mt-5 font-display text-xl font-semibold uppercase tracking-wide text-rainforest">
                  {v.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-jungle/70">{v.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Historia / línea de tiempo ───────────────────────── */}
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[42rem] w-[42rem] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(0,115,94,0.3),transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-5">
          <Reveal className="text-center">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-caribbean">
              De dónde venimos
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-cream md:text-5xl">
              Nuestra historia
            </h2>
          </Reveal>

          <ol className="mt-16 space-y-3">
            {hitos.map((h, i) => (
              <Reveal
                as="li"
                key={h.año}
                delay={i * 120}
                className="grid gap-4 rounded-2xl border border-tea/10 bg-jungle-deep/40 p-7 md:grid-cols-[auto_1fr] md:items-baseline md:gap-8"
              >
                <span className="font-display text-4xl font-semibold text-caribbean md:text-5xl">
                  {h.año}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-cream">
                    {h.titulo}
                  </h3>
                  <p className="mt-2 leading-relaxed text-tea/75">{h.texto}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Equipo (puente a perfiles) ───────────────────────── */}
      <section className="relative bg-cream py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">
                Las manos detrás
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">
                Quiénes lo hacemos
              </h2>
            </div>
            <Link
              to="/explorar"
              className="font-display text-sm uppercase tracking-[0.2em] text-rainforest underline-offset-8 transition hover:text-jungle hover:underline"
            >
              Ver todos los perfiles →
            </Link>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perfiles.slice(0, 4).map((p, i) => (
              <Reveal
                as={Link}
                to={`/perfil/${p.slug}`}
                key={p.slug}
                delay={i * 110}
                className="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
              >
                <div
                  className="relative aspect-[4/5] overflow-hidden"
                  style={{
                    background: `linear-gradient(150deg, ${p.colores[0]}, ${p.colores[1]})`,
                  }}
                >
                  <FrogIcon className="absolute -bottom-6 -right-4 h-28 w-28 text-white/15 transition-transform duration-500 group-hover:scale-110" />
                  <span className="absolute left-5 top-5 font-display text-5xl font-semibold text-white/90">
                    {p.nombre
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-jungle">
                    {p.nombre}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-rainforest">
                    {p.disciplina}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
