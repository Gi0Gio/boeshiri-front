import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link, Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../auth/SessionContext'
import { puedeVer } from './acceso'
import { Avatar } from './ui'
import Ico from './Ico'
import { SinLeerProvider, useSinLeer } from './avisos'
import FrogIcon from '../components/FrogIcon'
import EstadoCuenta from './EstadoCuenta'

/* ── Qué hay en cada sombrero ───────────────────────────────── */

/** «Lo mío»: lo que hace cualquier miembro a diario. Cuatro cosas, nada más. */
const navMio = [
  { to: '/panel', label: 'Inicio', ico: 'home', end: true },
  { to: '/panel/grupos', label: 'Grupos', ico: 'users' },
  { to: '/panel/publicar', label: 'Publicar', ico: 'plus' },
  { to: '/panel/avisos', label: 'Avisos', ico: 'bell', avisos: true },
]

/** «Junta»: lo diario delante; lo ocasional, en «Más». */
const navJunta = [
  { to: '/panel/admin', label: 'Pendientes', ico: 'inbox', end: true },
  { to: '/panel/admin/miembros', label: 'Personas', ico: 'users' },
  { to: '/panel/admin/comisiones', label: 'Comisiones', ico: 'grid' },
  { to: '/panel/admin/eventos', label: 'Agenda', ico: 'calendar' },
]
const masJunta = [
  { to: '/panel/admin/moderacion', label: 'Moderación', ico: 'shield' },
  { to: '/panel/admin/finanzas', label: 'Finanzas', ico: 'dollar' },
  { to: '/panel/admin/transparencia', label: 'Transparencia', ico: 'megaphone' },
  { to: '/panel/admin/convocatorias', label: 'Convocatorias', ico: 'formulario' },
]
const sistema = [
  { to: '/panel/super/roles', label: 'Roles y permisos', ico: 'key' },
  { to: '/panel/super/auditoria', label: 'Auditoría', ico: 'list' },
  { to: '/panel/super/archivos', label: 'Archivos', ico: 'cloud' },
]

/** Lo personal que no es diario: vive tras el avatar, no en la barra. */
const tuyo = [
  { to: '/panel/perfil', label: 'Mi perfil', ico: 'user' },
  { to: '/panel/publicaciones', label: 'Mis publicaciones', ico: 'list' },
  { to: '/panel/marketplace', label: 'Mi marketplace', ico: 'cart' },
  { to: '/panel/documentos', label: 'Documentos', ico: 'folder' },
]

const esJunta = (path) => path.startsWith('/panel/admin') || path.startsWith('/panel/super')

/** Los roles que dan algo más que ser miembro («Tesorero · Periodista»); si no hay, «Miembro». */
const etiquetaRoles = (roles = []) => roles.filter((r) => r !== 'Miembro').join(' · ') || 'Miembro'

/* ── Piezas ─────────────────────────────────────────────────── */

/**
 * El interruptor de sombrero. Son dos enlaces, no un toggle: cada modo tiene su
 * propia portada y se puede volver con «atrás».
 */
function Sombreros({ modo, inicioJunta, className = '' }) {
  const base = 'flex min-h-11 flex-1 items-center justify-center rounded-full px-4 font-display text-sm font-semibold uppercase tracking-[0.14em] transition-colors'
  return (
    <div className={`flex rounded-full border border-tea/15 bg-tea/5 p-1 ${className}`} role="group" aria-label="Modo del panel">
      <Link to="/panel" aria-current={modo === 'mio' ? 'page' : undefined}
        className={`${base} ${modo === 'mio' ? 'bg-caribbean text-jungle' : 'text-tea/70 hover:text-tea'}`}>
        Lo mío
      </Link>
      <Link to={inicioJunta} aria-current={modo === 'junta' ? 'page' : undefined}
        className={`${base} ${modo === 'junta' ? 'bg-caribbean text-jungle' : 'text-tea/70 hover:text-tea'}`}>
        Junta
      </Link>
    </div>
  )
}

