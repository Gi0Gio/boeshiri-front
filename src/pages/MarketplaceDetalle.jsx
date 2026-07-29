import { Link, useParams } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { productos } from '../data/panel'
import { perfiles } from '../data/contenido'

export default function MarketplaceDetalle() {
  const { id } = useParams()
  const producto = productos.find((p) => p.id === id)
  const miembro = producto && perfiles.find((m) => m.nombre === producto.miembro)

  if (!producto) {
    return (
      <section className="bg-dorace-pattern flex min-h-screen items-center justify-center bg-jungle pt-16 text-center text-tea">
        <div className="px-6">
          <FrogIcon className="mx-auto h-20 w-20 text-caribbean" />
          <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide text-cream">Producto no encontrado</h1>
          <Link to="/marketplace" className="mt-8 inline-block rounded-full border border-caribbean px-6 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-caribbean transition hover:bg-caribbean hover:text-jungle">
            Volver al marketplace
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream pt-16">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <Link to="/marketplace" className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-rainforest transition hover:text-jungle">
          ← Marketplace
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <Reveal>
            <div
              className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl"
              style={{ background: `linear-gradient(150deg, ${producto.colores[0]}, ${producto.colores[1]})` }}
            >
              <FrogIcon className="h-40 w-40 text-white/20" />
              {producto.estado === 'Vendido' && (
                <span className="absolute right-5 top-5 rounded-full bg-jungle/85 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.15em] text-tea">
                  Vendido
                </span>
              )}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <span className="rounded-full bg-tea px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-jungle">
              {producto.categoria}
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-tight tracking-wide text-jungle">
              {producto.nombre}
            </h1>
            <p className="mt-3 font-display text-3xl font-semibold text-rainforest">${producto.precio}</p>
            <p className="mt-5 leading-relaxed text-jungle/75">{producto.descripcion}</p>
            <p className="mt-4 text-sm uppercase tracking-[0.12em] text-jungle/50">📍 Entrega en {producto.ubicacion}</p>

            {/* Contacto: se toma del perfil del miembro */}
            <div className="mt-8 rounded-2xl border border-rainforest/15 bg-white p-6">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest">Vendido por</p>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full font-display text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(150deg, ${(miembro?.colores || producto.colores)[0]}, ${(miembro?.colores || producto.colores)[1]})` }}
                >
                  {producto.miembro.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-display text-base font-semibold uppercase tracking-wide text-jungle">{producto.miembro}</p>
                  {miembro && (
                    <Link to={`/perfil/${miembro.slug}`} className="text-xs uppercase tracking-[0.12em] text-rainforest hover:underline">
                      Ver perfil →
                    </Link>
                  )}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="#" className="rounded-full bg-candy px-6 py-3 font-display text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-terracotta">
                  Contactar al vendedor
                </a>
                <button className="rounded-full border border-rainforest/30 px-6 py-3 font-display text-xs font-semibold uppercase tracking-[0.15em] text-rainforest transition hover:bg-rainforest hover:text-cream">
                  Compartir
                </button>
              </div>
              <p className="mt-4 text-xs text-jungle/45">
                El contacto se toma del perfil del miembro. Boesh Irí no procesa pagos.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
