import { useState } from 'react'
import { PageHeader } from '../ui'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'
import { notificationsApi } from '../../api/notifications'
import { useSinLeer, hace } from '../avisos'

/**
 * Los avisos, en un solo sitio (RF-TRA-02). Antes vivían a la vez en una campana
 * de la cabecera y en «Actividad reciente» del inicio, con la misma lista dos veces.
 * Los no leídos van primero; tocar uno lo marca como leído.
 */
export default function Avisos() {
  const toast = useToast()
  const { sinLeer, fijar } = useSinLeer()
  const [version, setVersion] = useState(0)
  const { data, loading, error } = useFetch(() => notificationsApi.list(), [version])
  const [locales, setLocales] = useState({}) // id → leído, para no recargar la lista entera

  const avisos = (data ?? []).map((a) => ({ ...a, read: a.read || locales[a.id] }))
  const nuevos = avisos.filter((a) => !a.read)
  const vistos = avisos.filter((a) => a.read)

  async function marcar(a) {
    if (a.read) return
    try {
      await notificationsApi.markRead(a.id)
      setLocales((l) => ({ ...l, [a.id]: true }))
      fijar(Math.max(0, sinLeer - 1))
    } catch (e) {
      toast.error(e.message || 'No se pudo marcar como leído.')
    }
  }

  async function marcarTodos() {
    try {
      await notificationsApi.markAllRead()
      setLocales(Object.fromEntries(avisos.map((a) => [a.id, true])))
      fijar(0)
    } catch (e) {
      toast.error(e.message || 'No se pudieron marcar.')
    }
  }

  const lista = (items) => (
    <ul className="overflow-hidden rounded-2xl border border-tea/10 bg-jungle">
      {items.map((a) => (
        <li key={a.id} className="border-b border-tea/10 last:border-0">
          <button
            type="button"
            onClick={() => marcar(a)}
            className="flex w-full gap-3 px-4 py-4 text-left transition hover:bg-tea/5"
            aria-label={a.read ? undefined : `${a.message} (sin leer; tocar para marcar como leído)`}
          >
            <span className={`mt-2 h-2.5 w-2.5 flex-none rounded-full ${a.read ? 'bg-transparent' : 'bg-candy'}`} aria-hidden="true" />
            <span className="min-w-0">
              <span className={`block leading-snug ${a.read ? 'text-tea/80' : 'font-medium text-cream'}`}>{a.message}</span>
              <span className="mt-1 block text-sm text-tea/70">{hace(a.createdAt)}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <PageHeader
        title="Avisos"
        actions={nuevos.length > 0 && (
          <button type="button" onClick={marcarTodos} className="inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">
            Marcar todo como leído
          </button>
        )}
      />

      {loading ? (
        <p className="text-tea/70">Cargando…</p>
      ) : error ? (
        <div className="rounded-2xl border border-candy/30 bg-jungle p-5">
          <p className="text-tea">No se pudieron cargar los avisos.</p>
          <button type="button" onClick={() => setVersion((v) => v + 1)} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">
            Reintentar
          </button>
        </div>
      ) : avisos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-tea/20 p-6 text-center text-tea/80">
          No tienes avisos. Te avisaremos aquí cuando te asignen una tarea o alguien eche un grito.
        </p>
      ) : (
        <>
          {nuevos.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-cream">Sin leer · {nuevos.length}</h2>
              {lista(nuevos)}
            </section>
          )}
          {vistos.length > 0 && (
            <section className={nuevos.length > 0 ? 'mt-8' : ''}>
              <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-cream">Anteriores</h2>
              {lista(vistos)}
            </section>
          )}
        </>
      )}
    </>
  )
}
