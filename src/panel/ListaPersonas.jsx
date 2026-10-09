import { Link } from 'react-router-dom'
import { Avatar, Chip } from './ui'

const rolLabel = { Coordinator: 'Coordinador', Leader: 'Líder', Member: 'Miembro' }
const rolTono = { Coordinator: 'caribbean', Leader: 'terracotta', Member: 'gris' }
/** Quien manda arriba: una lista de gente se lee buscando primero al responsable. */
const rolOrden = { Coordinator: 0, Leader: 1, Member: 2 }

export const ordenarPersonas = (miembros) =>
  [...miembros].sort((a, b) => rolOrden[a.role] - rolOrden[b.role] || a.name.localeCompare(b.name, 'es'))

/** «2 tareas» / «Sin tareas»: la carga se dice, no se dibuja. */
function textoCarga(n) {
  if (!n) return 'Sin tareas'
  return `${n} ${n === 1 ? 'tarea' : 'tareas'}`
}

/**
 * Integrantes de un grupo con su papel y cuántas tareas activas lleva cada uno.
 * Con `carga` (de useCargaTareas) se ve de un vistazo a quién darle la próxima.
 * `puedeSacar(m)` decide fila por fila si aparece «Sacar».
 */
export default function ListaPersonas({ miembros, userId, carga, puedeSacar, onSacar, contexto }) {
  if (miembros.length === 0) {
    return <p className="rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">Aún no hay nadie en {contexto}.</p>
  }
  const maxCarga = Math.max(0, ...miembros.map((m) => carga?.porPersona.get(m.userId) ?? 0))

  return (
    <ul className="overflow-hidden rounded-2xl border border-tea/10 bg-jungle">
      {ordenarPersonas(miembros).map((m) => {
        const n = carga?.porPersona.get(m.userId) ?? 0
        return (
          <li key={m.userId} className="flex items-center border-b border-tea/10 last:border-0">
            <Link to={`/perfil/${m.userId}`} target="_blank" className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-2 transition hover:bg-tea/5">
              <Avatar id={m.userId} nombre={m.name} foto={m.photoUrl} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-tea">{m.userId === userId ? `${m.name} (tú)` : m.name}</span>
                  {m.role !== 'Member' && <Chip tone={rolTono[m.role]}>{rolLabel[m.role] ?? m.role}</Chip>}
                </span>
                {carga && (
                  // Quien más lleva se lee en tinta llena; el resto, más quieto.
                  <span className={`mt-0.5 block font-mono text-xs tracking-[0.06em] ${n > 0 && n === maxCarga ? 'text-cream' : 'text-tea/70'}`}>
                    {textoCarga(n)}
                  </span>
                )}
              </span>
            </Link>
            {puedeSacar?.(m) && (
              <button type="button" onClick={() => onSacar(m)} aria-label={`Sacar a ${m.name} de ${contexto}`}
                className="mr-2 inline-flex min-h-11 flex-none items-center px-3 text-sm font-semibold text-tea/70 hover:text-candy">
                Sacar
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
