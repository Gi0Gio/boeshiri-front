import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import ranaUrl from '../assets/SVG/ranita_patas_espatulares.svg'
import logoUrl from '../assets/SVG/LOGOS/LOGO BOESH HORIZONTAL VERDE CARIBE.svg'
import { useSession } from '../auth/SessionContext'
import { iniciales } from '../utils/gradient'

// Sin «Inicio»: el logo ya lleva a la portada, y su hueco lo ocupa Comunidad,
// que antes solo se encontraba desde Sobre o desde una pestaña de Explorar.
const links = [
  { to: '/sobre', label: 'Sobre' },
  { to: '/comunidad', label: 'Comunidad' },
  { to: '/explorar', label: 'Explorar' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout, loading } = useSession()
  const navigate = useNavigate()
  const botonRef = useRef(null)
  const panelRef = useRef(null)

  /* Con el menú abierto la página de debajo no se mueve, Escape lo cierra y el
     foco entra al primer enlace; al cerrar, el foco vuelve al botón para que el
     teclado no se pierda en mitad de la página. */
  useEffect(() => {
    if (!open) return
    const boton = botonRef.current
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('a, button')?.focus()

    const alTeclear = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.body.style.overflow = overflowPrevio
      document.removeEventListener('keydown', alTeclear)
      boton?.focus({ preventScroll: true })
    }
  }, [open])

  const salir = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `font-display text-sm uppercase tracking-[0.18em] transition-colors hover:text-caribbean ${
      isActive ? 'text-caribbean' : 'text-tea'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-tea/10 bg-jungle/95">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="group flex min-h-11 items-center" onClick={() => setOpen(false)}>
          <img src={logoUrl} alt="Boesh Irí" className="h-9 w-auto transition-opacity duration-300 group-hover:opacity-80" />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {/* Sección: Páginas */}
          <div className="flex items-center gap-5">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass} end={to === '/'}>{label}</NavLink>
            ))}
          </div>

          {/* Divisor entre páginas y acciones */}
          <span className="h-5 w-px bg-tea/15" aria-hidden="true" />

          {/* Sección: Acciones / sesión */}
          <div className="flex items-center gap-4">
            {loading ? null : user ? (
              <>
                <NavLink to="/panel" className={linkClass}>Mi panel</NavLink>
                <Link to="/panel/perfil" className="flex items-center gap-2 rounded-full border border-tea/15 py-1 pl-1 pr-3 transition hover:border-caribbean" title="Mi perfil">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-caribbean font-display text-xs font-semibold text-jungle">{iniciales(user.fullName)}</span>
                  <span className="max-w-[9rem] truncate font-display text-xs uppercase tracking-wide text-tea">{user.fullName.split(' ')[0]}</span>
                </Link>
                <button onClick={salir} className="font-mono text-xs uppercase tracking-[0.12em] text-tea/70 transition hover:text-candy">Salir</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>Entrar</NavLink>
                <Link to="/postularme" className="rounded-full bg-candy px-5 py-2 font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-terracotta">Postular</Link>
              </>
            )}
          </div>
        </div>

        <button ref={botonRef} type="button" className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden" aria-expanded={open} aria-controls="menu-movil" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen((v) => !v)}>
          <span className={`h-0.5 w-6 bg-tea transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-tea transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-tea transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {open && (
        // Ocupa todo lo que queda bajo la barra: un menú a media pantalla deja la
        // página asomando debajo y parece que se puede seguir usando.
        <div id="menu-movil" ref={panelRef} className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain border-t border-tea/10 bg-jungle lg:hidden">
          <img src={ranaUrl} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-10 h-72 w-auto opacity-[0.07]" />
          <div className="relative flex flex-col px-6 py-5">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center justify-between border-b border-tea/10 py-3.5 font-display text-lg font-semibold uppercase tracking-[0.18em] transition-colors ${isActive ? 'text-caribbean' : 'text-tea hover:text-caribbean'}`}>
                <span>{label}</span>
              </NavLink>
            ))}
            {user ? (
              <div className="mt-5 flex flex-col gap-3">
                <NavLink to="/panel" onClick={() => setOpen(false)} className="rounded-full bg-caribbean py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle">Mi panel ({user.fullName.split(' ')[0]})</NavLink>
                <button onClick={salir} className="rounded-full border border-tea/40 py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.18em] text-tea transition hover:border-candy hover:text-candy">Cerrar sesión</button>
              </div>
            ) : (
              <div className="mt-5 flex gap-3">
                <NavLink to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-tea/40 py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.18em] text-tea transition hover:border-caribbean hover:text-caribbean">Entrar</NavLink>
                <Link to="/postularme" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-candy py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-terracotta">Postular</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