function Insignia({ n }) {
  if (!n) return null
  return (
    <span className="absolute -right-2 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-candy px-1 font-mono text-xs font-bold leading-none text-white">
      {n > 9 ? '9+' : n}
    </span>
  )
}

/** Barra inferior para el pulgar (móvil). */
function BarraInferior({ items, extra, sinLeer }) {
  return (
    <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-40 border-t border-tea/10 bg-jungle/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-lg">
        {items.map((it) => (
          <li key={it.to} className="flex-1">
            <NavLink to={it.to} end={it.end}
              className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${isActive ? 'text-caribbean' : 'text-tea/70 hover:text-tea'}`}>
              <span className="relative"><Ico name={it.ico} /><Insignia n={it.avisos ? sinLeer : 0} /></span>
              {it.label}
            </NavLink>
          </li>
        ))}
        {extra && <li className="flex-1">{extra}</li>}
      </ul>
    </nav>
  )
}

/* ── Riel de escritorio ─────────────────────────────────────── */

/**
 * El riel vive compacto (72px, solo íconos) y se despliega a 256px POR ENCIMA del
 * contenido, que no se mueve. Abre tras una pausa corta para que cruzar el borde
 * con el mouse no lo haga saltar; con el teclado abre al llegar con Tab y Escape
 * lo pliega.
 */
function useDespliegue() {
  const [abierto, setAbierto] = useState(false)
  const reloj = useRef(null)
  const programar = (valor, ms) => {
    clearTimeout(reloj.current)
    reloj.current = setTimeout(() => setAbierto(valor), ms)
  }
  useEffect(() => () => clearTimeout(reloj.current), [])

  return {
    abierto,
    eventos: {
      onMouseEnter: () => programar(true, 150),
      onMouseLeave: () => programar(false, 120),
      onFocus: (e) => {
        if (!e.target.matches(':focus-visible')) return
        clearTimeout(reloj.current)
        setAbierto(true)
      },
      onBlur: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) programar(false, 0) },
      onKeyDown: (e) => {
        if (e.key !== 'Escape') return
        clearTimeout(reloj.current)
        setAbierto(false)
      },
    },
  }
}

/** Lo que solo se lee con el riel abierto: sigue en el DOM (es el nombre accesible), visible al desplegar. */
const soloAbierto = (abierto) =>
  `whitespace-nowrap transition-opacity duration-150 ${abierto ? 'opacity-100 delay-75' : 'opacity-0'}`

/** Fila del riel: el ícono queda centrado en los 72px y la etiqueta aparece a su derecha. */
function FilaRiel({ it, abierto, sinLeer = 0 }) {
  const n = it.avisos ? sinLeer : 0
  return (
    <NavLink to={it.to} end={it.end}
      className={({ isActive }) => `flex h-11 items-center gap-3 rounded-xl px-[14px] text-sm transition-colors ${isActive ? 'bg-caribbean/12 font-semibold text-caribbean' : 'text-tea/80 hover:bg-tea/5 hover:text-tea'}`}>
      <span className="relative flex-none">
        <Ico name={it.ico} className="h-5 w-5" />
        {/* Plegado, el contador se reduce a un punto; abierto, vuelve el número. */}
        {n > 0 && (
          <span aria-hidden="true" className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-candy ring-2 ring-jungle transition-opacity duration-150 ${abierto ? 'opacity-0' : 'opacity-100'}`} />
        )}
      </span>
      <span className={`flex-1 truncate ${soloAbierto(abierto)}`}>{it.label}</span>
      {n > 0 && (
        <>
          <span aria-hidden="true" className={`rounded-full bg-candy px-2 py-0.5 font-mono text-xs font-bold text-white ${soloAbierto(abierto)}`}>{n > 9 ? '9+' : n}</span>
          <span className="sr-only">, {n} sin leer</span>
        </>
      )}
    </NavLink>
  )
}

