import { useState } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { perfiles } from '../data/contenido'

const disciplinas = ['Todas', ...new Set(perfiles.map((p) => p.disciplina))]

function iniciales(nombre) {
  return nombre.split(' ').map((n) => n[0]).join('')
}

export default function Comunidad() {
  const [filtro, setFiltro] = useState('Todas')
  const lista = filtro === 'Todas' ? perfiles : perfiles.filter((p) => p.disciplina === filtro)

  return (
    <>
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle pt-16">
        <div className="pointer-events-none absolute -right-24 top-4 h-[34rem] w-[34rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.14),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">Las personas del colectivo</p>
          </Reveal>
          <Reveal delay={140}>
            <h1 className="mt-4 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-6xl">
              Comunidad
            </h1>
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

          <div key={filtro} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((p, i) => (
              <Reveal
                as={Link}
                to={`/perfil/${p.slug}`}
                key={p.slug}
                delay={(i % 3) * 100}
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
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-jungle">{p.nombre}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-rainforest">{p.disciplina}</p>
                  <p className="mt-3 text-sm leading-relaxed text-jungle/60">{p.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
