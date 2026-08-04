import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Reveal } from '../ui'
import { groupsApi } from '../../api/groups'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'
import { gradientFor } from '../../utils/gradient'

const rolLabel = { Coordinator: 'Coordinador', Leader: 'Líder', Member: 'Miembro' }
const rolTono = { Coordinator: 'caribbean', Leader: 'terracotta', Member: 'gris' }

/**
 * Tarjeta de un grupo propio. Los equipos enlazan a su comisión madre, y ahora
 * dicen cuál es: «Ver comisión madre →» obligaba a entrar para averiguarlo.
 *
 * `comision` es la entrada del listado que ya se descarga en esta página —la
 * propia si es comisión, la madre si es equipo—, así que el contexto extra no
 * cuesta ninguna petición.
 */
function TarjetaGrupo({ g, i, comision }) {
  const destino = g.type === 'Commission' ? g.id : g.parentCommissionId
  const esComision = g.type === 'Commission'

  return (
    <Reveal delay={(i % 3) * 90} className="h-full">
      <Link
        to={destino ? `/panel/grupos/${destino}` : '#'}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-tea/10 bg-jungle transition hover:-translate-y-1 hover:border-caribbean/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
      >
        <div className="h-1.5 w-full" style={{ background: gradientFor(destino || g.id) }} />
        <div className="flex flex-1 flex-col p-6">
          <Chip tone={rolTono[g.role] ?? 'gris'}>{rolLabel[g.role] ?? g.role}</Chip>
          <h3 className="mt-4 font-display text-lg font-semibold uppercase leading-tight tracking-wide text-cream">{g.name}</h3>

          {!esComision && comision && (
            <p className="mt-2 font-mono text-xs text-tea/45">En {comision.name}</p>
          )}
          {esComision && comision && (
            <p className="mt-2 font-mono text-xs text-tea/45">
              {comision.coordinatorName || 'Sin coordinador'} · {comision.memberCount} integrantes
            </p>
          )}

          <span className="mt-auto pt-4 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-caribbean">
            {esComision ? 'Ver comisión →' : 'Ver comisión madre →'}
          </span>
        </div>
      </Link>
    </Reveal>
  )
}

export default function Grupos() {
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data: mios, loading: lm } = useFetch(() => groupsApi.mine(), [version])
  const { data: comisiones, loading: lc } = useFetch(() => groupsApi.commissions(), [version])
  const toast = useToast()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }
  const [busy, setBusy] = useState(null)
  // Postularse es algo puntual; lo habitual es entrar a tus grupos. Va plegado
  // para no empujar hacia abajo lo que se usa a diario.
  const [verPostular, setVerPostular] = useState(false)

  const misGrupos = mios ?? []
  const misComisiones = misGrupos.filter((g) => g.type === 'Commission')
  const misEquipos = misGrupos.filter((g) => g.type === 'Team')
  const idsMisComisiones = new Set(misComisiones.map((g) => g.id))

  const disponibles = (comisiones ?? []).filter((c) => !idsMisComisiones.has(c.id))
  const porId = new Map((comisiones ?? []).map((c) => [c.id, c]))
  // Para un equipo, la comisión relevante es la madre; para una comisión, ella misma.
  const contextoDe = (g) => porId.get(g.type === 'Commission' ? g.id : g.parentCommissionId)

  async function solicitar(id) {
    setBusy(id); setMsg(null)
    try {
      const r = await groupsApi.requestJoin(id)
      setMsg({ ok: true, text: r?.mensaje || 'Solicitud enviada. El coordinador la revisará.' })
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo enviar la solicitud.' })
    } finally { setBusy(null) }
  }

  return (
    <>
      <PageHeader
        eyebrow="Miembro"
        title="Mis grupos"
        description="Comisiones (permanentes) y equipos (temporales). Entra a un grupo para ver su tablero de tareas y sus integrantes."
      />

      {lm ? <p className="text-tea/50">Cargando…</p> : (
        <>
          {/* ── Comisiones ─────────────────────────────────── */}
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">
            Mis comisiones <span className="font-mono text-sm font-normal text-tea/40">({misComisiones.length})</span>
          </h2>
          {misComisiones.length === 0 ? (
            <Card className="mt-3"><p className="text-sm text-tea/55">Aún no perteneces a ninguna comisión. Puedes postularte abajo.</p></Card>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {misComisiones.map((g, i) => <TarjetaGrupo key={g.id} g={g} i={i} comision={contextoDe(g)} />)}
            </div>
          )}

          {/* ── Equipos ────────────────────────────────────── */}
          <h2 className="mt-10 font-display text-lg font-semibold uppercase tracking-wide text-cream">
            Mis equipos <span className="font-mono text-sm font-normal text-tea/40">({misEquipos.length})</span>
          </h2>
          {misEquipos.length === 0 ? (
            <Card className="mt-3"><p className="text-sm text-tea/55">No estás en ningún equipo. Los crea el coordinador de cada comisión.</p></Card>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {misEquipos.map((g, i) => <TarjetaGrupo key={g.id} g={g} i={i} comision={contextoDe(g)} />)}
            </div>
          )}
        </>
      )}

      {/* ── Postularme a una comisión (plegable) ──────────── */}
      <div className="mt-10">
        <button
          type="button"
          onClick={() => setVerPostular((v) => !v)}
          aria-expanded={verPostular}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-tea/10 bg-jungle px-5 py-4 text-left transition hover:border-caribbean/40"
        >
          <span>
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-cream">Postularme a una comisión</span>
            <span className="mt-0.5 block font-mono text-xs text-tea/45">
              {lc ? 'Cargando…' : `${disponibles.length} disponibles`}
            </span>
          </span>
          <span className={`flex-none font-mono text-xs text-caribbean transition-transform ${verPostular ? 'rotate-180' : ''}`}>▾</span>
        </button>

        {verPostular && (
          <Reveal className="mt-3">
            {disponibles.length === 0 ? (
              <Card><p className="text-sm text-tea/55">Ya perteneces a todas las comisiones del colectivo.</p></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {disponibles.map((c) => (
                  <Card key={c.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link to={`/panel/grupos/${c.id}`} className="font-display text-base font-semibold uppercase tracking-wide text-cream hover:text-caribbean">{c.name}</Link>
                      <p className="mt-1 font-mono text-xs text-tea/45">{c.coordinatorName || 'Sin coordinador'} · {c.memberCount} miembros</p>
                    </div>
                    <button
                      onClick={() => solicitar(c.id)}
                      disabled={busy === c.id}
                      className="flex-none rounded-full border border-tea/25 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-tea transition hover:border-caribbean hover:text-caribbean disabled:opacity-50"
                    >
                      {busy === c.id ? '…' : 'Postularme'}
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </Reveal>
        )}
      </div>
    </>
  )
}
