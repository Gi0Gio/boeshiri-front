import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Reveal from '../components/Reveal'
import FrogIcon from '../components/FrogIcon'
import { marketplaceApi } from '../api/marketplace'
import { useFetch } from '../hooks/useFetch'
import { gradientFor } from '../utils/gradient'

const KINDS = [{ id: 'Todo', label: 'Todo' }, { id: 'Product', label: 'Productos' }, { id: 'Service', label: 'Servicios' }]
// Rango si lo hay (servicios), precio si no, y "a convenir" cuando vale 0.
const fmtPrecio = (p) =>
  p.priceMax != null && p.priceMax > p.price ? `$${p.price} – $${p.priceMax}` : p.price > 0 ? `$${p.price}` : 'A convenir'

export default function Marketplace() {
  const [kind, setKind] = useState('Todo')
  const [cat, setCat] = useState('Todo')
  const [q, setQ] = useState('')

  // ?vendedor= llega desde la ficha de un anuncio o desde el perfil del miembro.
  const [params, setParams] = useSearchParams()
  const vendedor = params.get('vendedor')

  const { data, loading, error } = useFetch(() => marketplaceApi.list(null, null, vendedor), [vendedor])
  const productos = data ?? []
  const nombreVendedor = productos[0]?.sellerName

  const porKind = kind === 'Todo' ? productos : productos.filter((p) => p.kind === kind)
  const categorias = useMemo(
    () => ['Todo', ...Array.from(new Set(porKind.map((p) => p.category))).sort()],
    [porKind],
  )
  const lista = porKind.filter(
    (p) => (cat === 'Todo' || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <>
      <section className="bg-dorace-pattern relative overflow-hidden bg-jungle pt-16">
        <div className="pointer-events-none absolute -left-24 top-4 h-[32rem] w-[32rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center">
          <Reveal><p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">Apoya a nuestros artistas</p></Reveal>
          <Reveal delay={140}><h1 className="mt-4 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-wide text-cream md:text-6xl">Marketplace</h1></Reveal>
          <Reveal delay={260}>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-tea/80">
              Productos y servicios de los miembros del colectivo —desde láminas y música hasta tutorías y asesorías. El trato es directo con cada artista; Boesh Irí no gestiona pagos.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream py-14">
        <div className="mx-auto max-w-6xl px-5">

          {/* Filtro por vendedor activo. Se muestra siempre que venga en la URL,
              con salida a la vista: si no, se quedaría filtrado sin saber por qué. */}
          {vendedor && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rainforest/20 bg-white px-5 py-4">
              <p className="text-sm text-jungle/75">
                Mostrando solo lo de{' '}
                <strong className="text-jungle">{nombreVendedor || 'este miembro'}</strong>
                {!loading && ` · ${productos.length} ${productos.length === 1 ? 'anuncio' : 'anuncios'}`}
              </p>
              <button
                onClick={() => { setParams({}); setKind('Todo'); setCat('Todo'); setQ('') }}
                className="font-display text-xs font-semibold uppercase tracking-[0.15em] text-rainforest underline-offset-4 transition hover:underline"
              >
                Ver todo el marketplace
              </button>
            </div>
          )}

          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-full bg-jungle/8 p-1">
              {KINDS.map((k) => (
                <button key={k.id} onClick={() => { setKind(k.id); setCat('Todo') }}
                  className={`rounded-full px-6 py-2 font-display text-xs font-semibold uppercase tracking-[0.15em] transition ${kind === k.id ? 'bg-jungle text-tea' : 'text-jungle/55 hover:text-jungle'}`}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <button key={c} onClick={() => setCat(c)}
                  className={`rounded-full px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.12em] transition ${cat === c ? 'bg-jungle text-tea' : 'bg-jungle/8 text-jungle/60 hover:bg-tea'}`}>
                  {c}
                </button>
              ))}
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre…"
              className="w-full rounded-full border border-rainforest/20 bg-white px-5 py-2.5 text-sm text-jungle placeholder:text-jungle/40 focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/25 md:w-64" />
          </div>

          {loading && <p className="py-16 text-center text-sm text-jungle/50">Cargando productos…</p>}
          {error && <p className="py-16 text-center text-sm text-candy">No se pudo cargar el marketplace.</p>}

          {!loading && !error && (
            <>
              <div key={cat + q} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((p, i) => (
                  <Reveal as={Link} to={`/marketplace/${p.id}`} key={p.id} delay={(i % 3) * 90}
                    className="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,37,32,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,37,32,0.14)]">
                    <div className="relative flex aspect-[4/3] items-end justify-between overflow-hidden p-4" style={p.coverImage ? undefined : { background: gradientFor(p.id) }}>
                      {p.coverImage && <img src={p.coverImage} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                      {!p.coverImage && <FrogIcon className="pointer-events-none absolute -bottom-6 -right-4 h-32 w-32 text-white/15" />}
                      <span className="relative flex items-center gap-1.5">
                        <span className="rounded-full bg-white/85 px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-jungle">{p.category}</span>
                        {p.kind === 'Service' && <span className="rounded-full bg-caribbean px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-jungle">Servicio</span>}
                      </span>
                      {p.status === 'Sold' && <span className="relative rounded-full bg-jungle/80 px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-tea">Vendido</span>}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-wide text-jungle">{p.name}</h3>
                        <span className="font-display text-lg font-semibold text-rainforest">{fmtPrecio(p)}</span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.12em] text-jungle/50">{p.sellerName}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              {lista.length === 0 && <p className="py-16 text-center text-sm text-jungle/50">{productos.length === 0 ? 'Aún no hay productos publicados.' : 'No hay productos que coincidan.'}</p>}
            </>
          )}
        </div>
      </section>
    </>
  )
}
