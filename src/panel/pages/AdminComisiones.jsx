import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Btn, Reveal, Stat, Avatar, AvatarStack, inputCls, labelCls } from '../ui'
import { groupsApi } from '../../api/groups'
import { communityApi } from '../../api/community'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { gradientFor } from '../../utils/gradient'

/**
 * Carga el panorama completo de las comisiones.
 *
 * El listado de la API no trae equipos ni postulaciones, así que el detalle de
 * cada comisión se pide aparte y en paralelo. Es N+1 y se asume a conciencia:
 * son un puñado de comisiones en una pantalla de administración, y la
 * alternativa pasaba por tocar el back. Si algún día pasan de ~20, lo que toca
 * es añadir los conteos a CommissionDto, no seguir apilando peticiones.
 *
 * Cada llamada auxiliar cae por su cuenta: quien no pueda ver las postulaciones
 * de una comisión debe seguir viendo el resto de la tarjeta, no un error.
 */
async function cargarPanorama() {
  const comisiones = await groupsApi.commissions()
  if (comisiones.length === 0) return []

  const [detalles, solicitudes, comunidad] = await Promise.all([
    Promise.all(comisiones.map((c) => groupsApi.commission(c.id).catch(() => null))),
    Promise.all(comisiones.map((c) => groupsApi.joinRequests(c.id).catch(() => []))),
    // Las fotos no vienen en GroupMemberDto; se cruzan por id con la comunidad.
    communityApi.list().catch(() => []),
  ])

  const fotos = new Map(comunidad.map((m) => [m.id, m.photoUrl]))

  return comisiones.map((c, i) => ({
    ...c,
    teams: detalles[i]?.teams ?? [],
    members: (detalles[i]?.members ?? []).map((m) => ({ ...m, photoUrl: fotos.get(m.userId) })),
    pendientes: solicitudes[i]?.length ?? 0,
  }))
}

/** Cuánto reclama la atención de la Junta: lo que exige actuar sube. */
const urgencia = (c) => (c.pendientes > 0 ? 2 : 0) + (c.coordinatorName ? 0 : 1)

const FILTROS = [
  { id: '', label: 'Todas' },
  { id: 'atencion', label: 'Requieren atención' },
  { id: 'sin-coord', label: 'Sin coordinador' },
]

