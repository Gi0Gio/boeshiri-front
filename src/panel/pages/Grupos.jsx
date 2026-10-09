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

const rolLabel = { Coordinator: 'Coordinas', Leader: 'Lideras', Member: 'Participas' }

/** Cuántas tareas tuyas hay en un grupo, dicho como se diría. */
function textoTareas(n) {
  if (n === 0) return 'Al día'
  return `${n} ${n === 1 ? 'tarea tuya' : 'tareas tuyas'}`
}

/**
 * Ficha de una comisión con sus equipos colgando debajo. Lleva el color de la
 * comisión de punta a punta, y el equipo lo hereda: así se ve de dónde cuelga
 * sin tener que leerlo. Solo dice lo que se mira al entrar: tu papel, tus tareas
 * y quién coordina.
 */
function FichaComision({ g, info, equipos, tareasDe, color }) {
  return (
    <li style={varsDeColor(color)} className="overflow-hidden rounded-3xl border border-[var(--g-solido)]/40 bg-[var(--g-tinte)]">
      <Link to={`/panel/grupos/${g.id}`} className="block p-5 transition hover:brightness-[0.98]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-[var(--g-tinta)]">{g.name}</h2>
          <span className="mt-1 flex-none rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--g-tinta)]">{rolLabel[g.role] ?? g.role}</span>
        </div>
        <p className="mt-3 text-lg font-semibold text-[#002420]">{textoTareas(tareasDe(g.id))}</p>
        {info && (
          <p className="mt-1 text-sm text-[#002420]/80">
            {g.role === 'Coordinator' ? 'La coordinas tú' : info.coordinatorName ? `Coordina ${info.coordinatorName}` : 'Sin coordinador'} · {info.memberCount} {info.memberCount === 1 ? 'persona' : 'personas'}
          </p>
        )}
      </Link>
      {equipos.length > 0 && (
        <ul className="border-t border-[var(--g-solido)]/30 bg-white/50">
          {equipos.map((t) => (
            <li key={t.id} className="border-b border-[var(--g-solido)]/20 last:border-0">
              {/* Un equipo no tiene página propia: su tablero vive en la de la comisión. */}
              <Link to={`/panel/grupos/${g.id}`} className="flex min-h-14 items-center justify-between gap-3 px-5 py-2 transition hover:bg-white/60">
                <span>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--g-tinta)]">Equipo · {rolLabel[t.role]}</span>
                  <span className="block font-semibold text-[#002420]">{t.name}</span>
                </span>
                <span className="flex-none text-sm text-[#002420]/80">{textoTareas(tareasDe(t.id))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Grupos() {
  const { user } = useSession()
  const colorDe = useColoresGrupos()
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data: mios, loading: lm, error: em } = useFetch(() => groupsApi.mine(), [version])
  const { data: comisiones, loading: lc } = useFetch(() => groupsApi.commissions(), [version])
  const { tareas } = useMisTareas(mios, user.id, version)
  const toast = useToast()
  const [busy, setBusy] = useState(null)
  // Unirse es puntual; lo diario es entrar a tus grupos. Va plegado al final.
  const [verUnirse, setVerUnirse] = useState(false)

  const misGrupos = mios ?? []
  const porId = new Map((comisiones ?? []).map((c) => [c.id, c]))
  const misComisiones = misGrupos.filter((g) => g.type === 'Commission')
  const idsMias = new Set(misComisiones.map((g) => g.id))
  const misEquipos = misGrupos.filter((g) => g.type === 'Team')
  // Un equipo cuya comisión no es tuya se muestra aparte, con el color de su madre.
  const equiposSueltos = misEquipos.filter((t) => !idsMias.has(t.parentCommissionId))
  const disponibles = (comisiones ?? []).filter((c) => !idsMias.has(c.id))
  const tareasDe = (id) => tareas.filter((t) => t.grupo.id === id).length

  async function solicitar(id) {
    setBusy(id)
    try {
      const r = await groupsApi.requestJoin(id)
      toast.success(r?.mensaje || 'Solicitud enviada. Quien coordina la revisará.')
      reload()
    } catch (e) {
      toast.error(e.message || 'No se pudo enviar la solicitud.')
    } finally { setBusy(null) }
  }

  return (
    <>
      <PageHeader
        title="Tus grupos"
        description="Las comisiones son permanentes; los equipos se arman dentro de una comisión para algo concreto."
      />

      {lm ? (
        <p className="text-tea/70">Cargando…</p>
      ) : em ? (
        <div className="rounded-2xl border border-candy/30 bg-jungle p-5">
          <p className="text-tea">No se pudieron cargar tus grupos.</p>
          <button type="button" onClick={reload} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">Reintentar</button>
        </div>
      ) : misGrupos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-tea/20 p-6">
          <p className="font-display text-xl font-semibold uppercase tracking-wide text-cream">Aún no estás en ningún grupo</p>
          <p className="mt-2 text-tea/80">Pide entrar a una comisión: quien la coordina recibe tu solicitud.</p>
          <button type="button" onClick={() => setVerUnirse(true)} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-caribbean px-5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-jungle">
            Ver comisiones
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {misComisiones.map((g) => (
            <FichaComision
              key={g.id}
              g={g}
              info={porId.get(g.id)}
              equipos={misEquipos.filter((t) => t.parentCommissionId === g.id)}
              tareasDe={tareasDe}
              color={colorDe(g)}
            />
          ))}
          {equiposSueltos.map((t) => {
            const madre = porId.get(t.parentCommissionId)
            return (
              <li key={t.id} style={varsDeColor(colorDe(t))} className="overflow-hidden rounded-3xl border border-[var(--g-solido)]/40 bg-[var(--g-tinte)]">
                <Link to={`/panel/grupos/${t.parentCommissionId}`} className="block p-5">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--g-tinta)]">Equipo · {rolLabel[t.role]}{madre ? ` · en ${madre.name}` : ''}</span>
                  <h2 className="mt-1 font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-[var(--g-tinta)]">{t.name}</h2>
                  <p className="mt-2 font-semibold text-[#002420]">{textoTareas(tareasDe(t.id))}</p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {/* ── Unirse a otra comisión (plegable) ── */}
      <section className="mt-10">
        <button
          type="button"
          onClick={() => setVerUnirse((v) => !v)}
          aria-expanded={verUnirse}
          className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-tea/10 bg-jungle px-5 text-left transition hover:border-caribbean/40"
        >
          <span className="font-semibold text-cream">
            Unirme a otra comisión
            <span className="ml-2 font-normal text-tea/70">{lc ? '' : `· ${disponibles.length} ${disponibles.length === 1 ? 'disponible' : 'disponibles'}`}</span>
          </span>
          <Ico name="abajo" className={`h-5 w-5 flex-none text-caribbean transition-transform ${verUnirse ? 'rotate-180' : ''}`} />
        </button>

        {verUnirse && (
          <ul className="mt-3 space-y-2.5">
            {disponibles.length === 0 && <li className="rounded-2xl border border-tea/10 bg-jungle p-5 text-tea/80">Ya estás en todas las comisiones del colectivo.</li>}
            {disponibles.map((c) => (
              <li key={c.id} style={varsDeColor(colorDe(c))} className="flex items-center gap-4 rounded-2xl border border-tea/10 bg-jungle p-4">
                <span className="h-3 w-3 flex-none rounded-full bg-[var(--g-solido)]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-cream">{c.name}</p>
                  <p className="text-sm text-tea/70">{c.coordinatorName ? `Coordina ${c.coordinatorName}` : 'Sin coordinador'} · {c.memberCount} {c.memberCount === 1 ? 'persona' : 'personas'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => solicitar(c.id)}
                  disabled={busy === c.id}
                  className="min-h-11 flex-none rounded-full border border-caribbean/40 px-4 text-sm font-semibold text-caribbean transition hover:bg-caribbean hover:text-jungle disabled:opacity-50"
                >
                  {busy === c.id ? '…' : 'Pedir entrar'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