/** Grupo del riel. Plegado, su título se vuelve un filo; abierto, se lee. */
function GrupoRiel({ titulo, items, abierto, sinLeer }) {
  return (
    <div className="mb-2">
      {titulo && (
        <div className="relative mb-1 mt-3 flex h-7 items-center px-[14px]">
          <span aria-hidden="true" className={`absolute inset-x-3 top-1/2 h-px bg-tea/15 transition-opacity duration-150 ${abierto ? 'opacity-0' : 'opacity-100'}`} />
          <p className={`text-xs font-semibold text-tea/70 ${soloAbierto(abierto)}`}>{titulo}</p>
        </div>
      )}
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.to}><FilaRiel it={it} abierto={abierto} sinLeer={sinLeer} /></li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Los sombreros en el riel: una cápsula vertical con dos botones de ícono (hoja y
 * sol), siempre a un clic aunque el riel esté plegado. Al desplegar se lee el nombre.
 */
function SombrerosRiel({ modo, inicioJunta, abierto }) {
  const boton = (activo) =>
    `flex h-11 items-center gap-3 rounded-full px-[11px] font-display text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${activo ? 'bg-caribbean text-jungle' : 'text-tea/70 hover:bg-tea/5 hover:text-tea'}`
  return (
    <div role="group" aria-label="Modo del panel" className="mb-4 flex flex-col gap-0.5 rounded-[24px] border border-tea/15 bg-tea/5 p-[3px]">
      <Link to="/panel" aria-current={modo === 'mio' ? 'page' : undefined} className={boton(modo === 'mio')}>
        <Ico name="hoja" className="h-5 w-5 flex-none" />
        <span className={soloAbierto(abierto)}>Lo mío</span>
      </Link>
      <Link to={inicioJunta} aria-current={modo === 'junta' ? 'page' : undefined} className={boton(modo === 'junta')}>
        <Ico name="sol" className="h-5 w-5 flex-none" />
        <span className={soloAbierto(abierto)}>Junta</span>
      </Link>
    </div>
  )
}

/**
 * Hoja que sube desde abajo (móvil): para «Más» de la Junta y para lo tuyo.
 * Escape y tocar fuera la cierran; mientras está abierta, la página no se mueve.
 */
function Hoja({ abierta, onCerrar, titulo, children }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!abierta) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector('a, button')?.focus()
    const tecla = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', tecla)
    return () => {
      document.body.style.overflow = previo
      document.removeEventListener('keydown', tecla)
    }
  }, [abierta, onCerrar])

  if (!abierta) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-jungle-deep/70 backdrop-blur-sm" onClick={onCerrar} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={titulo}
        className="hoja-sube absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-tea/10 bg-jungle px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-tea/15" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

