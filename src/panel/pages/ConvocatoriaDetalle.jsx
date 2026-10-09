import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Btn, Chip, inputCls } from '../ui'
import { openCallsApi, ESTADO_RESPUESTA, estadoConvocatoria, dinero, fechaLarga } from '../../api/openCalls'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'
import Ico from '../Ico'

const FILTROS = [
  { id: 'todas', label: 'Todas' },
  { id: 'New', label: 'Nuevas' },
  { id: 'Shortlisted', label: 'Preseleccionadas' },
  { id: 'Accepted', label: 'Aceptadas' },
  { id: 'Rejected', label: 'Descartadas' },
]

/** «+507 6000-0000» → enlace de WhatsApp. */
const whatsapp = (tel) => `https://wa.me/${(tel ?? '').replace(/\D/g, '')}`

/**
 * Una respuesta. Cerrada dice quién, cuándo, cuánto pide y en qué estado está;
 * abierta muestra todo lo contestado, el contacto y la evaluación (estado + nota
 * privada de la Junta).
 */
function Respuesta({ r, preguntas, montoDe, onRevisar, ocupado }) {
  const [abierta, setAbierta] = useState(r.status === 'New')
  const [nota, setNota] = useState(r.note ?? '')
  const porPregunta = new Map(r.answers.map((a) => [a.questionId, a]))
  const e = ESTADO_RESPUESTA[r.status]
  const monto = montoDe(r)

  return (
    <li className={`rounded-2xl border bg-jungle ${r.status === 'New' ? 'border-candy/30' : 'border-tea/10'}`}>
      <button type="button" onClick={() => setAbierta((v) => !v)} aria-expanded={abierta}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-cream">{r.name}</span>
            {r.isMember && <Chip tone="tea">Miembro</Chip>}
            <Chip tone={e.tono}>{e.label}</Chip>
          </span>
          <span className="mt-0.5 block text-sm text-tea/70">{new Date(r.createdAt).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })}</span>
        </span>
        {monto != null && <span className="flex-none font-mono text-base text-cream">{dinero(monto)}</span>}
        <Ico name="abajo" className={`h-4 w-4 flex-none text-tea/60 transition-transform ${abierta ? 'rotate-180' : ''}`} />
      </button>

      {abierta && (
        <div className="space-y-5 border-t border-tea/10 px-4 pb-4 pt-4 sm:px-5">
          <dl className="space-y-4">
            {preguntas.map((q) => {
              const a = porPregunta.get(q.id)
              return (
                <div key={q.id}>
                  <dt className="text-sm font-semibold text-tea/80">{q.label}</dt>
                  <dd className="mt-1 text-tea">
                    {!a ? <span className="text-tea/60">Sin responder</span>
                      : q.type === 'Amount' ? <span className="font-mono">{dinero(a.amount)}</span>
                      : q.type === 'Link' ? <a href={a.text} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 break-all font-semibold text-caribbean hover:underline"><Ico name="enlace" className="h-4 w-4 flex-none" />{a.text}</a>
                      : <p className="whitespace-pre-wrap leading-relaxed">{a.text}</p>}
                  </dd>
                </div>
              )
            })}
          </dl>

          <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-tea/10 pt-3 text-sm">
            <a href={`mailto:${r.email}`} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-caribbean hover:underline">{r.email}</a>
            {r.phone && <a href={whatsapp(r.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-caribbean hover:underline">WhatsApp {r.phone}</a>}
          </div>

          <div className="rounded-xl bg-jungle-deep/50 p-3.5">
            <p id={`ev-${r.id}`} className="text-sm font-semibold text-cream">Evaluación de la Junta</p>
            <div role="radiogroup" aria-labelledby={`ev-${r.id}`} className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(ESTADO_RESPUESTA).map(([id, x]) => (
                <button key={id} type="button" role="radio" aria-checked={r.status === id} disabled={ocupado}
                  onClick={() => r.status !== id && onRevisar(r, id, nota)}
                  className={`min-h-10 rounded-full px-3.5 text-sm font-semibold transition disabled:opacity-60 ${r.status === id ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/80 hover:bg-tea/15'}`}>
                  {x.label}
                </button>
              ))}
            </div>
            <label htmlFor={`nota-${r.id}`} className="mt-3 block text-sm text-tea/80">Nota privada (no la ve quien respondió)</label>
            <textarea id={`nota-${r.id}`} rows={2} maxLength={2000} className={`${inputCls} mt-1`} value={nota} onChange={(ev) => setNota(ev.target.value)}
              placeholder="Por qué sí o por qué no, qué preguntarle…" />
            {nota !== (r.note ?? '') && (
              <button type="button" onClick={() => onRevisar(r, r.status, nota)} disabled={ocupado}
                className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-caribbean hover:underline">Guardar nota</button>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

export default function ConvocatoriaDetalle() {
  const { id } = useParams()
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data: c, loading, error } = useFetch(() => openCallsApi.detail(id), [id, version])
  const [filtro, setFiltro] = useState('todas')
  const [orden, setOrden] = useState('llegada')
  const [ocupado, setOcupado] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()

  const volver = <Link to="/panel/admin/convocatorias" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-caribbean hover:underline"><Ico name="atras" className="h-4 w-4" />Convocatorias</Link>
  if (loading) return <>{volver}<p className="mt-4 text-tea/70">Cargando…</p></>
  if (error || !c) return <>{volver}<p className="mt-4 rounded-2xl border border-candy/30 bg-jungle p-5 text-tea">No se pudo cargar la convocatoria.</p></>

  const e = estadoConvocatoria(c)
  const enlace = `${window.location.origin}/convocatorias/${c.id}`
  const preguntasMonto = c.questions.filter((q) => q.type === 'Amount')
  // El primer monto obligatorio (o el primero) es el que se compara en la lista.
  const qMonto = preguntasMonto.find((q) => q.required) ?? preguntasMonto[0]
  const montoDe = (r) => (qMonto ? r.answers.find((a) => a.questionId === qMonto.id)?.amount ?? null : null)
  const conteo = Object.fromEntries(FILTROS.map((f) => [f.id, f.id === 'todas' ? c.responses.length : c.responses.filter((r) => r.status === f.id).length]))
  let visibles = filtro === 'todas' ? c.responses : c.responses.filter((r) => r.status === filtro)
  if (orden === 'monto') visibles = [...visibles].sort((a, b) => (montoDe(a) ?? Infinity) - (montoDe(b) ?? Infinity))

  async function cambiarEstado(status) {
    setOcupado(true)
    try {
      await openCallsApi.changeStatus(c.id, status)
      toast.success(status === 'Open' ? 'Abierta: ya se puede responder.' : status === 'Closed' ? 'Cerrada: ya no recibe respuestas.' : 'Vuelve a ser borrador.')
      reload()
    } catch (err) { toast.error(err.message || 'No se pudo.') } finally { setOcupado(false) }
  }

  async function compartir() {
    if (navigator.share) {
      try { await navigator.share({ title: c.title, text: `Convocatoria de Boesh Irí: ${c.title}`, url: enlace }) } catch { /* cancelado */ }
      return
    }
    try { await navigator.clipboard.writeText(enlace); toast.success('Enlace copiado. Pégalo en WhatsApp o Instagram.') }
    catch { toast.error(`No se pudo copiar. El enlace es ${enlace}`) }
  }

  async function borrar() {
    const ok = await confirm({ title: '¿Borrar la convocatoria?', message: `«${c.title}» desaparece. No se puede deshacer.`, danger: true, confirmLabel: 'Borrar' })
    if (!ok) return
    try { await openCallsApi.remove(c.id); toast.success('Borrada.'); navigate('/panel/admin/convocatorias') }
    catch (err) { toast.error(err.message || 'No se pudo borrar.') }
  }

  async function revisar(r, status, note) {
    setOcupado(true)
    try { await openCallsApi.review(r.id, status, note.trim() || null); reload() }
    catch (err) { toast.error(err.message || 'No se pudo guardar la evaluación.') }
    finally { setOcupado(false) }
  }

  return (
    <>
      {volver}
      <header className="mb-6 mt-1 rounded-3xl border border-tea/10 bg-jungle p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="min-w-0 font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-cream sm:text-3xl">{c.title}</h1>
          <Chip tone={e.tono}>{e.label}</Chip>
        </div>
        <p className="mt-2 text-sm text-tea/75">
          {[c.eventTitle && `Para ${c.eventTitle}`, c.closesAt && (c.isOpen ? `Recibe respuestas hasta el ${fechaLarga(c.closesAt)}` : `Cerró el ${fechaLarga(c.closesAt)}`), `${c.questions.length} ${c.questions.length === 1 ? 'pregunta' : 'preguntas'}`].filter(Boolean).join(' · ')}
        </p>
        {c.status === 'Draft' && <p className="mt-2 text-sm text-terracotta">Es un borrador: nadie la ve todavía. Ábrela cuando esté lista.</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {c.status === 'Draft' && <Btn onClick={() => cambiarEstado('Open')} disabled={ocupado}>Abrir convocatoria</Btn>}
          {c.status === 'Open' && <Btn tone="ghost" onClick={() => cambiarEstado('Closed')} disabled={ocupado}>Cerrar</Btn>}
          {c.status === 'Closed' && <Btn tone="ghost" onClick={() => cambiarEstado('Open')} disabled={ocupado}>Reabrir</Btn>}
          {c.status !== 'Draft' && (
            <button type="button" onClick={compartir} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-caribbean hover:bg-tea/5">
              <Ico name="compartir" className="h-4 w-4" />Compartir
            </button>
          )}
          {c.status !== 'Draft' && (
            <a href={`/convocatorias/${c.id}`} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-caribbean hover:bg-tea/5">
              <Ico name="enlace" className="h-4 w-4" />Ver como el público
            </a>
          )}
          <Link to={`/panel/admin/convocatorias/${c.id}/editar`} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-tea/85 hover:bg-tea/5 hover:text-tea">
            <Ico name="pluma" className="h-4 w-4" />Editar
          </Link>
          {c.responses.length === 0 && (
            <button type="button" onClick={borrar} className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-tea/70 hover:text-candy">Borrar</button>
          )}
        </div>
      </header>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-cream">Respuestas · {c.responses.length}</h2>
          {qMonto && c.responses.length > 1 && (
            <div role="group" aria-label="Orden" className="inline-flex rounded-full border border-tea/15 bg-tea/5 p-1 text-sm">
              {[['llegada', 'Por llegada'], ['monto', `Por ${qMonto.label.toLowerCase()}`]].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setOrden(v)} aria-pressed={orden === v}
                  className={`min-h-9 max-w-48 truncate rounded-full px-3 font-semibold transition ${orden === v ? 'bg-jungle text-cream shadow-sm' : 'text-tea/70 hover:text-tea'}`}>{l}</button>
              ))}
            </div>
          )}
        </div>

        {c.responses.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-tea/20 p-5 text-tea/80">
            {c.status === 'Draft' ? 'Cuando la abras y la compartas, las respuestas llegan aquí.' : 'Todavía no ha respondido nadie. Compártela por WhatsApp o Instagram.'}
          </p>
        ) : (
          <>
            <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FILTROS.filter((f) => f.id === 'todas' || conteo[f.id] > 0).map((f) => (
                <button key={f.id} type="button" onClick={() => setFiltro(f.id)} aria-pressed={filtro === f.id}
                  className={`min-h-10 flex-none rounded-full px-3.5 text-sm font-semibold transition ${filtro === f.id ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/80 hover:bg-tea/15'}`}>
                  {f.label} <span className="font-mono text-xs opacity-80">{conteo[f.id]}</span>
                </button>
              ))}
            </div>
            <ul className="mt-3 space-y-2.5">
              {visibles.map((r) => <Respuesta key={r.id} r={r} preguntas={c.questions} montoDe={montoDe} onRevisar={revisar} ocupado={ocupado} />)}
            </ul>
          </>
        )}
      </section>
    </>
  )
}
