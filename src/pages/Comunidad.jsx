import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { communityApi } from '../api/community'
import { useFetch } from '../hooks/useFetch'
import { gradientFor, iniciales } from '../utils/gradient'
import { useSeo } from '../hooks/useSeo'
import { useDisciplinas } from '../components/DisciplinasPicker'

/** «Muralismo , Artista visual» → «Muralismo, artista visual». Solo presentación. */
function limpiarDisciplina(d) {
  const limpia = d
    .replace(/\s*[/-]\s*/g, ', ')
    .replace(/\s*,\s*/g, ', ')
    .trim()
    .toLowerCase()
  return limpia.charAt(0).toUpperCase() + limpia.slice(1)
}

export default function Comunidad() {
  useSeo({
    titulo: 'Comunidad',
    descripcion: 'Las personas de Boesh Irí: artistas, diseñadores, músicos y gestores culturales de Chiriquí. Cada perfil es un portafolio vivo.',
  })

  const { data, loading, error } = useFetch(() => communityApi.list())
  const miembros = data ?? []
  const [filtro, setFiltro] = useState('todas')

  const catalogo = useDisciplinas()

  // Cada miembro elige sus disciplinas del catálogo cerrado de la API, así que el
  // filtro es exacto. Solo salen las que tienen a alguien: un chip que filtra a
  // cero es un callejón.
  const filtros = useMemo(() => {
    const presentes = catalogo.map((d) => ({
      id: d.key,
      label: d.label,
      total: miembros.filter((m) => m.disciplines?.includes(d.key)).length,
    })).filter((f) => f.total > 0)
    return [{ id: 'todas', label: 'Todas', total: miembros.length }, ...presentes]
  }, [catalogo, miembros])
  const lista = filtro === 'todas' ? miembros : miembros.filter((m) => m.disciplines?.includes(filtro))

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
          {loading && <p className="text-center text-jungle/70">Cargando comunidad…</p>}
          {error && <p className="text-center text-candy">No se pudo cargar la comunidad.</p>}

          {!loading && !error && (
            <>
              {filtros.length > 2 && (
                // Una fila que se desliza en móvil en vez de un muro de chips que
                // llena la primera pantalla; en escritorio caben y se reparten.
                <div className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                  {filtros.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFiltro(f.id)}
                      aria-pressed={filtro === f.id}
                      className={`flex min-h-11 flex-none items-center gap-2 rounded-full px-4 font-display text-xs font-semibold uppercase tracking-[0.12em] transition ${
                        filtro === f.id ? 'bg-jungle text-tea' : 'bg-jungle/8 text-jungle/70 hover:bg-tea'
                      }`}
                    >
                      {f.label}
                      <span className={filtro === f.id ? 'text-tea/70' : 'text-jungle/70'}>{f.total}</span>
                    </button>
                  ))}
                </div>
              )}

              {lista.length === 0 ? (
                <p className="text-center text-jungle/70">Aún no hay perfiles publicados.</p>
              ) : (
                <div key={filtro} className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
                  {lista.map((m, i) => (
                    <Reveal
                      as={Link}
                      to={`/perfil/${m.id}`}
                      key={m.id}
                      delay={(i % 3) * 100}
                      className="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
                    >
                      <div className="relative aspect-square overflow-hidden sm:aspect-[4/3]" style={{ background: gradientFor(m.id) }}>
                        {m.photoUrl ? (
                          <img src={m.photoUrl} alt={m.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <FrogIcon className="absolute -bottom-6 -right-4 h-24 w-24 text-white/15 transition-transform duration-500 group-hover:scale-110 sm:-bottom-8 sm:-right-6 sm:h-36 sm:w-36" />
                            <span className="absolute left-4 top-3 font-display text-4xl font-semibold text-white/90 sm:left-6 sm:top-5 sm:text-6xl">{iniciales(m.fullName)}</span>
                          </>
                        )}
                      </div>
                      <div className="p-3 sm:p-6">
                        <h3 className="break-words font-display text-base font-semibold uppercase leading-tight tracking-wide text-jungle sm:text-xl">{m.fullName}</h3>
                        {m.discipline && <p className="mt-1 text-xs font-medium text-rainforest sm:text-sm">{limpiarDisciplina(m.discipline)}</p>}
                        {m.tags?.length > 0 && (
                          <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
                            {m.tags.slice(0, 4).map((t) => (
                              <span key={t} className="rounded-full bg-jungle/8 px-2.5 py-0.5 text-xs text-jungle/70">{t}</span>
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
