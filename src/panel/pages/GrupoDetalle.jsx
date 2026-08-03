import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, Chip, Btn, Reveal, PillTabs, inputCls, labelCls } from '../ui'
import KanbanBoard from '../KanbanBoard'
import { groupsApi } from '../../api/groups'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'

const rolLabel = { Coordinator: 'Coordinador', Leader: 'Líder', Member: 'Miembro' }
const rolTono = { Coordinator: 'caribbean', Leader: 'terracotta', Member: 'gris' }

export default function GrupoDetalle() {
  const { id } = useParams()
  const { user, hasPermission } = useSession()
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)

  const { data: com, loading, error } = useFetch(() => groupsApi.commission(id), [id, version])
  const toast = useToast()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }
  const [nuevoEquipo, setNuevoEquipo] = useState({ name: '', leaderUserId: '' })
  const [coordSel, setCoordSel] = useState('')
  const [tab, setTab] = useState('tablero')

  const miembros = com?.members ?? []
  const esCoordinador = miembros.some((m) => m.userId === user?.id && m.role === 'Coordinator')
  // La Junta ve y gestiona cualquier comisión (RF-ADM-05); el coordinador, la suya.
  const puedeGestionar = hasPermission('comisiones.ver_todas') || esCoordinador

  const { data: solicitudes } = useFetch(
    () => (puedeGestionar && com ? groupsApi.joinRequests(id) : Promise.resolve([])),
    [id, version, puedeGestionar, !!com],
  )
  const pendientes = solicitudes ?? []

  async function decidir(reqId, decision) {
    setMsg(null)
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

  const tabs = [
    { id: 'tablero', label: 'Tablero' },
    { id: 'integrantes', label: 'Integrantes', badge: miembros.length || undefined },
    // La pestaña de gestión solo existe para quien puede actuar sobre ella.
    ...(puedeGestionar ? [{ id: 'gestion', label: 'Gestión', badge: pendientes.length || undefined }] : []),
  ]

  return (
    <>
      <Link to="/panel/grupos" className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-caribbean">← Mis grupos</Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-cream">{com.name}</h1>
        <Chip tone="caribbean">Comisión</Chip>
        {com.permanent && <Chip tone="gris">Permanente</Chip>}
      </div>

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
            <div className="mt-3 divide-y divide-tea/8">
              {miembros.length === 0 && <p className="py-2 text-sm text-tea/45">Aún no hay integrantes.</p>}
              {miembros.map((m) => (
                <div key={m.userId} className="flex items-center justify-between py-2.5">
                  <Link to={`/perfil/${m.userId}`} target="_blank" className="text-sm text-tea hover:text-caribbean">{m.name}</Link>
                  <Chip tone={rolTono[m.role]}>{rolLabel[m.role] ?? m.role}</Chip>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Equipos ({com.teams.length})</h2>
            <div className="mt-3 space-y-2">
              {com.teams.length === 0 && <p className="text-sm text-tea/45">Sin equipos todavía.</p>}
              {com.teams.map((t) => (
                <div key={t.id} className="rounded-xl border border-tea/10 bg-jungle-deep/40 p-3">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-cream">{t.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-tea/45">Líder: {t.leaderName || '—'} · {t.memberCount} integrantes</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Gestión (coordinador o Junta) ────────────────── */}
      {tab === 'gestion' && puedeGestionar && (
        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">
              Postulaciones para entrar ({pendientes.length})
            </h2>
            {pendientes.length === 0 ? (
              <p className="mt-2 text-sm text-tea/45">No hay postulaciones pendientes.</p>
            ) : (
              <div className="mt-3 divide-y divide-tea/8">
                {pendientes.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-tea">{s.userName}</p>
                      <p className="break-all font-mono text-xs text-tea/45">{s.userEmail}</p>
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

          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Coordinador</h2>
            <p className="mt-1 text-sm text-tea/50">
              Lo designa la Junta Directiva. Un miembro solo puede coordinar una comisión a la vez.
            </p>
            {miembros.length === 0 ? (
              <p className="mt-3 text-sm text-tea/45">Necesitas integrantes antes de designar coordinador.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <select value={coordSel} onChange={(e) => setCoordSel(e.target.value)} className={`${inputCls} flex-1`}>
                  <option value="">Elige un integrante…</option>
                  {miembros.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
                </select>
                <Btn onClick={asignarCoordinador} disabled={!coordSel}>Designar</Btn>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Nuevo equipo</h2>
            <label className={`${labelCls} mt-4 block`}>Nombre</label>
            <input className={`${inputCls} mt-1.5`} value={nuevoEquipo.name} onChange={(e) => setNuevoEquipo((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre del equipo" />
            <label className={`${labelCls} mt-4 block`}>Líder</label>
            <select className={`${inputCls} mt-1.5`} value={nuevoEquipo.leaderUserId} onChange={(e) => setNuevoEquipo((f) => ({ ...f, leaderUserId: e.target.value }))}>
              <option value="">Elige un integrante…</option>
              {miembros.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
            </select>
            <Btn className="mt-4" onClick={crearEquipo}>+ Crear equipo</Btn>
          </Card>
        </div>
      )}
    </>
  )
}
