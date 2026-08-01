import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { eventsApi } from '../api/events'
import { useFetch } from '../hooks/useFetch'
import { gradientFor } from '../utils/gradient'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
function parts(iso) {
  const d = new Date(iso)
  return {
    dia: String(d.getDate()).padStart(2, '0'),
    mes: MESES[d.getMonth()],
    anio: d.getFullYear(),
    dow: d.toLocaleDateString('es-PA', { weekday: 'long' }),
    hora: d.toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit' }),
    fecha: d.toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' }),
  }
}
const entrada = (cost) => (cost > 0 ? `$${cost}` : 'Entrada libre')

const chipCategoria = {
  Música: 'bg-terracotta text-white',
  Exposición: 'bg-caribbean text-jungle',
  Taller: 'bg-rainforest text-white',
  Comunidad: 'bg-candy text-white',
  Charla: 'bg-tea text-jungle',
}
const chip = (cat) => chipCategoria[cat] || 'bg-tea text-jungle'

function DateBlock({ dia, mes, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl bg-jungle px-5 py-3 text-tea ${className}`}>
      <span className="font-display text-4xl font-semibold leading-none text-caribbean">{dia}</span>
      <span className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.25em]">{mes}</span>
    </div>
  )
}

export default function Eventos() {
  const { data: prox, loading: lp } = useFetch(() => eventsApi.list('Upcoming'))
  const { data: pasados, loading: lh } = useFetch(() => eventsApi.list('Past'))
  const proximos = prox ?? []
  const historial = pasados ?? []
  const destacado = proximos[0]
  const resto = proximos.slice(1)
  const asistentesTotal = historial.reduce((a, e) => a + (e.attendanceCount || 0), 0)

  return (
    <>
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle pt-16">
        <div className="pointer-events-none absolute -right-24 top-4 h-[34rem] w-[34rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.14),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center">
          <Reveal><p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">Agenda del colectivo</p></Reveal>
          <Reveal delay={140}><h1 className="mt-4 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-6xl">Eventos</h1></Reveal>
          <Reveal delay={260}><p className="mx-auto mt-5 max-w-xl leading-relaxed text-tea/80">Lo que viene y lo que ya vivimos juntos.</p></Reveal>
        </div>
      </section>

      {/* Próximo destacado */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">No te lo pierdas</p>
            <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">Próximo evento</h2>
          </Reveal>

          {lp ? (
            <p className="mt-10 text-jungle/50">Cargando…</p>
          ) : !destacado ? (
            <p className="mt-10 text-jungle/50">No hay eventos próximos por ahora.</p>
          ) : (() => {
            const p = parts(destacado.date)
            return (
              <Reveal delay={140} className="mt-10 grid overflow-hidden rounded-3xl bg-jungle text-tea md:grid-cols-2">
                <div className="relative flex min-h-[16rem] flex-col justify-between p-8" style={{ background: gradientFor(destacado.id) }}>
                  {destacado.coverImage && <img src={destacado.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
                  <FrogIcon className="pointer-events-none absolute -bottom-10 -right-8 h-64 w-64 text-white/10" />
                  <div className="relative flex items-start justify-between">
                    <span className={`rounded-full px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em] ${chip(destacado.category)}`}>{destacado.category}</span>
                    <span className="rounded-full bg-white/85 px-3.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.15em] text-jungle">Próximo</span>
                  </div>
                  <div className="relative">
                    <p className="font-display text-6xl font-semibold leading-none text-white">{p.dia}</p>
                    <p className="mt-1 font-display text-lg font-semibold uppercase tracking-[0.2em] text-white/90">{p.mes} · {p.anio}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 md:p-10">
                  <h3 className="font-display text-3xl font-semibold uppercase leading-tight tracking-wide text-cream">{destacado.title}</h3>
                  <ul className="mt-6 space-y-2 text-sm text-tea/85">
                    <li>🗓️ {p.dow}, {p.hora}</li>
                    {destacado.location && <li>📍 {destacado.location}</li>}
                    <li>🎟️ {entrada(destacado.cost)}</li>
                  </ul>
                  <Link to="/contacto" className="mt-8 inline-block w-fit rounded-full bg-caribbean px-7 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5">Quiero asistir</Link>
                </div>
              </Reveal>
            )
          })()}
        </div>
      </section>

      {/* Más próximos */}
      {resto.length > 0 && (
        <section className="bg-tea/40 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal><h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-jungle md:text-4xl">También en agenda</h2></Reveal>
            <div className="mt-10 space-y-5">
              {resto.map((e, i) => {
                const p = parts(e.date)
                return (
                  <Reveal key={e.id} delay={i * 110} className="group flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1 sm:flex-row sm:items-center">
                    <DateBlock dia={p.dia} mes={p.mes} className="flex-none sm:w-24" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-0.5 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${chip(e.category)}`}>{e.category}</span>
                        <span className="text-xs uppercase tracking-[0.15em] text-jungle/50">{p.dow} · {p.hora}</span>
                      </div>
                      <h3 className="mt-2 font-display text-2xl font-semibold uppercase tracking-wide text-jungle">{e.title}</h3>
                      <p className="mt-3 text-xs uppercase tracking-[0.15em] text-rainforest">{e.location ? `📍 ${e.location} · ` : ''}🎟️ {entrada(e.cost)}</p>
                    </div>
                    <Link to="/contacto" className="flex-none rounded-full border border-rainforest px-5 py-2.5 text-center font-display text-xs font-semibold uppercase tracking-[0.18em] text-rainforest transition hover:bg-rainforest hover:text-cream">Más info</Link>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Cifras */}
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle py-16">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(0,115,94,0.3),transparent_70%)]" />
        <div className="relative mx-auto grid max-w-3xl grid-cols-2 gap-8 px-5 text-center">
          <Reveal><p className="font-display text-5xl font-semibold text-caribbean">{historial.length}</p><p className="mt-2 text-xs uppercase tracking-[0.2em] text-tea/70">Eventos realizados</p></Reveal>
          <Reveal delay={100}><p className="font-display text-5xl font-semibold text-caribbean">{asistentesTotal}</p><p className="mt-2 text-xs uppercase tracking-[0.2em] text-tea/70">Asistentes</p></Reveal>
        </div>
      </section>

      {/* Historial */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-rainforest">Lo que ya vivimos</p>
            <h2 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-jungle md:text-5xl">Historial de eventos</h2>
          </Reveal>

          {lh ? (
            <p className="mt-10 text-jungle/50">Cargando…</p>
          ) : historial.length === 0 ? (
            <p className="mt-10 text-jungle/50">Aún no hay eventos en el historial.</p>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {historial.map((e, i) => {
                const p = parts(e.date)
                return (
                  <Reveal key={e.id} delay={(i % 2) * 120} className="group flex overflow-hidden rounded-2xl border border-rainforest/15 bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1">
                    <div className="relative w-28 flex-none saturate-[0.85]" style={{ background: gradientFor(e.id) }}>
                      <span className="absolute inset-x-0 bottom-3 text-center font-display text-xs font-semibold uppercase tracking-[0.15em] text-white/90">✓ Realizado</span>
                      <FrogIcon className="absolute left-1/2 top-6 h-12 w-12 -translate-x-1/2 text-white/20" />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-0.5 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${chip(e.category)}`}>{e.category}</span>
                        <span className="text-xs uppercase tracking-[0.15em] text-jungle/50">{p.fecha}</span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-jungle">{e.title}</h3>
                      <p className="mt-4 text-xs uppercase tracking-[0.15em] text-rainforest">{e.location ? `📍 ${e.location} · ` : ''}👥 {e.attendanceCount} asistentes</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
