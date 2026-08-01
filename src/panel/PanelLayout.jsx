import { useState } from 'react'
import { NavLink, Outlet, Link, useNavigate, Navigate } from 'react-router-dom'
import { useSession, ROLES, alcanza } from '../auth/SessionContext'
import { iniciales, gradientFor } from '../utils/gradient'
import ranaUrl from '../assets/SVG/ranita_patas_espatulares.svg'

/* Íconos de navegación (line-art) */
function Ico({ name }) {
  const p = {
    home: (<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>),
    user: (<><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c0-3.6 3.4-5.5 7.5-5.5s7.5 1.9 7.5 5.5" /></>),
    doc: (<><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M9.5 12h5M9.5 16h5" /></>),
    users: (<><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-4.5 5.5-4.5S14.5 16 14.5 19" /><path d="M16 6a3 3 0 0 1 .3 5.9" /><path d="M17 14.6c1.9.6 3.3 2.2 3.3 4.4" /></>),
    folder: (<path d="M3 6h6l2 2h10v11H3z" />),
    cart: (<><circle cx="9" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /><path d="M3 4h2l2.4 12h9.8l1.9-8H6.4" /></>),
    grid: (<><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>),
    calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>),
    shield: (<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" />),
    dollar: (<><path d="M12 3v18" /><path d="M16.5 6.5c-.8-1.3-2.6-2-4.5-2s-4 1-4 3 2 2.8 4 3 4 1 4 3-2 3-4 3-3.7-.7-4.5-2" /></>),
    megaphone: (<><path d="M3 11v2l13 5V6L3 11z" /><path d="M16 8.5a4 4 0 0 1 0 7" /><path d="M7 13.5V18h3v-3.3" /></>),
    briefcase: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>),
    key: (<><circle cx="8" cy="8" r="4" /><path d="M11 11l8 8M16 16l2-2M18 18l2-2" /></>),
    list: (<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />),
    cloud: (<path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 6.96" />),
  }
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] flex-none" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {p[name]}
    </svg>
  )
}

const seccionMiembro = [
  { to: '/panel', label: 'Inicio', end: true, ico: 'home' },
  { to: '/panel/perfil', label: 'Mi perfil', ico: 'user' },
  { to: '/panel/publicaciones', label: 'Publicaciones', ico: 'doc' },
  { to: '/panel/grupos', label: 'Grupos', ico: 'users' },
  { to: '/panel/documentos', label: 'Documentos', ico: 'folder' },
  { to: '/panel/marketplace', label: 'Mi marketplace', ico: 'cart' },
]
const seccionAdmin = [
  { to: '/panel/admin/miembros', label: 'Miembros', ico: 'users' },
  { to: '/panel/admin/comisiones', label: 'Comisiones', ico: 'grid' },
  { to: '/panel/admin/eventos', label: 'Eventos', ico: 'calendar' },
  { to: '/panel/admin/moderacion', label: 'Moderación', ico: 'shield' },
  { to: '/panel/admin/finanzas', label: 'Finanzas', ico: 'dollar' },
  { to: '/panel/admin/transparencia', label: 'Transparencia', ico: 'megaphone' },
  { to: '/panel/admin/junta', label: 'Espacio Junta', ico: 'briefcase' },
]
const seccionSuper = [
  { to: '/panel/super/roles', label: 'Roles y permisos', ico: 'key' },
  { to: '/panel/super/auditoria', label: 'Auditoría', ico: 'list' },
  { to: '/panel/super/archivos', label: 'Gestor de archivos', ico: 'cloud' },
]

function NavSeccion({ titulo, items, onNavigate }) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-tea/35">{titulo}</p>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink to={it.to} end={it.end} onClick={onNavigate}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-caribbean/12 font-semibold text-caribbean' : 'text-tea/65 hover:bg-tea/5 hover:text-tea'}`}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-caribbean" />}
                  <Ico name={it.ico} />
                  <span className="truncate">{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SidebarBody({ rol, onNavigate }) {
  return (
    <>
      <NavSeccion titulo="Miembro" items={seccionMiembro} onNavigate={onNavigate} />
      {alcanza(rol, 'junta') && <NavSeccion titulo="Administración" items={seccionAdmin} onNavigate={onNavigate} />}
      {alcanza(rol, 'superadmin') && <NavSeccion titulo="Sistema" items={seccionSuper} onNavigate={onNavigate} />}
    </>
  )
}

function SidebarFooter({ rol, onSalir }) {
  return (
    <div className="relative mt-6 border-t border-tea/10 pt-4">
      <div className="mb-3 rounded-xl border border-tea/10 bg-black/20 px-3 py-2.5">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-tea/40">Sesión activa</p>
        <p className="mt-0.5 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-caribbean">
          <span className="h-1.5 w-1.5 rounded-full bg-caribbean" />{ROLES[rol].label}
        </p>
      </div>
      <button type="button" onClick={onSalir} className="w-full rounded-lg border border-tea/15 px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-tea/70 transition hover:border-candy hover:text-candy">
        Cerrar sesión
      </button>
    </div>
  )
}

export default function PanelLayout() {
  const { rol, user, logout, loading } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-jungle-deep text-tea/60">Cargando…</div>
  if (!user) return <Navigate to="/login" replace />

  const salir = () => { logout(); navigate('/login') }
  const closeMobile = () => setOpen(false)

  return (
    <div className="min-h-screen bg-jungle-deep text-tea lg:flex">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-none flex-col overflow-hidden border-r border-tea/10 bg-jungle px-4 py-6 lg:flex">
        <img src={ranaUrl} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-56 w-auto opacity-[0.05]" />
        <Link to="/panel" className="relative mb-8 flex items-center gap-2 px-2">
          <img src={ranaUrl} alt="" className="h-7 w-auto" />
          <span className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Boesh Irí</span>
        </Link>
        <nav className="relative flex-1 overflow-y-auto">
          <SidebarBody rol={rol} onNavigate={closeMobile} />
        </nav>
        <SidebarFooter rol={rol} onSalir={salir} />
      </aside>

      {/* Contenido */}
      <div className="flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-tea/10 bg-jungle-deep/90 px-5 py-3 backdrop-blur">
          <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg border border-tea/15 px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-tea lg:hidden">
            <span className="text-base leading-none">≡</span> Menú
          </button>
          <Link to="/" className="hidden font-mono text-xs uppercase tracking-[0.15em] text-tea/45 transition hover:text-caribbean lg:block">← Ver sitio público</Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-display text-sm font-semibold uppercase tracking-wide text-cream">{user.fullName}</p>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-caribbean">{ROLES[rol].label}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-semibold text-jungle" style={{ background: gradientFor(user.id) }}>
              {iniciales(user.fullName)}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8">
          <Outlet />
        </main>
      </div>

      {/* Drawer móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-jungle-deep/70 backdrop-blur-sm" onClick={closeMobile} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-hidden border-r border-tea/10 bg-jungle px-4 py-6">
            <img src={ranaUrl} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-8 h-64 w-auto opacity-[0.06]" />
            <div className="relative mb-8 flex items-center justify-between px-2">
              <span className="flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide text-cream">
                <img src={ranaUrl} alt="" className="h-7 w-auto" /> Boesh Irí
              </span>
              <button type="button" onClick={closeMobile} className="text-2xl text-tea/60">×</button>
            </div>
            <nav className="relative flex-1 overflow-y-auto">
              <SidebarBody rol={rol} onNavigate={closeMobile} />
            </nav>
            <SidebarFooter rol={rol} onSalir={salir} />
          </aside>
        </div>
      )}
    </div>
  )
}
