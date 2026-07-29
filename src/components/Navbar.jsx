import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ranaUrl from '../assets/SVG/ranita_patas_espatulares.svg'
import logoUrl from '../assets/SVG/LOGOS/LOGO BOESH HORIZONTAL VERDE CARIBE.svg'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/comunidad', label: 'Comunidad' },
  { to: '/explorar', label: 'Explorar' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `font-display text-sm uppercase tracking-[0.18em] transition-colors hover:text-caribbean ${
      isActive ? 'text-caribbean' : 'text-tea'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-tea/10 bg-jungle/95">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          to="/"
          className="group flex items-center"
          onClick={() => setOpen(false)}
        >
          <img
            src={logoUrl}
            alt="Boesh Irí"
            className="h-9 w-auto transition-opacity duration-300 group-hover:opacity-80"
          />
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass} end={to === '/'}>
              {label}
            </NavLink>
          ))}
          <NavLink to="/login" className={linkClass}>
            Entrar
          </NavLink>
          <Link
            to="/postularme"
            className="rounded-full bg-candy px-5 py-2 font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-terracotta"
          >
            Postularme
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`h-0.5 w-6 bg-tea transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`h-0.5 w-6 bg-tea transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span
            className={`h-0.5 w-6 bg-tea transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </nav>

      {open && (
        <div className="relative overflow-hidden border-t border-tea/10 bg-jungle lg:hidden">
          <img src={ranaUrl} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-10 h-72 w-auto opacity-[0.07]" />
          <div className="relative flex flex-col px-6 py-5">
            {links.map(({ to, label }, i) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-tea/10 py-3.5 font-display text-lg font-semibold uppercase tracking-[0.18em] transition-colors ${
                    isActive ? 'text-caribbean' : 'text-tea hover:text-caribbean'
                  }`
                }
              >
                <span>{label}</span>
                <span className="font-mono text-xs text-tea/40">{String(i + 1).padStart(2, '0')}</span>
              </NavLink>
            ))}
            <div className="mt-5 flex gap-3">
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-tea/40 py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.18em] text-tea transition hover:border-caribbean hover:text-caribbean"
              >
                Entrar
              </NavLink>
              <Link
                to="/postularme"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-candy py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-terracotta"
              >
                Postularme
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
