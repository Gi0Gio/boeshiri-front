import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession, alcanza } from '../../auth/SessionContext'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'
import { groupsApi } from '../../api/groups'
import { gritosApi } from '../../api/gritos'
import { publicationsApi } from '../../api/publications'
import { tasksApi } from '../../api/tasks'
import { useColoresGrupos, varsDeColor } from '../colores'
import { useMisTareas, siguientePaso, TEXTO_PASO, ESTADO } from '../tareas'
import { usePendientesJunta } from '../pendientes'
import Ico from '../Ico'

const fmtDia = (iso) =>
  new Date(iso).toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'short' })
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit' })

function Seccion({ titulo, accion, children }) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-cream">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  )
}

const enlaceSec = 'inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline'

/** Una tarea tuya: el color de su grupo a la izquierda y el siguiente paso a mano. */
function FilaTarea({ t, color, paso, ocupado, onPaso }) {
  const destino = t.grupo.type === 'Team' ? t.grupo.parentCommissionId : t.grupo.id
  return (
    <li className="flex items-stretch overflow-hidden rounded-2xl border border-tea/10 bg-jungle" style={varsDeColor(color)}>
      <Link to={`/panel/grupos/${destino}`} className="min-w-0 flex-1 px-4 py-3.5">
        <p className="font-medium leading-snug text-cream">{t.title}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="rounded-full bg-[var(--g-tinte)] px-2.5 py-0.5 text-xs font-semibold text-[var(--g-tinta)]">{t.grupo.name}</span>
          <span className="text-tea/70">{ESTADO[t.status].label}</span>
        </p>
      </Link>
      {paso && (
        <div className="flex flex-none items-center pr-3">
          <button
            type="button"
            onClick={onPaso}
            disabled={ocupado}
            className="min-h-11 rounded-full border border-caribbean/40 px-4 text-sm font-semibold text-caribbean transition hover:bg-caribbean hover:text-jungle disabled:opacity-50"
          >
            {ocupado ? '…' : TEXTO_PASO[paso]}
          </button>
        </div>
      )}
    </li>
  )
}

