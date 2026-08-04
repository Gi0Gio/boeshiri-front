import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, Chip, Btn, Reveal, PillTabs, Avatar, AvatarStack, inputCls, labelCls } from '../ui'
import KanbanBoard from '../KanbanBoard'
import { groupsApi } from '../../api/groups'
import { communityApi } from '../../api/community'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { gradientFor } from '../../utils/gradient'

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

  async function asignarCoordinador() {
    if (!coordSel) return
    try { await groupsApi.assignCoordinator(id, coordSel); setMsg({ ok: true, text: 'Coordinador designado.' }); setCoordSel(''); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo designar.' }) }
  }

  if (loading) return <p className="text-tea/50">Cargando comisión…</p>
  if (error || !com) return (
    <>
      <Link to="/panel/grupos" className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-caribbean">← Mis grupos</Link>
      <p className="mt-4 text-candy">No se pudo cargar la comisión.</p>
    </>
  )

  const coordinador = miembros.find((m) => m.role === 'Coordinator')
  const ordenados = [...miembros].sort(
    (a, b) => rolOrden[a.role] - rolOrden[b.role] || a.name.localeCompare(b.name, 'es'),
  )

  const tabs = [
    { id: 'tablero', label: 'Tablero' },
    { id: 'integrantes', label: 'Integrantes', badge: miembros.length || undefined },
    // La pestaña de gestión solo existe para quien puede actuar sobre ella.
    ...(puedeGestionar ? [{ id: 'gestion', label: 'Gestión', badge: pendientes.length || undefined }] : []),
  ]

  return (
    <>
      <Link to="/panel/grupos" className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-caribbean">← Mis grupos</Link>

      {/* Cabecera con estado: antes eran el nombre y dos chips, y para saber
          quién coordina o cuánta gente hay tocaba cambiar de pestaña. */}
      <Reveal className="mt-3 mb-6 overflow-hidden rounded-2xl border border-tea/10 bg-jungle">
        <div className="h-1.5 w-full" style={{ background: gradientFor(com.id) }} />
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-cream md:text-3xl">{com.name}</h1>
            <Chip tone="caribbean">Comisión</Chip>
            <Chip tone={com.permanent ? 'gris' : 'terracotta'}>{com.permanent ? 'Permanente' : 'Temporal'}</Chip>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-tea/40">Coordina</p>
              {coordinador ? (
                <div className="mt-1.5 flex items-center gap-2.5">
                  <Avatar id={coordinador.userId} nombre={coordinador.name} foto={coordinador.photoUrl} size="sm" />
                  <Link to={`/perfil/${coordinador.userId}`} target="_blank" className="text-sm text-tea transition hover:text-caribbean">{coordinador.name}</Link>
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-terracotta">Sin designar</p>
              )}
            </div>

            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-tea/40">Integrantes</p>
              {miembros.length > 0 ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <AvatarStack personas={miembros} max={6} size="xs" />
                  <span className="font-mono text-xs text-tea/45">{miembros.length}</span>
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-tea/35">Nadie todavía</p>
              )}
            </div>

            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-tea/40">Equipos</p>
              <p className="mt-1.5 font-display text-lg font-semibold text-cream">{com.teams.length}</p>
            </div>
          </div>

          {/* Avisos accionables en la cabecera: son la razón por la que alguien
              de la Junta entra aquí, y estaban enterrados en otra pestaña. */}
          {puedeGestionar && (pendientes.length > 0 || !coordinador) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {pendientes.length > 0 && (
                <button
                  onClick={() => setTab('gestion')}
                  className="rounded-lg border border-candy/30 bg-candy/10 px-3.5 py-2 text-xs font-medium text-candy transition hover:bg-candy/20"
                >
                  {pendientes.length} {pendientes.length === 1 ? 'postulación pendiente' : 'postulaciones pendientes'} — decidir →
                </button>
              )}
              {!coordinador && (
                <button
                  onClick={() => setTab('gestion')}
                  className="rounded-lg border border-terracotta/30 bg-terracotta/10 px-3.5 py-2 text-xs font-medium text-terracotta transition hover:bg-terracotta/20"
                >
                  Sin coordinador — designar →
                </button>
              )}
            </div>
          )}
        </div>
      </Reveal>

      <PillTabs tabs={tabs} active={tab} onChange={setTab} />

      {/* ── Tablero (por defecto) ────────────────────────── */}
      {tab === 'tablero' && (
        <KanbanBoard groupId={id} members={miembros} currentUserId={user?.id} />
      )}

      {/* ── Integrantes ──────────────────────────────────── */}
      {tab === 'integrantes' && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Integrantes ({miembros.length})</h2>
            <div className="mt-4 space-y-2">
              {miembros.length === 0 && <p className="py-2 text-sm text-tea/45">Aún no hay integrantes.</p>}
              {ordenados.map((m) => (
                <Link
                  key={m.userId}
                  to={`/perfil/${m.userId}`}
                  target="_blank"
                  className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-tea/12 hover:bg-jungle-deep/40"
                >
                  <Avatar id={m.userId} nombre={m.name} foto={m.photoUrl} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm text-tea">{m.name}</span>
                  <Chip tone={rolTono[m.role]}>{rolLabel[m.role] ?? m.role}</Chip>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Equipos ({com.teams.length})</h2>
            <p className="mt-1 text-xs text-tea/40">Subgrupos de trabajo dentro de la comisión, cada uno con su líder.</p>
            <div className="mt-4 space-y-3">
              {com.teams.length === 0 && (
                <p className="rounded-xl border border-dashed border-tea/12 px-4 py-6 text-center text-xs text-tea/35">
                  Sin equipos todavía.{puedeGestionar && ' Créalos desde la pestaña Gestión.'}
                </p>
              )}
              {com.teams.map((t) => {
                const lider = miembros.find((m) => m.name === t.leaderName)
                return (
                  <div key={t.id} className="overflow-hidden rounded-xl border border-tea/10 bg-jungle-deep/40">
                    <div className="h-1 w-full" style={{ background: gradientFor(t.id) }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display text-sm font-semibold uppercase tracking-wide text-cream">{t.name}</p>
                        <span className="flex-none rounded-full bg-tea/10 px-2.5 py-0.5 font-mono text-[0.65rem] text-tea/60">
                          {t.memberCount} {t.memberCount === 1 ? 'integrante' : 'integrantes'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Avatar id={lider?.userId} nombre={t.leaderName || '—'} foto={lider?.photoUrl} size="xs" />
                        <span className="font-mono text-xs text-tea/45">Líder: {t.leaderName || '—'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
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
              <p className="mt-2 text-sm text-tea/45">No hay postulaciones pendientes.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {pendientes.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-tea/10 bg-jungle-deep/40 p-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar id={s.userId} nombre={s.userName} foto={fotos.get(s.userId)} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-tea">{s.userName}</p>
                        <p className="break-all font-mono text-xs text-tea/40">{s.userEmail} · {hace(s.createdAt)}</p>
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
              <p className="mt-1 text-sm text-tea/50">
                Lo designa la Junta Directiva. Un miembro solo puede coordinar una comisión a la vez.
              </p>
              {coordinador && (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-tea/10 bg-jungle-deep/40 p-3">
                  <Avatar id={coordinador.userId} nombre={coordinador.name} foto={coordinador.photoUrl} size="sm" />
                  <div>
                    <p className="text-sm text-tea">{coordinador.name}</p>
                    <p className="font-mono text-[0.65rem] text-tea/40">Coordinador actual</p>
                  </div>
                </div>
              )}
              {miembros.length === 0 ? (
                <p className="mt-3 text-sm text-tea/45">Necesitas integrantes antes de designar coordinador.</p>
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
              <p className="mt-1 text-sm text-tea/50">Un subgrupo con su propio líder dentro de esta comisión.</p>
              <label className={`${labelCls} mt-4 block`}>Nombre</label>
              <input className={`${inputCls} mt-1.5`} value={nuevoEquipo.name} onChange={(e) => setNuevoEquipo((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Producción audiovisual" />
              <label className={`${labelCls} mt-4 block`}>Líder</label>
              <select className={`${inputCls} mt-1.5`} value={nuevoEquipo.leaderUserId} onChange={(e) => setNuevoEquipo((f) => ({ ...f, leaderUserId: e.target.value }))}>
                <option value="">Elige un integrante…</option>
                {ordenados.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
              </select>
              <Btn className="mt-4" onClick={crearEquipo} disabled={miembros.length === 0}>+ Crear equipo</Btn>
              {miembros.length === 0 && <p className="mt-2 font-mono text-[0.65rem] text-tea/40">Necesitas integrantes para poder nombrar un líder.</p>}
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
