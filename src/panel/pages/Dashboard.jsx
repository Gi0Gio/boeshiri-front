import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Stat, Reveal } from '../ui'
import { useSession } from '../../auth/SessionContext'
import { useFetch } from '../../hooks/useFetch'
import { publicationsApi } from '../../api/publications'
import { groupsApi } from '../../api/groups'
import { marketplaceApi } from '../../api/marketplace'
import { eventsApi } from '../../api/events'
import { notificationsApi } from '../../api/notifications'

const accesos = [
  { to: '/panel/perfil', label: 'Editar mi perfil', desc: 'Datos, privacidad y redes' },
  { to: '/panel/publicaciones', label: 'Nueva publicación', desc: 'Artículo, foto, video o música' },
  { to: '/panel/grupos', label: 'Mis grupos', desc: 'Comisiones y equipos' },
  { to: '/panel/marketplace', label: 'Mi marketplace', desc: 'Publica productos y servicios' },
]

function hace(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60) return 'hace un momento'
  const m = Math.floor(s / 60); if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60); if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24); if (d < 30) return `hace ${d} d`
  return new Date(iso).toLocaleDateString('es-PA')
}

export default function Dashboard() {
  const { user } = useSession()
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)

  const { data: pubs } = useFetch(() => publicationsApi.mine())
  const { data: grupos } = useFetch(() => groupsApi.mine())
  const { data: prods } = useFetch(() => marketplaceApi.mine())
  const { data: historial } = useFetch(() => eventsApi.myHistory())
  const { data: avisos, loading: la } = useFetch(() => notificationsApi.list(), [version])

  const notificaciones = avisos ?? []

  async function marcar(id) {
    try { await notificationsApi.markRead(id); reload() } catch { /* silencioso */ }
  }

  return (
    <>
      <PageHeader
        eyebrow="Panel del miembro"
        title={`Hola, ${(user?.fullName || 'miembro').split(' ')[0]}`}
        description="Tu centro de control en Boesh Irí: perfil, publicaciones, grupos y marketplace."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal><Stat valor={pubs?.length ?? '—'} etiqueta="Publicaciones" /></Reveal>
        <Reveal delay={80}><Stat valor={grupos?.length ?? '—'} etiqueta="Grupos" tono="#d9f2c2" /></Reveal>
        <Reveal delay={160}><Stat valor={prods?.length ?? '—'} etiqueta="Productos / servicios" tono="#d67a63" /></Reveal>
        <Reveal delay={240}><Stat valor={historial?.length ?? '—'} etiqueta="Asistencias" tono="#e60035" /></Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Accesos rápidos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {accesos.map((a) => (
                <Link key={a.to} to={a.to} className="group rounded-xl border border-tea/10 bg-black/10 p-4 transition hover:-translate-y-0.5 hover:border-caribbean/40 hover:bg-caribbean/[0.06]">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-caribbean">{a.label}</p>
                  <p className="mt-1 text-xs text-tea/50">{a.desc}</p>
                </Link>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={120}>
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Actividad reciente</h2>
            {la ? <p className="mt-4 text-sm text-tea/45">Cargando…</p>
              : notificaciones.length === 0 ? <p className="mt-4 text-sm text-tea/45">Sin avisos por ahora.</p>
              : (
                <ul className="mt-4 space-y-4">
                  {notificaciones.slice(0, 8).map((n) => (
                    <li key={n.id} className="flex gap-3">
                      <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${n.read ? 'bg-tea/25' : 'bg-caribbean shadow-[0_0_8px_rgba(0,230,188,0.6)]'}`} />
                      <div className="flex-1">
                        <p className={`text-sm leading-snug ${n.read ? 'text-tea/50' : 'text-tea/85'}`}>{n.message}</p>
                        <div className="mt-0.5 flex items-center gap-3">
                          <p className="font-mono text-xs text-tea/40">{hace(n.createdAt)}</p>
                          {!n.read && <button onClick={() => marcar(n.id)} className="font-mono text-[0.65rem] uppercase tracking-wide text-caribbean/70 hover:text-caribbean">marcar leída</button>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </Card>
        </Reveal>
      </div>
    </>
  )
}
