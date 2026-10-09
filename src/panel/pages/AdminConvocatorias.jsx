import { Link } from 'react-router-dom'
import { PageHeader, Btn, Chip } from '../ui'
import { openCallsApi, estadoConvocatoria, fechaLarga } from '../../api/openCalls'
import { useFetch } from '../../hooks/useFetch'
import Ico from '../Ico'

/**
 * Convocatorias de la Junta: lo que está abierto y espera revisión, primero. Cada
 * fila dice cuántas respuestas hay y cuántas siguen sin mirar.
 */
export default function AdminConvocatorias() {
  const { data, loading, error } = useFetch(() => openCallsApi.list(), [])
  const lista = [...(data ?? [])].sort((a, b) =>
    Number(b.isOpen) - Number(a.isOpen) || b.newCount - a.newCount || new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <>
      <PageHeader
        title="Convocatorias"
        description="Formularios abiertos al público: tallerista, propuestas, voluntariado. Cualquiera responde sin cuenta; quien es del colectivo, con su perfil."
        actions={<Btn as={Link} to="/panel/admin/convocatorias/nueva"><Ico name="mas" className="h-4 w-4" />Nueva</Btn>}
      />

      {loading ? (
        <p className="text-tea/70">Cargando…</p>
      ) : error ? (
        <p className="rounded-2xl border border-candy/30 bg-jungle p-5 text-tea">No se pudieron cargar las convocatorias.</p>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-tea/20 p-6">
          <p className="font-display text-xl font-semibold uppercase tracking-wide text-cream">Aún no hay convocatorias</p>
          <p className="mt-2 text-tea/80">Crea la primera: título, unas preguntas y la abres. Te damos un enlace para compartir por WhatsApp o Instagram.</p>
          <Btn as={Link} to="/panel/admin/convocatorias/nueva" className="mt-4"><Ico name="mas" className="h-4 w-4" />Nueva convocatoria</Btn>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {lista.map((c) => {
            const e = estadoConvocatoria(c)
            return (
              <li key={c.id}>
                <Link to={`/panel/admin/convocatorias/${c.id}`} className="flex min-h-16 items-center gap-4 rounded-2xl border border-tea/10 bg-jungle px-4 py-3.5 transition hover:border-caribbean/40 sm:px-5">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-cream">{c.title}</span>
                      <Chip tone={e.tono}>{e.label}</Chip>
                    </span>
                    <span className="mt-1 block text-sm text-tea/70">
                      {[c.eventTitle, c.closesAt && (c.isOpen ? `cierra el ${fechaLarga(c.closesAt)}` : `cerró el ${fechaLarga(c.closesAt)}`)].filter(Boolean).join(' · ') || 'Sin evento ni fecha de cierre'}
                    </span>
                  </span>
                  <span className="flex-none text-right">
                    <span className="block font-mono text-sm text-cream">{c.responseCount}</span>
                    <span className="block text-xs text-tea/70">{c.responseCount === 1 ? 'respuesta' : 'respuestas'}</span>
                  </span>
                  {c.newCount > 0 && (
                    <span className="flex-none rounded-full bg-candy px-2 py-0.5 font-mono text-xs font-bold text-white" aria-label={`${c.newCount} sin revisar`}>{c.newCount}</span>
                  )}
                  <Ico name="ir" className="h-4 w-4 flex-none text-tea/60" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
