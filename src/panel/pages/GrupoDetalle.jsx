import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, Chip, Btn, PillTabs, Avatar, AvatarStack, inputCls, labelCls } from '../ui'
import KanbanBoard from '../KanbanBoard'
import { groupsApi } from '../../api/groups'
import { communityApi } from '../../api/community'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'
import { useColoresGrupos, varsDeColor } from '../colores'
import Ico from '../Ico'

const rolLabel = { Coordinator: 'Coordinador', Leader: 'Líder', Member: 'Miembro' }
const rolTono = { Coordinator: 'caribbean', Leader: 'terracotta', Member: 'gris' }
/** Quien manda arriba: una lista de gente se lee buscando primero al responsable. */
const rolOrden = { Coordinator: 0, Leader: 1, Member: 2 }

/** «Hace 3 días» dice más que una fecha cuando lo que importa es la espera. */
function hace(iso) {
  const dias = Math.floor((Date.now() - new Date(iso)) / 86400000)
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'ayer'
  if (dias < 30) return `hace ${dias} días`
  const meses = Math.floor(dias / 30)
  return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`
}

export default function GrupoDetalle() {
  const { id } = useParams()
  const { user, hasPermission } = useSession()
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)

  const { data: com, loading, error } = useFetch(() => groupsApi.commission(id), [id, version])
  // Las fotos no vienen en GroupMemberDto; se cruzan por id con la comunidad.
  const { data: comunidad } = useFetch(() => communityApi.list().catch(() => []), [])
  const toast = useToast()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }
  const [nuevoEquipo, setNuevoEquipo] = useState({ name: '', leaderUserId: '' })
  const [coordSel, setCoordSel] = useState('')
  const [tab, setTab] = useState('tablero')
  const [sumarA, setSumarA] = useState({}) // equipo → persona elegida para sumar
  const confirm = useConfirm()
  const navigate = useNavigate()
  const colorDe = useColoresGrupos()

  const fotos = new Map((comunidad ?? []).map((m) => [m.id, m.photoUrl]))
  const miembros = (com?.members ?? []).map((m) => ({ ...m, photoUrl: fotos.get(m.userId) }))
  const esCoordinador = miembros.some((m) => m.userId === user?.id && m.role === 'Coordinator')
  // La Junta ve y gestiona cualquier comisión (RF-ADM-05); el coordinador, la suya.
  const puedeGestionar = hasPermission('comisiones.ver_todas') || esCoordinador

  const { data: solicitudes } = useFetch(
    () => (puedeGestionar && com ? groupsApi.joinRequests(id) : Promise.resolve([])),
    [id, version, puedeGestionar, !!com],
  )
  const pendientes = solicitudes ?? []

  async function decidir(reqId, decision) {
    try { await groupsApi.decideJoin(reqId, decision); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo procesar.' }) }
  }

  async function crearEquipo() {
    if (!nuevoEquipo.name.trim() || !nuevoEquipo.leaderUserId) { setMsg({ ok: false, text: 'Nombre y líder del equipo son obligatorios.' }); return }
    try {
      await groupsApi.createTeam(id, { name: nuevoEquipo.name.trim(), leaderUserId: nuevoEquipo.leaderUserId })
      setMsg({ ok: true, text: 'Equipo creado.' }); setNuevoEquipo({ name: '', leaderUserId: '' }); reload()
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo crear el equipo.' }) }
  }

  async function sacar(m) {
    const ok = await confirm({
      title: `¿Sacar a ${m.name.split(' ')[0]}?`,
      message: `Deja de formar parte de ${com.name} y de sus equipos. Le llega un aviso.`,
      danger: true,
      confirmLabel: 'Sacar',
    })
    if (!ok) return
    try { await groupsApi.removeMember(id, m.userId); setMsg({ ok: true, text: 'Listo.' }); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo.' }) }
  }

  async function salir() {
    const ok = await confirm({
      title: `¿Salir de ${com.name}?`,
      message: 'Dejas la comisión y sus equipos. Para volver tendrás que pedir entrar de nuevo.',
      danger: true,
      confirmLabel: 'Salir',
    })
    if (!ok) return
    try { await groupsApi.leave(id); toast.success(`Saliste de ${com.name}.`); navigate('/panel/grupos') }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo.' }) }
  }

  async function sumarAlEquipo(teamId) {
    const userId = sumarA[teamId]
    if (!userId) return
    try {
      await groupsApi.addTeamMember(teamId, userId)
      setMsg({ ok: true, text: 'Sumado al equipo.' })
      setSumarA((s) => ({ ...s, [teamId]: '' }))
      reload()
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo sumar.' }) }
  }

  async function asignarCoordinador() {
    if (!coordSel) return
    try { await groupsApi.assignCoordinator(id, coordSel); setMsg({ ok: true, text: 'Coordinador designado.' }); setCoordSel(''); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo designar.' }) }
  }

  const volver = (
    <Link to="/panel/grupos" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-caribbean hover:underline"><Ico name="atras" className="h-4 w-4" />Tus grupos</Link>
  )
  if (loading) return <>{volver}<p className="mt-4 text-tea/70">Cargando…</p></>
  if (error || !com) return (
    <>
      {volver}
      <div className="mt-4 rounded-2xl border border-candy/30 bg-jungle p-5">
        <p className="text-tea">No se pudo cargar la comisión.</p>
        <button type="button" onClick={reload} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">Reintentar</button>
      </div>
    </>
  )
  const color = colorDe(com.id)

  const coordinador = miembros.find((m) => m.role === 'Coordinator')
  const ordenados = [...miembros].sort(
    (a, b) => rolOrden[a.role] - rolOrden[b.role] || a.name.localeCompare(b.name, 'es'),
  )

  const tabs = [
    { id: 'tablero', label: 'Tareas' },
    { id: 'integrantes', label: 'Personas' },
    // La pestaña de gestión solo existe para quien puede actuar sobre ella.
    ...(puedeGestionar ? [{ id: 'gestion', label: 'Gestión', badge: pendientes.length || undefined }] : []),
  ]

  return (
    <>
      {volver}

      {/* Cabecera con el color de la comisión: una línea de estado en vez de tres
          bloques de etiquetas y cifras. Los avisos accionables van aquí porque
          son la razón por la que alguien que gestiona entra. */}
      <header style={varsDeColor(color)} className="mb-5 mt-1 rounded-3xl bg-[var(--g-tinte)] px-5 py-4 sm:p-6">
        <h1 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-[var(--g-tinta)] sm:text-3xl md:text-4xl">{com.name}</h1>
        <div className="mt-2 flex items-center gap-3 text-[#002420]">
          {miembros.length > 0 && <AvatarStack personas={miembros} max={3} size="sm" />}
          <p className="min-w-0 text-sm">
            {coordinador ? (coordinador.userId === user?.id ? <>Coordinas <strong className="font-semibold">tú</strong></> : <>Coordina <strong className="font-semibold">{coordinador.name}</strong></>) : <span className="font-semibold text-[#8f3b26]">Sin coordinador</span>}
            {' · '}{miembros.length} {miembros.length === 1 ? 'persona' : 'personas'}
            {com.teams.length > 0 && ` · ${com.teams.length} ${com.teams.length === 1 ? 'equipo' : 'equipos'}`}
            <span className="hidden sm:inline">{' · '}{com.permanent ? 'permanente' : 'temporal'}</span>
          </p>
        </div>

        {puedeGestionar && (pendientes.length > 0 || !coordinador) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {pendientes.length > 0 && (
              <button type="button" onClick={() => setTab('gestion')}
                className="min-h-11 rounded-full bg-[#002420] px-4 text-sm font-semibold text-[#f6fbef] transition hover:brightness-125">
                {pendientes.length} {pendientes.length === 1 ? 'persona quiere' : 'personas quieren'} entrar · decidir
              </button>
            )}
            {!coordinador && (
              <button type="button" onClick={() => setTab('gestion')}
                className="min-h-11 rounded-full border border-[#8f3b26]/50 px-4 text-sm font-semibold text-[#8f3b26] transition hover:bg-white/50">
                Designar coordinador
              </button>
            )}
          </div>
        )}
      </header>

      <PillTabs tabs={tabs} active={tab} onChange={setTab} />

      {/* ── Tablero (por defecto) ────────────────────────── */}
      {tab === 'tablero' && (
        <KanbanBoard groupId={id} members={miembros} currentUserId={user?.id} />
      )}

      {/* ── Personas ─────────────────────────────────────── */}
      {tab === 'integrantes' && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-cream">Integrantes · {miembros.length}</h2>
            {miembros.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">Aún no hay nadie en esta comisión.</p>
            ) : (
              <ul className="overflow-hidden rounded-2xl border border-tea/10 bg-jungle">
                {ordenados.map((m) => (
                  <li key={m.userId} className="flex items-center border-b border-tea/10 last:border-0">
                    <Link to={`/perfil/${m.userId}`} target="_blank" className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-2 transition hover:bg-tea/5">
                      <Avatar id={m.userId} nombre={m.name} foto={m.photoUrl} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-tea">{m.userId === user?.id ? `${m.name} (tú)` : m.name}</span>
                      {m.role !== 'Member' && <Chip tone={rolTono[m.role]}>{rolLabel[m.role] ?? m.role}</Chip>}
                    </Link>
                    {/* A quien coordina no se le saca: antes hay que nombrar a otra persona. */}
                    {puedeGestionar && m.role !== 'Coordinator' && m.userId !== user?.id && (
                      <button type="button" onClick={() => sacar(m)} aria-label={`Sacar a ${m.name} de la comisión`}
                        className="mr-2 inline-flex min-h-11 flex-none items-center px-3 text-sm font-semibold text-tea/70 hover:text-candy">
                        Sacar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Equipos · {com.teams.length}</h2>
            <p className="mb-3 mt-1 text-sm text-tea/70">Grupos dentro de la comisión para algo concreto, cada uno con quien lo lidera.</p>
            {com.teams.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">
                Sin equipos todavía.{puedeGestionar && ' Se crean desde «Gestión».'}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {com.teams.map((t) => {
                  const lider = miembros.find((m) => m.name === t.leaderName)
                  // Suman gente quien lidera el equipo y quien gestiona la comisión.
                  const puedeSumar = puedeGestionar || (lider && lider.userId === user?.id)
                  return (
                    <li key={t.id} style={varsDeColor(color)} className="rounded-2xl border border-tea/10 bg-jungle p-4">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 flex-none rounded-full bg-[var(--g-solido)]" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-cream">{t.name}</p>
                          <p className="text-sm text-tea/70">Lidera {t.leaderName || 'nadie aún'} · {t.memberCount} {t.memberCount === 1 ? 'persona' : 'personas'}</p>
                        </div>
                        <Avatar id={lider?.userId} nombre={t.leaderName || '—'} foto={lider?.photoUrl} size="sm" />
                      </div>
                      {puedeSumar && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-tea/10 pt-3">
                          <label className="sr-only" htmlFor={`sumar-${t.id}`}>Sumar a {t.name}</label>
                          <select id={`sumar-${t.id}`} value={sumarA[t.id] ?? ''} onChange={(e) => setSumarA((s) => ({ ...s, [t.id]: e.target.value }))}
                            className={`${inputCls} min-w-0 flex-1`}>
                            <option value="">Sumar a…</option>
                            {ordenados.filter((m) => m.userId !== lider?.userId).map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
                          </select>
                          <Btn tone="ghost" onClick={() => sumarAlEquipo(t.id)} disabled={!sumarA[t.id]}>Sumar</Btn>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {miembros.some((m) => m.userId === user?.id && m.role !== 'Coordinator') && (
            <p>
              <button type="button" onClick={salir} className="inline-flex min-h-11 items-center text-sm font-semibold text-tea/70 underline-offset-4 hover:text-candy hover:underline">
                Salir de {com.name}
              </button>
            </p>
          )}
        </div>
      )}

      {/* ── Gestión (coordinador o Junta) ────────────────── */}
      {tab === 'gestion' && puedeGestionar && (
        <div className="space-y-6">
          {/* Primero lo que hay gente esperando; crear equipos es ocasional y
              antes competía por el mismo espacio. */}
          <Card className={pendientes.length > 0 ? 'border-candy/25' : undefined}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Postulaciones para entrar</h2>
              {pendientes.length > 0 && <Chip tone="candy">{pendientes.length} esperando</Chip>}
            </div>
            {pendientes.length === 0 ? (
              <p className="mt-2 text-sm text-tea/70">No hay postulaciones pendientes.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {pendientes.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-tea/10 bg-jungle-deep/40 p-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar id={s.userId} nombre={s.userName} foto={fotos.get(s.userId)} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-tea">{s.userName}</p>
                        <p className="break-all font-mono text-xs text-tea/70">{s.userEmail} · {hace(s.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Btn onClick={() => decidir(s.id, 'Accept')}>Aceptar</Btn>
                      <Btn tone="ghost" onClick={() => decidir(s.id, 'Reject')}>Rechazar</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className={!coordinador ? 'border-terracotta/25' : undefined}>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Coordinador</h2>
              <p className="mt-1 text-sm text-tea/70">
                Lo designa la Junta Directiva. Un miembro solo puede coordinar una comisión a la vez.
              </p>
              {coordinador && (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-tea/10 bg-jungle-deep/40 p-3">
                  <Avatar id={coordinador.userId} nombre={coordinador.name} foto={coordinador.photoUrl} size="sm" />
                  <div>
                    <p className="text-sm text-tea">{coordinador.name}</p>
                    <p className="font-mono text-xs text-tea/70">Coordinador actual</p>
                  </div>
                </div>
              )}
              {miembros.length === 0 ? (
                <p className="mt-3 text-sm text-tea/70">Necesitas integrantes antes de designar coordinador.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <select value={coordSel} onChange={(e) => setCoordSel(e.target.value)} className={`${inputCls} flex-1`}>
                    <option value="">{coordinador ? 'Cambiar a…' : 'Elige un integrante…'}</option>
                    {ordenados.filter((m) => m.role !== 'Coordinator').map((m) => (
                      <option key={m.userId} value={m.userId}>{m.name}</option>
                    ))}
                  </select>
                  <Btn onClick={asignarCoordinador} disabled={!coordSel}>Designar</Btn>
                </div>
              )}
            </Card>

            <Card>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Nuevo equipo</h2>
              <p className="mt-1 text-sm text-tea/70">Un subgrupo con su propio líder dentro de esta comisión.</p>
              <label className={`${labelCls} mt-4 block`}>Nombre</label>
              <input className={`${inputCls} mt-1.5`} value={nuevoEquipo.name} onChange={(e) => setNuevoEquipo((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Producción audiovisual" />
              <label className={`${labelCls} mt-4 block`}>Líder</label>
              <select className={`${inputCls} mt-1.5`} value={nuevoEquipo.leaderUserId} onChange={(e) => setNuevoEquipo((f) => ({ ...f, leaderUserId: e.target.value }))}>
                <option value="">Elige un integrante…</option>
                {ordenados.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
              </select>
              <Btn className="mt-4" onClick={crearEquipo} disabled={miembros.length === 0}><Ico name="mas" className="h-4 w-4" />Crear equipo</Btn>
              {miembros.length === 0 && <p className="mt-2 font-mono text-xs text-tea/70">Necesitas integrantes para poder nombrar un líder.</p>}
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
