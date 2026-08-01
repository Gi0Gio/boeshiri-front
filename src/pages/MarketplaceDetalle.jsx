import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { marketplaceApi } from '../api/marketplace'
import { useFetch } from '../hooks/useFetch'
import { useToast } from '../components/Toast'
import { gradientFor, iniciales } from '../utils/gradient'

const soloDigitos = (s) => (s || '').replace(/[^\d]/g, '')

/** Construye el href de contacto según la red. */
function socialHref(type, value) {
  switch (type) {
    case 'Whatsapp': return `https://wa.me/${soloDigitos(value)}`
    case 'Mail': return `mailto:${value}`
    case 'Instagram': return `https://instagram.com/${value.replace('@', '')}`
    case 'Tiktok': return `https://tiktok.com/@${value.replace('@', '')}`
    case 'Web': return value.startsWith('http') ? value : `https://${value}`
    default: return value
  }
}

export default function MarketplaceDetalle() {
  const { id } = useParams()
  const { data: p, loading, error } = useFetch(() => marketplaceApi.get(id), [id])
  const [img, setImg] = useState(0)
  const toast = useToast()

  if (loading) return <section className="flex min-h-screen items-center justify-center bg-cream pt-16 text-jungle/50">Cargando…</section>

  if (error || !p) {
    return (
      <section className="bg-dorace-pattern flex min-h-screen items-center justify-center bg-jungle pt-16 text-center text-tea">
        <div className="px-6">
          <FrogIcon className="mx-auto h-20 w-20 text-caribbean" />
          <h1 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide text-cream">Producto no disponible</h1>
          <Link to="/marketplace" className="mt-8 inline-block rounded-full border border-caribbean px-6 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-caribbean transition hover:bg-caribbean hover:text-jungle">Volver al marketplace</Link>
        </div>
      </section>
    )
  }

  const imagenes = p.images ?? []
  const wa = p.contact?.socialLinks?.find((l) => l.type === 'Whatsapp')
  const contactoPrincipal = wa
    ? { label: 'WhatsApp', href: socialHref('Whatsapp', wa.value) }
    : p.contact?.phone
      ? { label: 'WhatsApp', href: `https://wa.me/${soloDigitos(p.contact.phone)}` }
      : p.contact?.email
        ? { label: 'Escribir correo', href: `mailto:${p.contact.email}` }
        : null

  const compartir = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: p.name, url })
      else { await navigator.clipboard.writeText(url); toast.info('Enlace copiado al portapapeles') }
    } catch { /* cancelado */ }
  }

  return (
    <section className="bg-cream pt-16">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <Link to="/marketplace" className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-rainforest transition hover:text-jungle">← Marketplace</Link>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <Reveal>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl" style={imagenes.length ? undefined : { background: gradientFor(p.id) }}>
              {imagenes.length ? <img src={imagenes[img]} alt={p.name} className="h-full w-full object-cover" /> : <FrogIcon className="h-40 w-40 text-white/20" />}
              {p.status === 'Sold' && <span className="absolute right-5 top-5 rounded-full bg-jungle/85 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.15em] text-tea">Vendido</span>}
            </div>
            {imagenes.length > 1 && (
              <div className="mt-3 flex gap-2">
                {imagenes.map((src, i) => (
                  <button key={i} onClick={() => setImg(i)} className={`h-16 w-16 flex-none overflow-hidden rounded-xl border-2 ${i === img ? 'border-caribbean' : 'border-transparent'}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal delay={120}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-tea px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-jungle">{p.category}</span>
              {p.kind === 'Service' && <span className="rounded-full bg-rainforest px-3 py-1 font-display text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-cream">Servicio</span>}
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-tight tracking-wide text-jungle">{p.name}</h1>
            <p className="mt-3 font-display text-3xl font-semibold text-rainforest">{p.price > 0 ? `$${p.price}` : 'A convenir'}</p>
            {p.description && <p className="mt-5 whitespace-pre-wrap leading-relaxed text-jungle/75">{p.description}</p>}
            {p.deliveryLocation && <p className="mt-4 text-sm uppercase tracking-[0.12em] text-jungle/50">📍 {p.kind === 'Service' ? p.deliveryLocation : `Entrega en ${p.deliveryLocation}`}</p>}

            <div className="mt-8 rounded-2xl border border-rainforest/15 bg-white p-6">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest">Vendido por</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full font-display text-sm font-semibold text-white" style={{ background: gradientFor(p.sellerId) }}>
                  {iniciales(p.sellerName)}
                </div>
                <div>
                  <p className="font-display text-base font-semibold uppercase tracking-wide text-jungle">{p.sellerName}</p>
                  <Link to={`/perfil/${p.sellerId}`} className="text-xs uppercase tracking-[0.12em] text-rainforest hover:underline">Ver perfil →</Link>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {contactoPrincipal && (
                  <a href={contactoPrincipal.href} target="_blank" rel="noopener noreferrer" className="rounded-full bg-candy px-6 py-3 font-display text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-terracotta">
                    {contactoPrincipal.label}
                  </a>
                )}
                <button onClick={compartir} className="rounded-full border border-rainforest/30 px-6 py-3 font-display text-xs font-semibold uppercase tracking-[0.15em] text-rainforest transition hover:bg-rainforest hover:text-cream">
                  Compartir
                </button>
              </div>

              {p.contact?.socialLinks?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.contact.socialLinks.map((l, i) => (
                    <a key={i} href={socialHref(l.type, l.value)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-rainforest/10 px-3 py-1 font-mono text-[0.7rem] text-rainforest hover:bg-rainforest/20">{l.value}</a>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-jungle/45">El contacto se toma del perfil del miembro. Boesh Irí no procesa pagos.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