export default function Dashboard() {
  const { user, rol, hasPermission } = useSession()
  const toast = useToast()
  const colorDe = useColoresGrupos()
  const [version, setVersion] = useState(0)
  const [ocupado, setOcupado] = useState(null)

  const { data: grupos, error: errorGrupos } = useFetch(() => groupsApi.mine(), [])
  const { tareas, cargando, error } = useMisTareas(grupos, user.id, version)
  const { data: gritos } = useFetch(() => gritosApi.list().catch(() => []), [])
  const { data: pubs } = useFetch(() => publicationsApi.mine().catch(() => []), [])
  const puedeJunta = alcanza(rol, 'junta')
  const pendientes = usePendientesJunta(hasPermission, puedeJunta)

  const nombre = user.fullName.split(' ')[0]
  const abiertos = (gritos ?? []).slice(0, 3)
  const ultima = (pubs ?? [])[0]

  async function avanzar(t, paso) {
    setOcupado(t.id)
    try {
      await tasksApi.move(t.id, paso)
      toast.success(paso === 'Done' ? 'Tarea hecha.' : paso === 'InReview' ? 'Entregada para revisión.' : 'En proceso.')
      setVersion((v) => v + 1)
    } catch (e) {
      toast.error(e.message || 'No se pudo mover la tarea.')
    } finally { setOcupado(null) }
  }

  const resumen = cargando && !errorGrupos
    ? 'Mirando tus grupos…'
    : [
        tareas.length === 0 ? 'No tienes tareas pendientes' : `Tienes ${tareas.length} ${tareas.length === 1 ? 'tarea' : 'tareas'}`,
        abiertos.length > 0 && `${gritos.length} ${gritos.length === 1 ? 'grito abierto' : 'gritos abiertos'}`,
      ].filter(Boolean).join(' y ') + '.'

  return (
    <>
      <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-cream md:text-4xl">Hola, {nombre}</h1>
      <p className="mt-2 text-tea/80">{resumen}</p>

      {/* La Junta se entera aquí de que hay algo esperando, sin tener que
          cambiar de sombrero para comprobarlo. */}
      {puedeJunta && pendientes.total > 0 && (
        <Link
          to="/panel/admin"
          className="bg-dorace-pattern mt-6 flex items-center justify-between gap-4 rounded-2xl bg-[#002420] px-5 py-4 text-[#d9f2c2] transition hover:brightness-110"
        >
          <span>
            <span className="block font-display text-lg font-semibold uppercase tracking-wide text-[#f6fbef]">
              {pendientes.total} {pendientes.total === 1 ? 'cosa espera' : 'cosas esperan'} a la Junta
            </span>
            <span className="text-sm">Postulantes, solicitudes y comisiones sin coordinar.</span>
          </span>
          <span className="flex flex-none items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-[#00e6bc]">Ir <Ico name="ir" className="h-4 w-4" /></span>
        </Link>
      )}

      <Seccion titulo="Tus tareas" accion={<Link to="/panel/grupos" className={enlaceSec}>Tus grupos</Link>}>
        {/* Sin grupos no hay tableros que pedir: el error de grupos va antes que la carga. */}
        {cargando && !errorGrupos ? (
          <p className="text-tea/70">Cargando…</p>
        ) : error || errorGrupos ? (
          <div className="rounded-2xl border border-candy/30 bg-jungle p-5">
            <p className="text-tea">No se pudieron cargar tus tareas.</p>
            <button type="button" onClick={() => setVersion((v) => v + 1)} className={`${enlaceSec} mt-1`}>Reintentar</button>
          </div>
        ) : tareas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-tea/20 p-5">
            <p className="text-tea">Nada pendiente en tus grupos.</p>
            <p className="mt-1 text-sm text-tea/70">
              {(grupos ?? []).length === 0 ? 'Todavía no estás en ningún grupo.' : 'Cuando te asignen una tarea, aparecerá aquí.'}{' '}
              <Link to="/panel/grupos" className="font-semibold text-caribbean hover:underline">
                {(grupos ?? []).length === 0 ? 'Únete a una comisión' : 'Ver tus grupos'}
              </Link>
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {tareas.map((t) => {
              const paso = siguientePaso(t, { esGestor: t.grupo.role === 'Coordinator' || t.grupo.role === 'Leader', userId: user.id })
              return (
                <FilaTarea key={t.id} t={t} color={colorDe(t.grupo)} paso={paso} ocupado={ocupado === t.id} onPaso={() => avanzar(t, paso)} />
              )
            })}
          </ul>
        )}
      </Seccion>

      <Seccion titulo="Gritos abiertos" accion={<Link to="/explorar" className={enlaceSec}>Ver en el Mural</Link>}>
        {abiertos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">
            Ningún grito abierto ahora mismo.{' '}
            <Link to="/explorar" className="font-semibold text-caribbean hover:underline">Echa uno</Link>
          </p>
        ) : (
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {abiertos.map((g) => (
              <li key={g.id}>
                {/* Un grito se reconoce por su megáfono y sus cupos, no por un
                    bloque de color: el rojo ya lo usan un grupo y las alertas. */}
                <Link to="/explorar" className="block h-full rounded-2xl border border-tea/10 bg-jungle p-4 transition hover:border-caribbean/40">
                  <p className="flex items-center gap-2 text-sm font-semibold text-tea/80">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tea/5 text-cream"><Ico name="grito" className="h-[18px] w-[18px]" /></span>
                    {g.authorName.split(' ')[0]} echó un grito
                  </p>
                  <p className="mt-3 font-display text-lg font-semibold uppercase leading-tight tracking-wide text-cream">{g.title}</p>
                  <p className="mt-1.5 text-sm text-tea/80">
                    <span className="capitalize">{fmtDia(g.happensAt)}</span> · {fmtHora(g.happensAt)} · {g.place}
                  </p>
                  {/* Cupos como fichas llenas y vacías: el estado se lee sin contar. */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex gap-1" aria-hidden="true">
                      {Array.from({ length: Math.min(g.slots, 8) }, (_, i) => (
                        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < g.taken ? 'bg-cream' : 'border border-tea/30'}`} />
                      ))}
                    </span>
                    <span className="text-sm font-semibold text-cream">{g.taken} de {g.slots} van</span>
                    {g.joined && <span className="rounded-full bg-caribbean/12 px-2.5 py-0.5 text-xs font-semibold text-caribbean">Vas</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion titulo="Lo último que publicaste" accion={<Link to="/panel/publicaciones" className={enlaceSec}>Tus publicaciones</Link>}>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-tea/10 bg-jungle p-5">
          {ultima ? (
            <Link to={`/publicaciones/${ultima.id}`} className="min-w-0">
              <p className="truncate font-display text-lg font-semibold uppercase tracking-wide text-cream hover:text-caribbean">{ultima.title}</p>
              <p className="text-sm text-tea/70">{new Date(ultima.createdAt).toLocaleDateString('es-PA', { day: 'numeric', month: 'long' })}</p>
            </Link>
          ) : (
            <p className="text-tea/80">Aún no has publicado en el Mural.</p>
          )}
          <Link to="/panel/publicaciones" className="inline-flex min-h-11 items-center rounded-full bg-caribbean px-5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-jungle transition hover:-translate-y-0.5">
            Publicar algo
          </Link>
        </div>
      </Seccion>
    </>
  )
}
