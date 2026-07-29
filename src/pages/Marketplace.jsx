import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { productos, categoriasProducto } from '../data/panel'

export default function Marketplace() {
  const [cat, setCat] = useState('Todo')
  const [q, setQ] = useState('')

  const lista = productos.filter(
    (p) =>
      (cat === 'Todo' || p.categoria === cat) &&
      p.nombre.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <>
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle pt-16">
        <div className="pointer-events-none absolute -left-24 top-4 h-[32rem] w-[32rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">Apoya a nuestros artistas</p>
          </Reveal>
          <Reveal delay={140}>
            <h1 className="mt-4 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-6xl">
              Marketplace
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-tea/80">
              Productos creados por los miembros del colectivo. El trato es directo con cada artista —
              Boesh Irí no gestiona pagos.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categoriasProducto.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-full px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    cat === c ? 'bg-jungle text-tea' : 'bg-jungle/8 text-jungle/60 hover:bg-tea'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full rounded-full border border-rainforest/20 bg-white px-5 py-2.5 text-sm text-jungle placeholder:text-jungle/40 focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/25 md:w-64"
            />
          </div>

          <div key={cat + q} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((p, i) => (
              <Reveal
                as={Link}
                to={`/marketplace/${p.id}`}
                key={p.id}
                delay={(i % 3) * 90}
                className="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]"
              >
                <div
                  className="relative flex aspect-[4/3] items-end justify-between p-4"
                  style={{ background: `linear-gradient(150deg, ${p.colores[0]}, ${p.colores[1]})` }}
                >
                  <span className="rounded-full bg-white/85 px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-jungle">
                    {p.categoria}
                  </span>
                  {p.estado === 'Vendido' && (
                    <span className="rounded-full bg-jungle/80 px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-tea">
                      Vendido
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-wide text-jungle">{p.nombre}</h3>
                    <span className="font-display text-xl font-semibold text-rainforest">${p.precio}</span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-jungle/50">{p.miembro} · {p.ubicacion}</p>
                </div>
              </Reveal>
            ))}
          </div>
          {lista.length === 0 && (
            <p className="py-16 text-center text-sm text-jungle/50">No hay productos que coincidan.</p>
          )}
        </div>
      </section>
    </>
  )
}