function TarjetaComision({ c }) {
  const coordinador = c.members.find((m) => m.role === 'Coordinator')
  const equipos = c.teams ?? []

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      {/* Franja de identidad: le da a cada comisión una cara reconocible en la
          rejilla, que si no son ocho tarjetas idénticas. */}
      <div className="h-1.5 w-full" style={{ background: gradientFor(c.id) }} />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-wide text-cream">{c.name}</h3>
          <div className="flex flex-none flex-wrap justify-end gap-1.5">
            {c.pendientes > 0 && <Chip tone="candy">{c.pendientes} {c.pendientes === 1 ? 'postulación' : 'postulaciones'}</Chip>}
            <Chip tone={c.permanent ? 'caribbean' : 'terracotta'}>{c.permanent ? 'Permanente' : 'Temporal'}</Chip>
          </div>
        </div>

        {/* Sin coordinador no es un dato neutro: es una tarea pendiente de la
            Junta, y en gris pasaba desapercibida. */}
        <div className="mt-4">
          {coordinador || c.coordinatorName ? (
            <div className="flex items-center gap-2.5">
              <Avatar id={coordinador?.userId} nombre={coordinador?.name || c.coordinatorName} foto={coordinador?.photoUrl} size="sm" />
              <div className="min-w-0">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-tea/40">Coordina</p>
                <p className="truncate text-sm text-tea">{coordinador?.name || c.coordinatorName}</p>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs font-medium text-terracotta">
              Sin coordinador — la Junta debe designar uno
            </p>
          )}
        </div>

        <div className="mt-5">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-tea/40">Integrantes</p>
          {c.members.length > 0 ? (
            <div className="mt-1.5 flex items-center gap-2">
              <AvatarStack personas={c.members} max={5} size="xs" />
              <span className="font-mono text-xs text-tea/45">{c.memberCount}</span>
            </div>
          ) : (
            <p className="mt-1.5 text-xs text-tea/35">Nadie todavía</p>
          )}
        </div>

        {/* Los equipos son la razón de ser de una comisión grande; verlos aquí
            ahorra entrar a cada una para saber si está organizada o no. */}
        <div className="mt-5">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-tea/40">
            Equipos {equipos.length > 0 && <span className="text-tea/30">({equipos.length})</span>}
          </p>
          {equipos.length === 0 ? (
            <p className="mt-1.5 text-xs text-tea/35">Sin equipos</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {equipos.map((t) => (
                <span key={t.id} className="rounded-lg border border-tea/12 bg-jungle-deep/50 px-2.5 py-1 text-xs text-tea/70" title={`Líder: ${t.leaderName || '—'}`}>
                  {t.name} <span className="font-mono text-[0.65rem] text-tea/35">{t.memberCount}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto border-t border-tea/8 pt-4">
          <Link to={`/panel/grupos/${c.id}`} className="font-mono text-xs font-semibold uppercase tracking-wide text-caribbean/80 transition hover:text-caribbean">
            Gestionar comisión →
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default function AdminComisiones() {
  const { hasPermission } = useSession()
  const puedeCrear = hasPermission('comisiones.ver_todas')

  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data, loading, error } = useFetch(cargarPanorama, [version])

  const [abierto, setAbierto] = useState(false)
  const [form, setForm] = useState({ name: '', permanent: true })
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('')
  const toast = useToast()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  async function crear() {
    if (!form.name.trim()) { setMsg({ ok: false, text: 'El nombre es obligatorio.' }); return }
    setSaving(true)
    try {
      await groupsApi.createCommission({ name: form.name.trim(), permanent: form.permanent })
      setMsg({ ok: true, text: 'Comisión creada.' })
      setForm({ name: '', permanent: true }); setAbierto(false); reload()
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo crear la comisión.' }) }
    finally { setSaving(false) }
  }

  const comisiones = data ?? []

  const totales = {
    integrantes: comisiones.reduce((a, c) => a + (c.memberCount || 0), 0),
    equipos: comisiones.reduce((a, c) => a + c.teams.length, 0),
    sinCoordinador: comisiones.filter((c) => !c.coordinatorName).length,
    pendientes: comisiones.reduce((a, c) => a + c.pendientes, 0),
  }

  const lista = comisiones
    .filter((c) => {
      const q = busqueda.trim().toLowerCase()
      if (q && !`${c.name} ${c.coordinatorName || ''} ${c.teams.map((t) => t.name).join(' ')}`.toLowerCase().includes(q)) return false
      if (filtro === 'atencion' && urgencia(c) === 0) return false
      if (filtro === 'sin-coord' && c.coordinatorName) return false
      return true
    })
    // Lo que exige acción primero: esta pantalla se abre para decidir, no para leer.
    .sort((a, b) => urgencia(b) - urgencia(a) || a.name.localeCompare(b.name, 'es'))

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Comisiones y equipos"
        description="Áreas permanentes de trabajo. Entra a cada una para gestionar integrantes, equipos y postulaciones."
        actions={puedeCrear && <Btn tone="candy" onClick={() => setAbierto((v) => !v)}>{abierto ? 'Cerrar' : '+ Nueva comisión'}</Btn>}
      />

      {!loading && !error && comisiones.length > 0 && (
        <Reveal className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat valor={comisiones.length} etiqueta="Comisiones" />
          <Stat valor={totales.integrantes} etiqueta="Integrantes" />
          <Stat valor={totales.equipos} etiqueta="Equipos" tono="#d9f2c2" />
          {/* La cuarta cifra la ocupa lo que haya que resolver: primero las
              postulaciones, y si no hay, las comisiones sin coordinador. */}
          <Stat
            valor={totales.pendientes || totales.sinCoordinador}
            etiqueta={totales.pendientes ? 'Postulaciones por decidir' : 'Sin coordinador'}
            tono={totales.pendientes || totales.sinCoordinador ? '#e60035' : '#00e6bc'}
          />
        </Reveal>
      )}

      {abierto && puedeCrear && (
        <Reveal className="mb-8">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Nueva comisión</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>Nombre</label>
                <input className={`${inputCls} mt-1.5`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Comisión de Arte Urbano" />
              </div>
              <label className="flex items-center gap-2 text-sm text-tea/70">
                <input type="checkbox" checked={form.permanent} onChange={(e) => setForm((f) => ({ ...f, permanent: e.target.checked }))} className="h-4 w-4 accent-[#00e6bc]" />
                Permanente (si la desmarcas, es temporal)
              </label>
              <p className="font-mono text-[0.65rem] text-tea/40">El coordinador se designa dentro de la comisión, una vez tenga integrantes.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <Btn onClick={crear} disabled={saving}>{saving ? 'Creando…' : 'Crear comisión'}</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      {comisiones.length > 3 && !loading && (
        <div className="mb-6 rounded-2xl border border-tea/10 bg-jungle p-4">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por comisión, coordinador o equipo…"
            className={inputCls}
            autoComplete="off"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {FILTROS.map((f) => (
              <button
                key={f.id || 'todas'}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${filtro === f.id ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/55 hover:bg-tea/15 hover:text-tea'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-tea/50">Cargando comisiones…</p>}
      {error && <p className="text-candy">No se pudieron cargar las comisiones.</p>}
      {!loading && !error && comisiones.length === 0 && (
        <Card><p className="text-sm text-tea/55">Aún no hay comisiones.{puedeCrear && ' Crea la primera con «+ Nueva comisión».'}</p></Card>
      )}
      {!loading && !error && comisiones.length > 0 && lista.length === 0 && (
        <Card><p className="text-sm text-tea/55">Ninguna comisión coincide con el filtro.</p></Card>
      )}

      <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((c, i) => (
          <Reveal key={c.id} delay={(i % 3) * 80} className="h-full">
            <TarjetaComision c={c} />
          </Reveal>
        ))}
      </div>
    </>
  )
}