function ListaHoja({ items, onNavigate }) {
  return (
    <ul>
      {items.map((it) => (
        <li key={it.to}>
          <NavLink to={it.to} onClick={onNavigate}
            className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-3 text-base transition-colors ${isActive ? 'bg-caribbean/12 font-semibold text-caribbean' : 'text-tea hover:bg-tea/5'}`}>
            <Ico name={it.ico} className="h-5 w-5" />
            {it.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

/* ── Armazón ────────────────────────────────────────────────── */

function Armazon() {
  const { user, hasPermission } = useSession()
  const { pathname } = useLocation()
  const { sinLeer } = useSinLeer()
  const [hoja, setHoja] = useState(null) // 'mas' | 'tu' | null
  const despliegue = useDespliegue()
  const { abierto } = despliegue

  // Cada quien ve solo las páginas que su suma de roles le abre. Lo que cabe va a
  // la barra (cuatro como mucho) y el resto a «Más»: a un Tesorero, Finanzas le
  // queda delante en vez de escondida tras «Más».
  const ve = (it) => puedeVer(it.to, hasPermission)
  const deJunta = [...navJunta, ...masJunta].filter(ve)
  const principalesJunta = deJunta.slice(0, 4)
  const masVisibles = deJunta.slice(4)
  const sistemaVisible = sistema.filter(ve)
  const inicioJunta = [...deJunta, ...sistemaVisible][0]?.to
  const puedeJunta = Boolean(inicioJunta)

  const modo = puedeJunta && esJunta(pathname) ? 'junta' : 'mio'
  const items = modo === 'junta' ? principalesJunta : navMio
  const cerrar = () => setHoja(null)

  // Cambiar de página cierra cualquier hoja abierta.
  useEffect(() => { setHoja(null) }, [pathname])

  // Escribir a mano la dirección de una página sin permiso devuelve al inicio, en
  // vez de enseñar una pantalla que la API va a llenar de errores 403.
  if (!puedeVer(pathname, hasPermission)) return <Navigate to="/panel" replace />

  return (
    <div className={`panel-casa min-h-screen bg-jungle-deep text-tea ${modo === 'mio' ? 'modo-mio' : 'modo-junta bg-dorace-pattern'}`}>
      {/* ── Riel (escritorio) ── */}
      <aside {...despliegue.eventos} data-abierto={abierto}
        className={`riel-panel fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden border-r border-tea/10 bg-jungle px-3 py-5 lg:flex ${abierto ? 'w-64 shadow-[12px_0_32px_-12px_rgba(0,17,14,0.45)]' : 'w-[72px]'}`}>
        <Link to="/" className="mb-5 flex h-11 items-center gap-3 rounded-xl px-[10px]" aria-label="Ir al sitio de Boesh Irí">
          <FrogIcon className="h-7 w-7 flex-none text-caribbean" />
          <span aria-hidden="true" className={`font-display text-lg font-semibold uppercase tracking-wide text-cream ${soloAbierto(abierto)}`}>Boesh Irí</span>
        </Link>
        {puedeJunta && <SombrerosRiel modo={modo} inicioJunta={inicioJunta} abierto={abierto} />}
        <nav aria-label="Secciones" className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <GrupoRiel items={items} abierto={abierto} sinLeer={sinLeer} />
          {modo === 'junta' && masVisibles.length > 0 && <GrupoRiel titulo="Más" items={masVisibles} abierto={abierto} />}
          {modo === 'junta' && sistemaVisible.length > 0 && <GrupoRiel titulo="Sistema" items={sistemaVisible} abierto={abierto} />}
          {modo === 'mio' && <GrupoRiel titulo="Lo tuyo" items={tuyo} abierto={abierto} />}
        </nav>
        <Link to="/" className="mt-2 flex h-11 items-center gap-3 rounded-xl px-[14px] text-sm text-tea/80 transition-colors hover:bg-tea/5 hover:text-tea">
          <Ico name="atras" className="h-5 w-5 flex-none" />
          <span className={soloAbierto(abierto)}>Volver al sitio público</span>
        </Link>
        <div className="mt-2 flex items-center gap-3 border-t border-tea/10 px-0.5 pt-4">
          <Avatar id={user.id} nombre={user.fullName} size="md" />
          <div className={`min-w-0 flex-1 ${soloAbierto(abierto)}`}>
            <p className="truncate text-sm font-semibold text-cream">{user.fullName}</p>
            <p className="truncate text-xs text-tea/70">{etiquetaRoles(user.roles)}</p>
          </div>
        </div>
      </aside>

      {/* ── Barra superior (móvil) ── */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-tea/10 bg-jungle/95 px-4 py-2 backdrop-blur lg:hidden">
        {/* Volver al sitio público, a la vista: antes era una rana sola que no
            parecía un botón. Flecha + rana se leen como «salir a la casa». */}
        <Link to="/" className="flex h-11 flex-none items-center gap-0.5 rounded-full border border-tea/15 pl-2 pr-2.5 text-caribbean transition hover:border-caribbean/50" aria-label="Volver al sitio público">
          <Ico name="atras" className="h-4 w-4" />
          <FrogIcon className="h-6 w-6" />
        </Link>
        {puedeJunta ? <Sombreros modo={modo} inicioJunta={inicioJunta} className="flex-1" /> : (
          // El saludo ya está en el título de Inicio: aquí, el nombre de la casa.
          <p className="flex-1 font-display text-lg font-semibold uppercase tracking-wide text-cream">Boesh Irí</p>
        )}
        <button type="button" onClick={() => setHoja('tu')} className="flex h-11 w-11 flex-none items-center justify-center rounded-full" aria-label="Tu cuenta">
          <Avatar id={user.id} nombre={user.fullName} size="sm" />
        </button>
      </header>

      {/* Una sola columna de lectura en los dos modos: el panel se lee de arriba
          abajo, también en escritorio, y así el pulgar y el ratón ven lo mismo. */}
      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-[72px] lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </main>

      <BarraInferior
        items={items}
        sinLeer={sinLeer}
        extra={modo === 'junta' && (masVisibles.length > 0 || sistemaVisible.length > 0) && (
          <button type="button" onClick={() => setHoja('mas')} aria-expanded={hoja === 'mas'}
            className="flex min-h-16 w-full flex-col items-center justify-center gap-1 text-xs font-semibold text-tea/70 transition-colors hover:text-tea">
            <Ico name="dots" />
            Más
          </button>
        )}
      />

      <Hoja abierta={hoja === 'mas'} onCerrar={cerrar} titulo="Más de la Junta">
        <ListaHoja items={masVisibles} onNavigate={cerrar} />
        {sistemaVisible.length > 0 && (
          <>
            <p className={`mb-1 px-3 text-xs font-semibold text-tea/70 ${masVisibles.length > 0 ? 'mt-4' : ''}`}>Sistema</p>
            <ListaHoja items={sistemaVisible} onNavigate={cerrar} />
          </>
        )}
        <div className="mt-3 border-t border-tea/10 pt-3">
          <Link to="/" onClick={cerrar} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base text-tea hover:bg-tea/5">
            <Ico name="atras" className="h-5 w-5" /> Volver al sitio público
          </Link>
        </div>
      </Hoja>

      <Hoja abierta={hoja === 'tu'} onCerrar={cerrar} titulo="Tu cuenta">
        <div className="mb-3 flex items-center gap-3 px-3">
          <Avatar id={user.id} nombre={user.fullName} size="md" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-cream">{user.fullName}</p>
            <p className="truncate text-sm text-tea/70">{etiquetaRoles(user.roles)}</p>
          </div>
        </div>
        <ListaHoja items={tuyo} onNavigate={cerrar} />
        <div className="mt-3 border-t border-tea/10 pt-3">
          <Link to="/" onClick={cerrar} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base text-tea hover:bg-tea/5">
            <Ico name="atras" className="h-5 w-5" /> Volver al sitio público
          </Link>
        </div>
      </Hoja>

    </div>
  )
}

export default function PanelLayout() {
  const { user, loading } = useSession()
  const { pathname, search } = useLocation()
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-cream text-jungle/70">Cargando…</div>
  // Sin sesión se pasa por el login y se vuelve aquí: un enlace a un grupo
  // compartido por WhatsApp tiene que acabar en ese grupo, no en el inicio.
  if (!user) return <Navigate to={`/login?volver=${encodeURIComponent(pathname + search)}`} replace />
  // Postulantes e inactivos no tienen panel: la API les niega grupos, gritos y
  // tareas, y antes veían cada sección fallar.
  if (user.status !== 'Active') return <EstadoCuenta />
  return (
    <SinLeerProvider>
      <Armazon />
    </SinLeerProvider>
  )
}
