import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Btn, Reveal, AvatarStack, inputCls, labelCls } from '../ui'
import { groupsApi } from '../../api/groups'
import { communityApi } from '../../api/community'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useColoresGrupos, varsDeColor } from '../colores'
import Ico from '../Ico'

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

/**
 * Una comisión en una fila: su color, quién coordina, cuánta gente y lo que
 * pide atención. Antes eran tarjetas con cinco bloques rotulados y cuatro
 * cifras encima; para decidir dónde entrar basta con esto, y el detalle vive
 * dentro de la comisión.
 */
function FilaComision({ c, color }) {
  const avisos = [
    c.pendientes > 0 && { texto: `${c.pendientes} ${c.pendientes === 1 ? 'quiere' : 'quieren'} entrar`, clase: 'bg-candy text-white' },
    !c.coordinatorName && { texto: 'Sin coordinador', clase: 'border border-terracotta/50 text-terracotta' },
  ].filter(Boolean)

  return (
    <li style={varsDeColor(color)}>
      <Link to={`/panel/grupos/${c.id}`} className="flex items-stretch overflow-hidden rounded-2xl border border-tea/10 bg-jungle transition hover:border-caribbean/40">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold uppercase leading-tight tracking-wide text-cream">
              <span className="h-3 w-3 flex-none rounded-full bg-[var(--g-solido)]" aria-hidden="true" />{c.name}
            </h2>
            <p className="mt-1 text-sm text-tea/80">
              {c.coordinatorName ? `Coordina ${c.coordinatorName}` : 'Nadie coordina'}
              {' · '}{c.memberCount} {c.memberCount === 1 ? 'persona' : 'personas'}
              {c.teams.length > 0 && ` · ${c.teams.length} ${c.teams.length === 1 ? 'equipo' : 'equipos'}`}
              {!c.permanent && ' · temporal'}
            </p>
            {avisos.length > 0 && (
              <p className="mt-2.5 flex flex-wrap gap-2">
                {avisos.map((a) => <span key={a.texto} className={`rounded-full px-3 py-1 text-xs font-semibold ${a.clase}`}>{a.texto}</span>)}
              </p>
            )}
          </div>
          {c.members.length > 0 && <AvatarStack personas={c.members} max={4} size="sm" />}
        </div>
      </Link>
    </li>
  )
}

export default function AdminComisiones() {
  const { hasPermission } = useSession()
  const puedeCrear = hasPermission('comisiones.ver_todas')
  const colorDe = useColoresGrupos()

  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data, loading, error } = useFetch(cargarPanorama, [version])

  const [abierto, setAbierto] = useState(false)
  const [form, setForm] = useState({ name: '', permanent: true })
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')
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

  const lista = comisiones
    .filter((c) => {
      const q = busqueda.trim().toLowerCase()
      if (q && !`${c.name} ${c.coordinatorName || ''} ${c.teams.map((t) => t.name).join(' ')}`.toLowerCase().includes(q)) return false
      return true
    })
    // Lo que exige acción primero: esta pantalla se abre para decidir, no para leer.
    .sort((a, b) => urgencia(b) - urgencia(a) || a.name.localeCompare(b.name, 'es'))

  return (
    <>
      <PageHeader
        title="Comisiones"
        description="Lo que pide atención va primero. Entra a una para decidir solicitudes, designar coordinador o armar equipos."
        actions={puedeCrear && <Btn tone={abierto ? 'ghost' : 'primary'} onClick={() => setAbierto((v) => !v)}>{abierto ? 'Cerrar' : <><Ico name="mas" className="h-4 w-4" />Nueva comisión</>}</Btn>}
      />

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
              <p className="font-mono text-xs text-tea/70">El coordinador se designa dentro de la comisión, una vez tenga integrantes.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <Btn onClick={crear} disabled={saving}>{saving ? 'Creando…' : 'Crear comisión'}</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      {comisiones.length > 6 && !loading && (
        <div className="mb-5">
          <label htmlFor="buscar-comision" className="sr-only">Buscar comisión</label>
          <input
            id="buscar-comision"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por comisión, coordinador o equipo…"
            className={`${inputCls} text-base`}
            autoComplete="off"
          />
        </div>
      )}

      {loading && <p className="text-tea/70">Cargando comisiones…</p>}
      {error && (
        <Card>
          <p className="text-tea">No se pudieron cargar las comisiones.</p>
          <button type="button" onClick={reload} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">Reintentar</button>
        </Card>
      )}
      {!loading && !error && comisiones.length === 0 && (
        <Card><p className="text-sm text-tea/70">Aún no hay comisiones.{puedeCrear && ' Crea la primera con «+ Nueva comisión».'}</p></Card>
      )}
      {!loading && !error && comisiones.length > 0 && lista.length === 0 && (
        <Card><p className="text-sm text-tea/70">Ninguna comisión coincide con la búsqueda.</p></Card>
      )}

      <ul className="space-y-3">
        {lista.map((c) => <FilaComision key={c.id} c={c} color={colorDe(c)} />)}
      </ul>
    </>
  )
}
