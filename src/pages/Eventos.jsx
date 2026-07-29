import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { eventosProximos, eventosPasados, cifrasEventos } from '../data/contenido'

const chipCategoria = {
  Música: 'bg-terracotta text-white',
  Exposición: 'bg-caribbean text-jungle',
  Taller: 'bg-rainforest text-white',
  Comunidad: 'bg-candy text-white',
  Charla: 'bg-tea text-jungle',
}

function DateBlock({ dia, mes, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl bg-jungle px-5 py-3 text-tea ${className}`}
    >
      <span className="font-display text-4xl font-semibold leading-none text-caribbean">{dia}</span>
      <span className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.25em]">
        {mes}
      </span>
    </div>
  )
}

export default function Eventos() {
  const destacado = eventosProximos.find((e) => e.destacado) || eventosProximos[0]
  const resto = eventosProximos.filter((e) => e !== destacado)

  return (
    <>
      {/* ── Cabecera ─────────────────────────────────────────── */}
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle pt-16">
        <div className="pointer-events-none absolute -right-24 top-4 h-[34rem] w-[34rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.14),transparent_70%)]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[32rem] w-[32rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">
              Agenda del colectivo
            </p>
          </Reveal>
          <Reveal delay={140}>
            <h1 className="mt-4 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-6xl">
              Eventos
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-tea/80">
              Lo que viene y lo que ya vivimos juntos. Encuentros donde el arte, la memoria y la
              comunidad se dan la mano.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Próximo evento destacado ─────────────────────────── */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">
              No te lo pierdas
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">
              Próximo evento
            </h2>
          </Reveal>

          <Reveal
            delay={140}
            className="mt-10 grid overflow-hidden rounded-3xl bg-jungle text-tea md:grid-cols-2"
          >
            {/* Lado visual */}
            <div
              className="relative flex min-h-[16rem] flex-col justify-between p-8"
              style={{
                background: `linear-gradient(150deg, ${destacado.colores[0]}, ${destacado.colores[1]})`,
              }}
            >
              <FrogIcon className="pointer-events-none absolute -bottom-10 -right-8 h-64 w-64 text-white/10" />
              <div className="relative flex items-start justify-between">
                <span
                  className={`rounded-full px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em] ${chipCategoria[destacado.categoria]}`}
                >
                  {destacado.categoria}
                </span>
                <span className="rounded-full bg-white/85 px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em] text-jungle">
                  Próximo
                </span>
              </div>
              <div className="relative">
                <p className="font-display text-6xl font-semibold leading-none text-white">
                  {destacado.dia}
                </p>
                <p className="mt-1 font-display text-lg font-semibold uppercase tracking-[0.2em] text-white/90">
                  {destacado.mes} · {destacado.año}
                </p>
              </div>
            </div>

            {/* Lado texto */}
            <div className="flex flex-col justify-center p-8 md:p-10">
              <h3 className="font-display text-3xl font-semibold uppercase leading-tight tracking-wide text-cream">
                {destacado.titulo}
              </h3>
              <p className="mt-4 leading-relaxed text-tea/80">{destacado.descripcion}</p>
              <ul className="mt-6 space-y-2 text-sm text-tea/85">
                <li>🗓️ {destacado.diaSemana}, {destacado.hora}</li>
                <li>📍 {destacado.lugar} · {destacado.ciudad}</li>
                <li>🎟️ {destacado.entrada}</li>
              </ul>
              <Link
                to="/contacto"
                className="mt-8 inline-block w-fit rounded-full bg-caribbean px-7 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,230,188,0.35)]"
              >
                Quiero asistir
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Más próximos ─────────────────────────────────────── */}
      {resto.length > 0 && (
        <section className="bg-tea/40 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-jungle md:text-4xl">
                También en agenda
              </h2>
            </Reveal>

            <div className="mt-10 space-y-5">
              {resto.map((e, i) => (
                <Reveal
                  key={e.slug}
                  delay={i * 110}
                  className="group flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)] sm:flex-row sm:items-center"
                >
                  <DateBlock dia={e.dia} mes={e.mes} className="flex-none sm:w-24" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-0.5 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${chipCategoria[e.categoria]}`}
                      >
                        {e.categoria}
                      </span>
                      <span className="text-xs uppercase tracking-[0.15em] text-jungle/50">
                        {e.diaSemana} · {e.hora}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-semibold uppercase tracking-wide text-jungle">
                      {e.titulo}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-jungle/70">{e.descripcion}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.15em] text-rainforest">
                      📍 {e.lugar} · {e.ciudad} · 🎟️ {e.entrada}
                    </p>
                  </div>
                  <Link
                    to="/contacto"
                    className="flex-none rounded-full border border-rainforest px-5 py-2.5 text-center font-display text-xs font-semibold uppercase tracking-[0.18em] text-rainforest transition hover:bg-rainforest hover:text-cream"
                  >
                    Más info
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Cifras ───────────────────────────────────────────── */}
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle py-16">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(0,115,94,0.3),transparent_70%)]" />
        <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-8 px-5 text-center md:grid-cols-4">
          {cifrasEventos.map((c, i) => (
            <Reveal key={c.etiqueta} delay={i * 100}>
              <p className="font-display text-5xl font-semibold text-caribbean">{c.valor}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-tea/70">{c.etiqueta}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Historial ────────────────────────────────────────── */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">
              Lo que ya vivimos
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">
              Historial de eventos
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {eventosPasados.map((e, i) => (
              <Reveal
                key={e.titulo}
                delay={(i % 2) * 120}
                className="group flex overflow-hidden rounded-2xl border border-rainforest/15 bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,37,32,0.12)]"
              >
                <div
                  className="relative w-28 flex-none saturate-[0.85]"
                  style={{ background: `linear-gradient(150deg, ${e.colores[0]}, ${e.colores[1]})` }}
                >
                  <span className="absolute inset-x-0 bottom-3 text-center font-display text-xs font-semibold uppercase tracking-[0.15em] text-white/90">
                    ✓ Realizado
                  </span>
                  <FrogIcon className="absolute left-1/2 top-6 h-12 w-12 -translate-x-1/2 text-white/20" />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-0.5 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${chipCategoria[e.categoria]}`}
                    >
                      {e.categoria}
                    </span>
                    <span className="text-xs uppercase tracking-[0.15em] text-jungle/50">
                      {e.fecha}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-jungle">
                    {e.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-jungle/70">{e.recap}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.15em] text-rainforest">
                    📍 {e.lugar} · 👥 {e.asistentes} asistentes
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="mt-12 text-center text-xs italic text-jungle/40">
              Contenido de ejemplo — se conectará al calendario del colectivo.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
