import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../ui'
import { groupsApi } from '../../api/groups'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useColoresGrupos, varsDeColor } from '../colores'
import { useMisTareas } from '../tareas'
import Ico from '../Ico'

const papel = { Coordinator: 'Coordinas', Leader: 'Lideras', Member: 'Participas' }

/** Cuántas tareas tuyas hay en un grupo, dicho como se diría. */
function textoTareas(n) {
  if (n === 0) return 'Al día'
  return `${n} ${n === 1 ? 'tarea tuya' : 'tareas tuyas'}`
}
const personas = (n) => `${n} ${n === 1 ? 'persona' : 'personas'}`

/**
 * Un equipo dentro de la ficha de su comisión. El tuyo va sobre blanco, con su
 * punto lleno y tu papel; los demás quedan a ras del tinte, con un aro, para que
 * se vea qué hay sin que compitan con lo tuyo.
 */
function FilaEquipo({ t, mio, tareas }) {
  return (
    <li>
      <Link to={`/panel/grupos/equipos/${t.id}`}
        className={`flex min-h-14 items-center gap-3 rounded-2xl px-4 py-2.5 transition ${mio ? 'bg-white/80 hover:bg-white' : 'hover:bg-white/40'}`}>
        <span aria-hidden="true" className={`h-2.5 w-2.5 flex-none rounded-full ${mio ? 'bg-[var(--g-solido)]' : 'border-2 border-[var(--g-solido)]'}`} />
        <span className="min-w-0 flex-1">
          <span className={`block truncate ${mio ? 'font-semibold text-[#002420]' : 'text-[#002420]/85'}`}>{t.name}</span>
          <span className="block text-sm text-[#002420]/75">
            {mio
              ? <>{papel[mio.role]} · {textoTareas(tareas)}</>
              : <>{t.leaderName ? `Lidera ${t.leaderName.split(' ')[0]}` : 'Sin líder'} · {personas(t.memberCount)}</>}
          </span>
        </span>
        {mio && <span className="flex-none rounded-full bg-[var(--g-tinte)] px-2.5 py-0.5 text-xs font-semibold text-[var(--g-tinta)]">Tu equipo</span>}
        <Ico name="ir" className="h-4 w-4 flex-none text-[var(--g-tinta)]" />
      </Link>
    </li>
  )
}

/**
 * Comisión tuya: lleva su color de punta a punta y dice lo que se mira al entrar
 * (tu papel, tus tareas, quién coordina). Debajo cuelgan TODOS sus equipos, para
 * que se lea la comisión entera; los tuyos resaltados.
 */
function ComisionMia({ c, rol, misEquipos, tareasDe, color }) {
  const equipos = [...c.teams].sort((a, b) => Number(!misEquipos.has(a.id)) - Number(!misEquipos.has(b.id)))
  return (
    <li style={varsDeColor(color)} className="overflow-hidden rounded-3xl border border-[var(--g-solido)]/40 bg-[var(--g-tinte)]">
      <Link to={`/panel/grupos/${c.id}`} className="block p-5 pb-4 transition hover:brightness-[0.98]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-[var(--g-tinta)]">{c.name}</h2>
          <span className="mt-1 flex-none rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--g-tinta)]">{rol ? papel[rol] : 'En un equipo'}</span>
        </div>
        {rol && <p className="mt-3 text-lg font-semibold text-[#002420]">{textoTareas(tareasDe(c.id))}</p>}
        <p className="mt-1 text-sm text-[#002420]/80">
          {rol === 'Coordinator' ? 'La coordinas tú' : c.coordinatorName ? `Coordina ${c.coordinatorName}` : 'Sin coordinador'} · {personas(c.memberCount)}
        </p>
      </Link>
      {equipos.length > 0 && (
        <div className="px-2 pb-2">
          <p className="px-3 pb-1 text-xs font-semibold text-[var(--g-tinta)]">Equipos</p>
          <ul className="space-y-1">
            {equipos.map((t) => <FilaEquipo key={t.id} t={t} mio={misEquipos.get(t.id)} tareas={tareasDe(t.id)} />)}
          </ul>
        </div>
      )}
    </li>
  )
}

