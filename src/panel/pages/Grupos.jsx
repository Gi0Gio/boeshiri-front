import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Reveal } from '../ui'
import { groupsApi } from '../../api/groups'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'

const tipoLabel = { Commission: 'Comisión', Team: 'Equipo' }
const tipoTono = { Commission: 'caribbean', Team: 'terracotta' }
const rolLabel = { Coordinator: 'Coordinador', Leader: 'Líder', Member: 'Miembro' }

export default function Grupos() {
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data: mios, loading: lm } = useFetch(() => groupsApi.mine(), [version])
  const { data: comisiones, loading: lc } = useFetch(() => groupsApi.commissions(), [version])
  const toast = useToast()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }
  const [busy, setBusy] = useState(null)

  const misGrupos = mios ?? []
  const idsMisComisiones = new Set(misGrupos.filter((g) => g.type === 'Commission').map((g) => g.id))

  async function solicitar(id) {
    setBusy(id); setMsg(null)
    try {
      const r = await groupsApi.requestJoin(id)
      setMsg({ ok: true, text: r?.mensaje || 'Solicitud enviada.' })
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo enviar la solicitud.' })
    } finally { setBusy(null) }
  }

  return (
    <>
      <PageHeader eyebrow="Miembro" title="Mis grupos" description="Comisiones (permanentes) y equipos (temporales). Entra a un grupo para ver sus integrantes y equipos." />


      {lm ? <p className="text-tea/50">Cargando…</p> : misGrupos.length === 0 ? (
        <Card><p className="text-sm text-tea/55">Aún no perteneces a ningún grupo. Solicita unirte a una comisión abajo.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {misGrupos.map((g, i) => {
            const destino = g.type === 'Commission' ? g.id : g.parentCommissionId
            return (
              <Reveal key={g.id} delay={(i % 3) * 90}>
                <Link to={destino ? `/panel/grupos/${destino}` : '#'} className="block h-full rounded-2xl border border-tea/10 bg-jungle p-6 transition hover:-translate-y-1 hover:border-caribbean/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center justify-between">
                    <Chip tone={tipoTono[g.type]}>{tipoLabel[g.type] ?? g.type}</Chip>
                    <Chip tone="gris">{rolLabel[g.role] ?? g.role}</Chip>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold uppercase leading-tight tracking-wide text-cream">{g.name}</h3>
                  <span className="mt-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-caribbean">Ver comisión →</span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      )}

      <h2 className="mt-12 font-display text-xl font-semibold uppercase tracking-wide text-cream">Comisiones del colectivo</h2>
      <p className="mt-1 text-sm text-tea/50">Áreas permanentes de trabajo. Puedes solicitar unirte a una.</p>
      {lc ? <p className="mt-4 text-tea/50">Cargando comisiones…</p> : (comisiones ?? []).length === 0 ? (
        <Card className="mt-5"><p className="text-sm text-tea/55">Aún no hay comisiones.</p></Card>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {comisiones.map((c, i) => {
            const miembro = idsMisComisiones.has(c.id)
            return (
              <Reveal key={c.id} delay={(i % 2) * 90}>
                <Card className="flex items-center justify-between gap-4">
                  <div>
                    <Link to={`/panel/grupos/${c.id}`} className="font-display text-base font-semibold uppercase tracking-wide text-cream hover:text-caribbean">{c.name}</Link>
                    <p className="mt-1 font-mono text-xs text-tea/45">{c.coordinatorName || 'Sin coordinador'} · {c.memberCount} miembros</p>
                  </div>
                  {miembro ? (
                    <Chip tone="caribbean">Ya eres miembro</Chip>
                  ) : (
                    <button onClick={() => solicitar(c.id)} disabled={busy === c.id} className="flex-none rounded-full border border-tea/25 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-tea transition hover:border-caribbean hover:text-caribbean disabled:opacity-50">
                      {busy === c.id ? '…' : 'Solicitar'}
                    </button>
                  )}
                </Card>
              </Reveal>
            )
          })}
        </div>
      )}
    </>
  )
}
