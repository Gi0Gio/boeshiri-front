import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { communityApi } from '../api/community'
import { useFetch } from '../hooks/useFetch'
import { gradientFor, iniciales } from '../utils/gradient'

export default function Comunidad() {
  const { data, loading, error } = useFetch(() => communityApi.list())
  const miembros = data ?? []
  const [filtro, setFiltro] = useState('Todas')

  const disciplinas = useMemo(
    () => ['Todas', ...new Set(miembros.map((m) => m.discipline).filter(Boolean))],
    [miembros],
  )
  const lista = filtro === 'Todas' ? miembros : miembros.filter((m) => m.discipline === filtro)

  return (
    <>
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle pt-16">
        <div className="pointer-events-none absolute -right-24 top-4 h-[34rem] w-[34rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.14),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center">
          <Reveal><p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">Las personas del colectivo</p></Reveal>
          <Reveal delay={140}>
            <h1 className="mt-4 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-6xl">Comunidad</h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-tea/80">
              Cada perfil es un portafolio vivo. Conoce a quienes crean Boesh Irí y explora su trabajo.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-5">
          {loading && <p className="text-center text-jungle/50">Cargando comunidad…</p>}
          {error && <p className="text-center text-candy">No se pudo cargar la comunidad.</p>}

          {!loading && !error && (
            <>
              {disciplinas.length > 1 && (
                <div className="mb-10 flex flex-wrap justify-center gap-2">
                  {disciplinas.map((d) => (
                    <button
                      key={d}
                      onClick={() => setFiltro(d)}
                      className={`rounded-full px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.12em] transition ${
                        filtro === d ? 'bg-jungle text-tea' : 'bg-jungle/8 text-jungle/60 hover:bg-tea'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              {lista.length === 0 ? (
                <p className="text-center text-jungle/50">Aún no hay perfiles publicados.</p>
              ) : (
                <div key={filtro} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {lista.map((m, i) => (
                    <Reveal
                      as={Link}
                      to={`/perfil/${m.id}`}
                      key={m.id}
                      delay={(i % 3) * 100}
                      className="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: gradientFor(m.id) }}>
                        {m.photoUrl ? (
                          <img src={m.photoUrl} alt={m.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <FrogIcon className="absolute -bottom-8 -right-6 h-36 w-36 text-white/15 transition-transform duration-500 group-hover:scale-110" />
                            <span className="absolute left-6 top-5 font-display text-6xl font-semibold text-white/90">{iniciales(m.fullName)}</span>
                          </>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-jungle">{m.fullName}</h3>
                        {m.discipline && <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-rainforest">{m.discipline}</p>}
                        {m.tags?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {m.tags.slice(0, 4).map((t) => (
                              <span key={t} className="rounded-full bg-jungle/8 px-2.5 py-0.5 text-xs text-jungle/60">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
