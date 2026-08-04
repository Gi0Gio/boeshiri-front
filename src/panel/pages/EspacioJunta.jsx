import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Reveal } from '../ui'
import { documentsApi } from '../../api/documents'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'

/* Ícono line-art reutilizado del nav */
function Ico({ d }) {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
}

const herramientas = [
  { to: '/panel/admin/transparencia', label: 'Transparencia', desc: 'Publicar artículos oficiales', perm: 'transparencia.gestionar', ico: <><path d="M3 11v2l13 5V6L3 11z" /><path d="M16 8.5a4 4 0 0 1 0 7" /></> },
  { to: '/panel/admin/finanzas', label: 'Finanzas', desc: 'Balance y movimientos', perm: 'finanzas.ver', ico: <><path d="M12 3v18" /><path d="M16.5 6.5c-.8-1.3-2.6-2-4.5-2s-4 1-4 3 2 2.8 4 3 4 1 4 3-2 3-4 3-3.7-.7-4.5-2" /></> },
  { to: '/panel/admin/moderacion', label: 'Moderación', desc: 'Revisar publicaciones y marketplace', perm: 'publicaciones.moderar', ico: <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" /> },
  { to: '/panel/admin/miembros', label: 'Postulantes', desc: 'Aceptar o rechazar ingresos', perm: 'postulantes.decidir', ico: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-4.5 5.5-4.5S14.5 16 14.5 19" /><path d="M16 6a3 3 0 0 1 .3 5.9" /></> },
  { to: '/panel/admin/comisiones', label: 'Comisiones', desc: 'Gestionar áreas y equipos', perm: 'comisiones.ver_todas', ico: <><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></> },
  { to: '/panel/admin/eventos', label: 'Eventos', desc: 'Crear y gestionar eventos', perm: 'eventos.gestionar', ico: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></> },
]

export default function EspacioJunta() {
  const { hasPermission } = useSession()
  const verBiblioteca = hasPermission('documentos.ver_admin')
  const { data: docs, loading, error } = useFetch(() => (verBiblioteca ? documentsApi.list() : Promise.resolve([])), [verBiblioteca])

  // Solo el conteo: el listado vive en Documentos. Tenerlo también aquí obligaba
  // a mantener dos diseños del mismo archivo y dejaba sin claro cuál es el bueno.
  const reservados = (docs ?? []).filter((d) => d.accessLevel === 'Administration').length
  const tools = herramientas.filter((h) => hasPermission(h.perm))

  return (
    <>
      <PageHeader eyebrow="Junta Directiva" title="Espacio de la Junta" description="Punto de partida de la Junta: la biblioteca de Administración y acceso directo a las herramientas de gestión." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Biblioteca de la Junta (documentos de nivel Administración) */}
        <Reveal>
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Documentos de la Junta</h2>
            <p className="mt-1 text-xs text-tea/45">Cartas membretadas, actas y todo lo que no sale de la Junta.</p>

            {!verBiblioteca ? (
              <p className="mt-4 text-sm text-tea/55">Tu rol no tiene acceso a los documentos reservados.</p>
            ) : (
              <>
                <p className="mt-6 font-display text-5xl font-semibold text-caribbean">
                  {loading ? '·' : error ? '—' : reservados}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-tea/50">
                  {reservados === 1 ? 'archivo reservado' : 'archivos reservados'}
                </p>
                {error && <p className="mt-3 text-sm text-candy">No se pudo consultar la biblioteca.</p>}
                <Link
                  to="/panel/documentos#junta"
                  className="mt-6 inline-block rounded-full bg-caribbean/15 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-caribbean transition hover:bg-caribbean hover:text-jungle"
                >
                  Abrir el estante →
                </Link>
                <p className="mt-4 text-xs leading-relaxed text-tea/40">
                  Los archivos viven en <strong className="text-tea/60">Documentos</strong>, junto a los recursos
                  para toda la membresía. Ahí se suben, se reemplazan y se descargan.
                </p>
              </>
            )}
          </Card>
        </Reveal>

        {/* Herramientas de la Junta */}
        <Reveal delay={100}>
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Herramientas de la Junta</h2>
            <p className="mt-1 text-xs text-tea/45">Acceso directo a las áreas de gestión según tus permisos.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {tools.length === 0 && <p className="text-sm text-tea/55">Tu rol no tiene herramientas de gestión asignadas.</p>}
              {tools.map((h) => (
                <Link key={h.to} to={h.to} className="group flex items-start gap-3 rounded-xl border border-tea/10 bg-black/10 p-4 transition hover:-translate-y-0.5 hover:border-caribbean/40 hover:bg-caribbean/[0.06]">
                  <span className="mt-0.5 text-caribbean"><Ico d={h.ico} /></span>
                  <div>
                    <p className="font-display text-sm font-semibold uppercase tracking-wide text-caribbean">{h.label}</p>
                    <p className="mt-0.5 text-xs text-tea/50">{h.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={160} className="mt-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Comunicaciones oficiales</h2>
              <p className="mt-1 text-sm text-tea/60">Los anuncios oficiales a los miembros se publican desde <strong className="text-tea/80">Transparencia</strong> (notifican a cada integrante en su panel).</p>
            </div>
            <Chip tone="gris">Bitácora interna de decisiones · próximamente</Chip>
          </div>
        </Card>
      </Reveal>
    </>
  )
}
