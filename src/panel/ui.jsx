/**
 * Sistema de UI del panel — dirección "sala de control" (oscuro).
 * Lienzo jungle-deep, superficies en jungle, acentos caribbean/tea, datos en mono.
 */
import Reveal from '../components/Reveal'
import { gradientFor, iniciales } from '../utils/gradient'

const chipTone = {
  caribbean: 'bg-caribbean/15 text-caribbean',
  tea: 'bg-tea/15 text-tea',
  terracotta: 'bg-terracotta/20 text-terracotta',
  candy: 'bg-candy/20 text-candy',
  rainforest: 'bg-rainforest/30 text-tea',
  gris: 'bg-tea/10 text-tea/55',
  // Sobre una foto no se puede contar con el lienzo oscuro del panel: los tonos
  // translúcidos desaparecen en cuanto la imagen es clara. Estos van opacos.
  foto: 'bg-jungle-deep/80 text-cream ring-1 ring-white/15 backdrop-blur-sm',
  fotoAcento: 'bg-caribbean text-jungle-deep',
}

export function Chip({ tone = 'gris', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] ${chipTone[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-caribbean">{eyebrow}</p>}
        <h1 className="mt-1.5 font-display text-3xl font-semibold uppercase tracking-wide text-cream md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tea/50">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-tea/10 bg-jungle p-6 ${className}`}>{children}</div>
}

export function Stat({ valor, etiqueta, tono = '#00e6bc' }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-tea/10 bg-jungle p-6">
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full" style={{ background: `radial-gradient(closest-side, ${tono}38, transparent 70%)` }} />
      <p className="relative font-display text-4xl font-semibold" style={{ color: tono }}>{valor}</p>
      <p className="relative mt-1 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-tea/50">{etiqueta}</p>
    </div>
  )
}

const AVATAR_TAM = { xs: 'h-7 w-7 text-[0.6rem]', sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-14 w-14 text-base' }

/**
 * Cara de una persona. Sin foto cae al gradiente de marca con las iniciales:
 * un hueco gris repetido convierte cualquier lista de gente en una lista de
 * filas, y lo que se quiere aquí es reconocer a alguien de un vistazo.
 */
export function Avatar({ id, nombre, foto, size = 'sm', className = '' }) {
  const base = `flex flex-none items-center justify-center overflow-hidden rounded-full font-display font-semibold uppercase text-white/90 ${AVATAR_TAM[size]} ${className}`

  if (foto) return <img src={foto} alt={nombre || ''} title={nombre} className={`${base} object-cover`} />

  return (
    <span className={base} style={{ background: gradientFor(id || nombre || '') }} title={nombre}>
      {iniciales(nombre)}
    </span>
  )
}

/**
 * Pila de caras solapadas con un «+N» al final. Comunica el tamaño de un grupo
 * más rápido que el número suelto, y sin ocupar una lista entera.
 */
export function AvatarStack({ personas, max = 5, size = 'sm' }) {
  const visibles = personas.slice(0, max)
  const resto = personas.length - visibles.length

  return (
    <div className="flex items-center">
      {visibles.map((p, i) => (
        <span key={p.id ?? p.userId ?? i} className={i > 0 ? '-ml-2' : ''}>
          <Avatar id={p.id ?? p.userId} nombre={p.name ?? p.fullName} foto={p.photoUrl} size={size} className="ring-2 ring-jungle" />
        </span>
      ))}
      {resto > 0 && (
        <span className={`-ml-2 flex flex-none items-center justify-center rounded-full bg-tea/12 font-mono font-semibold text-tea/60 ring-2 ring-jungle ${AVATAR_TAM[size]}`}>
          +{resto}
        </span>
      )}
    </div>
  )
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-medium text-tea">{label}</span>
        {hint && <span className="block text-xs text-tea/40">{hint}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 flex-none rounded-full transition-colors ${checked ? 'bg-caribbean' : 'bg-tea/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow transition-transform ${checked ? 'left-0.5 translate-x-5' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

export function Btn({ as: Tag = 'button', tone = 'primary', className = '', children, ...props }) {
  const tones = {
    primary: 'bg-caribbean text-jungle hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,230,188,0.3)]',
    ghost: 'border border-tea/25 text-tea hover:border-caribbean hover:text-caribbean',
    candy: 'bg-candy text-white hover:bg-terracotta hover:-translate-y-0.5',
  }
  return (
    <Tag className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition ${tones[tone]} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function DemoNote({ children }) {
  return <p className="mt-10 text-center font-mono text-xs italic text-tea/30">{children || 'Contenido de ejemplo — prototipo sin backend.'}</p>
}

/* ── Tabla ─────────────────────────────────────────────────── */
export function Table({ children, minW = '560px', className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-tea/10 bg-jungle ${className}`}>
      <table className="w-full text-left text-sm" style={{ minWidth: minW }}>{children}</table>
    </div>
  )
}
export function Th({ children, className = '' }) {
  return <th className={`border-b border-tea/10 bg-black/20 px-5 py-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-tea/45 ${className}`}>{children}</th>
}
export function Td({ children, className = '', ...props }) {
  return <td className={`px-5 py-3 text-tea/80 ${className}`} {...props}>{children}</td>
}
export function Tr({ children, className = '' }) {
  return <tr className={`border-b border-tea/5 transition-colors last:border-0 hover:bg-tea/[0.04] ${className}`}>{children}</tr>
}

/* ── Pestañas ──────────────────────────────────────────────── */
export function PillTabs({ tabs, active, onChange }) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => {
        const id = t.id ?? t
        const label = t.label ?? t
        return (
          <button key={id} onClick={() => onChange(id)} className={`flex-none rounded-full px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${active === id ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/55 hover:bg-tea/15 hover:text-tea'}`}>
            {label}
            {t.badge ? <span className="ml-2 rounded-full bg-candy px-1.5 text-[0.6rem] text-white">{t.badge}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

/* ── Acciones inline de fila/card ──────────────────────────── */
export function RowActions({ items }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide">
      {items.map((a) => (
        <button key={a} className={a === 'Eliminar' ? 'text-candy hover:underline' : 'text-caribbean/80 hover:text-caribbean'}>{a}</button>
      ))}
    </div>
  )
}

export const inputCls =
  'w-full rounded-xl border border-tea/15 bg-jungle-deep/60 px-4 py-2.5 text-sm text-tea placeholder:text-tea/35 focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/25'
export const labelCls = 'font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-caribbean'

export { Reveal }
