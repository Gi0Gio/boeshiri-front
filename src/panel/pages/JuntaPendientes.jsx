import { Link } from 'react-router-dom'
import { PageHeader } from '../ui'
import Ico from '../Ico'
import { useSession } from '../../auth/SessionContext'
import { usePendientesJunta } from '../pendientes'
import { hace } from '../avisos'

/**
 * Portada del modo Junta: lo que espera una decisión, y nada más. Cada cosa es
 * una fila con su acción al final, siempre en el mismo sitio; la acción lleva a
 * la pantalla donde se decide, que aquí no se repite.
 */
function Bloque({ titulo, n, vacio, children }) {
  return (
    <section className="rounded-2xl border border-tea/10 bg-jungle">
      {/* La cifra va en línea con el texto (no como hijo de flex): si el título
          parte en dos líneas, la cifra sigue pegada a la última palabra. */}
      <h2 className="px-5 pt-5 font-display text-xl font-semibold uppercase tracking-wide text-cream">
        {titulo}
        {n > 0 && <span className="ml-2 inline-block rounded-full bg-candy px-2.5 py-0.5 align-[0.15em] font-mono text-sm leading-tight text-white">{n}</span>}
      </h2>
      {n === 0 ? <p className="px-5 pb-5 pt-2 text-tea/70">{vacio}</p> : <ul className="mt-2 divide-y divide-tea/10">{children}</ul>}
    </section>
  )
}

function Fila({ titulo, detalle, cita, a, accion }) {
  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-cream">{titulo}</p>
        {detalle && <p className="text-sm text-tea/70">{detalle}</p>}
        {cita && <p className="mt-1.5 text-sm leading-relaxed text-tea/85">«{cita}»</p>}
      </div>
      <Link to={a} className="inline-flex min-h-11 flex-none items-center gap-1.5 text-sm font-semibold text-caribbean hover:underline">
        {accion} <Ico name="ir" className="h-4 w-4" />
      </Link>
    </li>
  )
}

export default function JuntaPendientes() {
  const { hasPermission } = useSession()
  const { cargando, postulantes, solicitudes, sinCoordinador, total } = usePendientesJunta(hasPermission)
  const decidibles = postulantes.filter((p) => p.emailVerified)
  const sinVerificar = postulantes.length - decidibles.length

  return (
    <>
      <PageHeader
        title="Pendientes"
        description={cargando ? 'Revisando…' : total === 0 ? 'Nada espera a la Junta ahora mismo.' : `${total} ${total === 1 ? 'cosa espera' : 'cosas esperan'} una decisión.`}
      />

      {!cargando && (
        <div className="space-y-4">
          {hasPermission('postulantes.decidir') && (
            <Bloque titulo="Postulantes" n={decidibles.length}
              vacio={sinVerificar > 0 ? `${sinVerificar} ${sinVerificar === 1 ? 'persona aún no verifica' : 'personas aún no verifican'} su correo; se podrán decidir después.` : 'Nadie esperando entrar al colectivo.'}>
              {decidibles.map((p) => (
                <Fila key={p.id} titulo={p.fullName} detalle={[p.discipline, `se postuló ${hace(p.registeredAt)}`].filter(Boolean).join(' · ')}
                  cita={p.applicationReason} a="/panel/admin/miembros" accion="Decidir" />
              ))}
            </Bloque>
          )}

          {hasPermission('comisiones.ver_todas') && (
            <Bloque titulo="Quieren entrar a una comisión" n={solicitudes.length} vacio="No hay solicitudes para entrar a comisiones.">
              {solicitudes.map((s) => (
                <Fila key={s.id} titulo={s.userName} detalle={`A ${s.comision.name} · ${hace(s.createdAt)}`} a={`/panel/grupos/${s.comision.id}`} accion="Decidir" />
              ))}
            </Bloque>
          )}

          {hasPermission('comisiones.ver_todas') && (
            <Bloque titulo="Comisiones sin coordinador" n={sinCoordinador.length} vacio="Todas las comisiones tienen quien las coordine.">
              {sinCoordinador.map((c) => (
                <Fila key={c.id} titulo={c.name} detalle={`${c.memberCount} ${c.memberCount === 1 ? 'persona' : 'personas'}`} a={`/panel/grupos/${c.id}`} accion="Designar" />
              ))}
            </Bloque>
          )}
        </div>
      )}
    </>
  )
}
