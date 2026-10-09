import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Btn, PillTabs, AvatarStack, inputCls } from '../ui'
import KanbanBoard from '../KanbanBoard'
import ListaPersonas, { ordenarPersonas } from '../ListaPersonas'
import { groupsApi } from '../../api/groups'
import { communityApi } from '../../api/community'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'
import { useColoresGrupos, varsDeColor } from '../colores'
import { useCargaTareas } from '../tareas'
import Ico from '../Ico'
import CompartirGrupo from '../CompartirGrupo'

/**
 * Un equipo: grupo temporal dentro de una comisión, con su propio tablero de
 * tareas (RF-TEAM-01). Antes no tenía página y su tablero no se veía en ningún
 * sitio. Lleva el color de su comisión y la vuelta a ella arriba.
 *
 * Quién hace qué (lo decide la API; aquí solo se pinta):
 * - Tareas: las ven y mueven sus integrantes; las crea y asigna quien lidera.
 * - Sumar y sacar gente: quien lidera, quien coordina la comisión o la Junta.
 */
export default function EquipoDetalle() {
  const { id } = useParams()
  const { user, hasPermission } = useSession()
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const [tab, setTab] = useState('tablero')
  const [sumar, setSumar] = useState('')
  const [pedida, setPedida] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const colorDe = useColoresGrupos()

  const { data: eq, loading, error } = useFetch(() => groupsApi.team(id), [id, version])
  // La comisión da quién puede sumarse (solo sus integrantes) y quién la coordina.
  const { data: com } = useFetch(() => (eq ? groupsApi.commission(eq.commissionId) : Promise.resolve(null)), [eq?.commissionId, version])
  // Las fotos no vienen en GroupMemberDto; se cruzan por id con la comunidad.
  const { data: comunidad } = useFetch(() => communityApi.list().catch(() => []), [])

  const fotos = new Map((comunidad ?? []).map((m) => [m.id, m.photoUrl]))
  const miembros = (eq?.members ?? []).map((m) => ({ ...m, photoUrl: fotos.get(m.userId) }))
  const lider = miembros.find((m) => m.role === 'Leader')
  const esIntegrante = miembros.some((m) => m.userId === user?.id)
  const enLaComision = (com?.members ?? []).some((m) => m.userId === user?.id)
  const coordinaLaComision = (com?.members ?? []).some((m) => m.userId === user?.id && m.role === 'Coordinator')
  const puedeGestionar = lider?.userId === user?.id || coordinaLaComision || hasPermission('comisiones.ver_todas')
  const carga = useCargaTareas(id, tab === 'integrantes' && esIntegrante, version)

  const enEquipo = new Set(miembros.map((m) => m.userId))
  const candidatos = ordenarPersonas((com?.members ?? []).filter((m) => !enEquipo.has(m.userId)))

  async function sumarAlEquipo() {
    if (!sumar) return
    try {
      await groupsApi.addTeamMember(id, sumar)
      toast.success('Sumado al equipo.')
      setSumar('')
      reload()
    } catch (e) { toast.error(e.message || 'No se pudo sumar.') }
  }

  async function pedirEntrar() {
    try {
      const r = await groupsApi.requestJoin(eq.commissionId)
      toast.success(r?.mensaje || 'Solicitud enviada. Quien coordina la revisará.')
      setPedida(true)
    } catch (e) { toast.error(e.message || 'No se pudo enviar la solicitud.') }
  }

  async function sacar(m) {
    const ok = await confirm({
      title: `¿Sacar a ${m.name.split(' ')[0]} del equipo?`,
      message: `Deja ${eq.name}, pero sigue en la comisión. Le llega un aviso.`,
      danger: true,
      confirmLabel: 'Sacar',
    })
    if (!ok) return
    try { await groupsApi.removeMember(id, m.userId); toast.success('Listo.'); reload() }
    catch (e) { toast.error(e.message || 'No se pudo.') }
  }

  async function salir() {
    const ok = await confirm({
      title: `¿Salir de ${eq.name}?`,
      message: 'Dejas el equipo, pero sigues en la comisión.',
      danger: true,
      confirmLabel: 'Salir',
    })
    if (!ok) return
    try { await groupsApi.leave(id); toast.success(`Saliste de ${eq.name}.`); navigate(`/panel/grupos/${eq.commissionId}`) }
    catch (e) { toast.error(e.message || 'No se pudo.') }
  }

  // La vuelta es a la comisión de la que cuelga, no a la lista: así se lee dónde estás.
  const volver = (
    <Link to={eq ? `/panel/grupos/${eq.commissionId}` : '/panel/grupos'} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-caribbean hover:underline">
      <Ico name="atras" className="h-4 w-4" />{eq ? eq.commissionName : 'Grupos'}
    </Link>
  )
  if (loading) return <>{volver}<p className="mt-4 text-tea/70">Cargando…</p></>
  if (error || !eq) return (
    <>
      {volver}
      <div className="mt-4 rounded-2xl border border-candy/30 bg-jungle p-5">
        <p className="text-tea">No se pudo cargar el equipo.</p>
        <button type="button" onClick={reload} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">Reintentar</button>
      </div>
    </>
  )

  const color = colorDe(eq.commissionId)
  const tabs = [
    { id: 'tablero', label: 'Tareas' },
    { id: 'integrantes', label: 'Personas' },
  ]

  return (
    <>
      {volver}

      <header style={varsDeColor(color)} className="mb-5 mt-1 rounded-3xl bg-[var(--g-tinte)] px-5 py-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-[var(--g-tinta)] sm:text-3xl md:text-4xl">{eq.name}</h1>
          <CompartirGrupo nombre={eq.name} ruta={`/panel/grupos/equipos/${eq.id}`} />
        </div>
        <div className="mt-2 flex items-center gap-3 text-[#002420]">
          {miembros.length > 0 && <AvatarStack personas={miembros} max={4} size="sm" />}
          <p className="min-w-0 text-sm">
            {lider ? (lider.userId === user?.id ? <>Lo lideras <strong className="font-semibold">tú</strong></> : <>Lidera <strong className="font-semibold">{lider.name}</strong></>) : <span className="font-semibold text-[#8f3b26]">Sin líder</span>}
            {' · '}{miembros.length} {miembros.length === 1 ? 'persona' : 'personas'}
          </p>
        </div>
        {/* Llegar por un enlace sin ser del equipo: a un equipo se entra desde su
            comisión (quien lidera suma gente), así que se dice qué hacer. */}
        {com && !esIntegrante && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {enLaComision ? (
              <p className="text-sm text-[#002420]"><strong className="font-semibold">No estás en este equipo.</strong> Pídele a {lider ? lider.name.split(' ')[0] : 'quien lo lidera'} que te sume.</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#002420]">Para entrar, primero hay que estar en {eq.commissionName}.</p>
                {pedida ? (
                  <span className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#002420]/80"><Ico name="reloj" className="h-4 w-4" />Pediste entrar</span>
                ) : (
                  <button type="button" onClick={pedirEntrar}
                    className="min-h-11 rounded-full bg-[#002420] px-4 text-sm font-semibold text-[#f6fbef] transition hover:brightness-125">
                    Pedir entrar a la comisión
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </header>

      <PillTabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'tablero' && (
        esIntegrante
          ? <KanbanBoard groupId={id} members={miembros} currentUserId={user?.id} />
          : (
            <p className="rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">
              Las tareas del equipo las ven quienes lo forman.
              {puedeGestionar && ' Súmate desde «Personas» si necesitas seguirlas.'}
            </p>
          )
      )}

      {tab === 'integrantes' && (
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Integrantes · {miembros.length}</h2>
            <p className="mb-3 mt-1 text-sm text-tea/70">
              {carga ? (
                <>
                  Con sus tareas activas en el equipo, para repartir mejor.
                  {carga.sinResponsable > 0 && (
                    <> <button type="button" onClick={() => setTab('tablero')} className="font-semibold text-terracotta underline-offset-4 hover:underline">
                      {carga.sinResponsable} {carga.sinResponsable === 1 ? 'tarea no tiene' : 'tareas no tienen'} responsable
                    </button>.</>
                  )}
                </>
              ) : 'Quienes forman el equipo.'}
            </p>
            <ListaPersonas
              miembros={miembros}
              userId={user?.id}
              carga={carga}
              contexto="este equipo"
              // A quien lidera no se le saca: antes hay que nombrar a otra persona.
              puedeSacar={(m) => puedeGestionar && m.role !== 'Leader' && m.userId !== user?.id}
              onSacar={sacar}
            />
          </section>

          {puedeGestionar && (
            <section>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Sumar al equipo</h2>
              <p className="mb-3 mt-1 text-sm text-tea/70">Solo pueden sumarse quienes ya están en {eq.commissionName}.</p>
              {candidatos.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">Toda la comisión ya está en el equipo.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <label className="sr-only" htmlFor="sumar-equipo">Persona a sumar</label>
                  <select id="sumar-equipo" value={sumar} onChange={(e) => setSumar(e.target.value)} className={`${inputCls} min-w-0 flex-1`}>
                    <option value="">Elige a alguien de la comisión…</option>
                    {candidatos.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
                  </select>
                  <Btn onClick={sumarAlEquipo} disabled={!sumar}><Ico name="mas" className="h-4 w-4" />Sumar</Btn>
                </div>
              )}
            </section>
          )}

          {esIntegrante && lider?.userId !== user?.id && (
            <p>
              <button type="button" onClick={salir} className="inline-flex min-h-11 items-center text-sm font-semibold text-tea/70 underline-offset-4 hover:text-candy hover:underline">
                Salir de {eq.name}
              </button>
            </p>
          )}
        </div>
      )}
    </>
  )
}