/** Comisión de la que no formas parte: quieta, sobre la superficie, con su punto de color y «Pedir entrar». */
function ComisionAjena({ c, color, pedida, ocupado, onPedir }) {
  return (
    <li style={varsDeColor(color)} className="rounded-2xl border border-tea/10 bg-jungle p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-2 h-3 w-3 flex-none rounded-full bg-[var(--g-solido)]" />
        <div className="min-w-0 flex-1">
          <Link to={`/panel/grupos/${c.id}`} className="font-display text-lg font-semibold uppercase leading-tight tracking-wide text-cream hover:text-caribbean">{c.name}</Link>
          <p className="mt-1 text-sm text-tea/75">
            {c.coordinatorName ? `Coordina ${c.coordinatorName}` : 'Sin coordinador'} · {personas(c.memberCount)}
          </p>
          {c.teams.length > 0 && (
            <p className="mt-1 text-sm text-tea/70">
              {c.teams.length === 1 ? 'Equipo' : 'Equipos'}: {c.teams.map((t) => t.name).join(', ')}
            </p>
          )}
        </div>
        {pedida ? (
          <span className="flex min-h-11 flex-none items-center gap-1.5 px-1 text-sm font-semibold text-tea/75">
            <Ico name="reloj" className="h-4 w-4" />Pedida
          </span>
        ) : (
          <button type="button" onClick={() => onPedir(c)} disabled={ocupado}
            className="min-h-11 flex-none rounded-full border border-caribbean/40 px-4 text-sm font-semibold text-caribbean transition hover:bg-caribbean hover:text-jungle disabled:opacity-50">
            {ocupado ? 'Enviando…' : 'Pedir entrar'}
          </button>
        )}
      </div>
    </li>
  )
}

export default function Grupos() {
  const { user } = useSession()
  const colorDe = useColoresGrupos()
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data: mios, loading: lm, error: em } = useFetch(() => groupsApi.mine(), [version])
  const { data: comisiones, loading: lc, error: ec } = useFetch(() => groupsApi.commissions(), [version])
  const { tareas } = useMisTareas(mios, user.id, version)
  const toast = useToast()
  const [ocupado, setOcupado] = useState(null)
  // La API no dice qué solicitudes tienes pendientes: se recuerdan en esta visita.
  const [pedidas, setPedidas] = useState(() => new Set())

  const misGrupos = mios ?? []
  const rolEn = new Map(misGrupos.filter((g) => g.type === 'Commission').map((g) => [g.id, g.role]))
  const misEquipos = new Map(misGrupos.filter((g) => g.type === 'Team').map((g) => [g.id, g]))
  const tareasDe = (id) => tareas.filter((t) => t.grupo.id === id).length

  // Tuya es la comisión en la que estás o la de alguno de tus equipos.
  const esMia = (c) => rolEn.has(c.id) || c.teams.some((t) => misEquipos.has(t.id))
  const todas = comisiones ?? []
  const mias = todas.filter(esMia)
  const ajenas = todas.filter((c) => !esMia(c))

  async function pedir(c) {
    setOcupado(c.id)
    try {
      const r = await groupsApi.requestJoin(c.id)
      toast.success(r?.mensaje || `Pediste entrar a ${c.name}. Quien coordina lo revisará.`)
      setPedidas((s) => new Set(s).add(c.id))
    } catch (e) {
      toast.error(e.message || 'No se pudo enviar la solicitud.')
    } finally { setOcupado(null) }
  }

  if (lm || lc) return (<><PageHeader title="Grupos" /><p className="text-tea/70">Cargando…</p></>)
  if (em || ec) return (
    <>
      <PageHeader title="Grupos" />
      <div className="rounded-2xl border border-candy/30 bg-jungle p-5">
        <p className="text-tea">No se pudieron cargar las comisiones.</p>
        <button type="button" onClick={reload} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">Reintentar</button>
      </div>
    </>
  )

  return (
    <>
      <PageHeader
        title="Grupos"
        description="El colectivo se organiza en comisiones permanentes; dentro de cada una se arman equipos para algo concreto."
      />

      {mias.length === 0 ? (
        <div className="mb-10 rounded-3xl border border-dashed border-tea/20 p-6">
          <p className="font-display text-xl font-semibold uppercase tracking-wide text-cream">Aún no estás en ninguna comisión</p>
          <p className="mt-2 text-tea/80">Elige una de abajo y pide entrar: quien la coordina recibe tu solicitud.</p>
        </div>
      ) : (
        <ul className="mb-10 space-y-4">
          {mias.map((c) => (
            <ComisionMia key={c.id} c={c} rol={rolEn.get(c.id)} misEquipos={misEquipos} tareasDe={tareasDe} color={colorDe(c)} />
          ))}
        </ul>
      )}

      {ajenas.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-cream">{mias.length === 0 ? 'Comisiones del colectivo' : 'Otras comisiones'}</h2>
          <p className="mb-4 mt-1 text-sm text-tea/70">Pide entrar y quien coordina recibe tu solicitud.</p>
          <ul className="space-y-2.5">
            {ajenas.map((c) => (
              <ComisionAjena key={c.id} c={c} color={colorDe(c)} pedida={pedidas.has(c.id)} ocupado={ocupado === c.id} onPedir={pedir} />
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
