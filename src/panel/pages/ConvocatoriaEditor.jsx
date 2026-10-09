import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Btn, inputCls } from '../ui'
import { openCallsApi, TIPOS_PREGUNTA, PLANTILLA_TALLERISTA } from '../../api/openCalls'
import { eventsApi } from '../../api/events'
import { useToast } from '../../components/Toast'
import Ico from '../Ico'

/**
 * Armar una convocatoria: título, de qué va, a qué evento pertenece, hasta cuándo
 * y sus preguntas. Se guarda como borrador; se abre desde su página.
 * Con respuestas ya recibidas no se quitan preguntas ni se cambia su tipo (la API
 * tampoco lo deja): se pueden reescribir y añadir.
 */
const nuevaPregunta = (type = 'ShortText') => ({ key: crypto.randomUUID(), label: '', help: '', type, required: false })

// Fecha de cierre: se elige un día y cierra al final de ese día, hora de Panamá.
const aIso = (dia) => (dia ? new Date(`${dia}T23:59:00`).toISOString() : null)
const aDia = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const Etiqueta = ({ htmlFor, children, extra }) => (
  <label htmlFor={htmlFor} className="text-sm font-semibold text-cream">
    {children}{extra && <span className="font-normal text-tea/70"> {extra}</span>}
  </label>
)

export default function ConvocatoriaEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ title: '', description: '', eventId: '', closesAt: '', questions: [] })
  const [conRespuestas, setConRespuestas] = useState(false)
  const [cargando, setCargando] = useState(Boolean(id))
  const [guardando, setGuardando] = useState(false)
  const [eventos, setEventos] = useState([])
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  useEffect(() => {
    eventsApi.listManage().catch(() => eventsApi.list()).then((es) => {
      setEventos([...(es ?? [])].sort((a, b) => new Date(b.date) - new Date(a.date)))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    openCallsApi.detail(id).then((c) => {
      setForm({
        title: c.title,
        description: c.description ?? '',
        eventId: c.eventId ?? '',
        closesAt: aDia(c.closesAt),
        questions: c.questions.map((q) => ({ ...q, key: q.id, help: q.help ?? '' })),
      })
      setConRespuestas(c.responses.length > 0)
      setCargando(false)
    }).catch((e) => { toast.error(e.message || 'No se pudo abrir.'); navigate('/panel/admin/convocatorias') })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const setQ = (i, patch) => setForm((f) => ({ ...f, questions: f.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) }))
  const moverQ = (i, d) => setForm((f) => {
    const j = i + d
    if (j < 0 || j >= f.questions.length) return f
    const qs = [...f.questions]
    ;[qs[i], qs[j]] = [qs[j], qs[i]]
    return { ...f, questions: qs }
  })
  const quitarQ = (i) => setForm((f) => ({ ...f, questions: f.questions.filter((_, j) => j !== i) }))
  const anadirQ = (type) => setForm((f) => ({ ...f, questions: [...f.questions, nuevaPregunta(type)] }))
  const usarPlantilla = () => setForm((f) => ({ ...f, questions: PLANTILLA_TALLERISTA.map((q) => ({ ...q, key: crypto.randomUUID() })) }))

  async function guardar() {
    if (!form.title.trim()) { toast.error('Ponle un título.'); return }
    if (form.questions.length === 0) { toast.error('Añade al menos una pregunta.'); return }
    if (form.questions.some((q) => !q.label.trim())) { toast.error('Hay una pregunta sin texto.'); return }
    setGuardando(true)
    const datos = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      eventId: form.eventId || null,
      closesAt: aIso(form.closesAt),
      questions: form.questions.map((q) => ({ id: q.id ?? null, label: q.label.trim(), help: q.help.trim() || null, type: q.type, required: q.required })),
    }
    try {
      if (id) {
        await openCallsApi.update(id, datos)
        toast.success('Convocatoria guardada.')
        navigate(`/panel/admin/convocatorias/${id}`)
      } else {
        const r = await openCallsApi.create(datos)
        toast.success('Guardada como borrador. Revísala y ábrela cuando esté lista.')
        navigate(`/panel/admin/convocatorias/${r.id}`)
      }
    } catch (e) {
      toast.error(e.message || 'No se pudo guardar.')
    } finally { setGuardando(false) }
  }

  if (cargando) return <p className="text-tea/70">Cargando…</p>

  return (
    <>
      <Link to={id ? `/panel/admin/convocatorias/${id}` : '/panel/admin/convocatorias'} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-caribbean hover:underline">
        <Ico name="atras" className="h-4 w-4" />{id ? 'Volver a la convocatoria' : 'Convocatorias'}
      </Link>
      <h1 className="mb-6 mt-1 font-display text-3xl font-semibold uppercase tracking-wide text-cream md:text-4xl">{id ? 'Editar convocatoria' : 'Nueva convocatoria'}</h1>

      <div className="space-y-6">
        <div>
          <Etiqueta htmlFor="c-titulo">Título</Etiqueta>
          <input id="c-titulo" className={`${inputCls} mt-1.5 text-base`} maxLength={200} value={form.title}
            onChange={(e) => set({ title: e.target.value })} placeholder="Tallerista para Garabateo: ARCANA" />
        </div>

        <div>
          <Etiqueta htmlFor="c-desc" extra="(opcional)">De qué va</Etiqueta>
          <textarea id="c-desc" rows={5} className={`${inputCls} mt-1.5 text-base leading-relaxed`} maxLength={8000} value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Qué buscamos, para cuándo, qué ofrece el colectivo y cómo elegiremos." />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Etiqueta htmlFor="c-evento" extra="(opcional)">Evento</Etiqueta>
            <select id="c-evento" className={`${inputCls} mt-1.5`} value={form.eventId} onChange={(e) => set({ eventId: e.target.value })}>
              <option value="">Ninguno</option>
              {eventos.map((ev) => <option key={ev.id} value={ev.id}>{ev.title} · {new Date(ev.date).toLocaleDateString('es-PA')}</option>)}
            </select>
          </div>
          <div>
            <Etiqueta htmlFor="c-cierre" extra="(opcional)">Recibe respuestas hasta</Etiqueta>
            <input id="c-cierre" type="date" className={`${inputCls} mt-1.5`} value={form.closesAt} onChange={(e) => set({ closesAt: e.target.value })} />
            <p className="mt-1 text-xs text-tea/70">Cierra al final de ese día. Sin fecha, hasta que la cierres tú.</p>
          </div>
        </div>

        <section>
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Preguntas · {form.questions.length}</h2>
          <p className="mt-1 text-sm text-tea/70">
            Nombre, correo y teléfono ya se piden solos (y a quien tiene cuenta no se le piden).
            {conRespuestas && ' Ya hay respuestas: puedes reescribir y añadir preguntas, pero no quitar las que existen ni cambiar su tipo.'}
          </p>

          {form.questions.length === 0 && (
            <div className="mt-3 rounded-2xl border border-dashed border-tea/20 p-5">
              <p className="text-tea/85">Empieza desde cero o con las preguntas típicas para quien propone un taller.</p>
              <button type="button" onClick={usarPlantilla}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-caribbean/40 px-4 text-sm font-semibold text-caribbean transition hover:bg-caribbean hover:text-jungle">
                <Ico name="list" className="h-4 w-4" />Usar plantilla de tallerista
              </button>
            </div>
          )}

          <ol className="mt-3 space-y-3">
            {form.questions.map((q, i) => {
              const fija = conRespuestas && Boolean(q.id)
              return (
                <li key={q.key} className="rounded-2xl border border-tea/10 bg-jungle p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-2.5 font-mono text-xs text-tea/60">{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <input aria-label={`Pregunta ${i + 1}`} className={`${inputCls} text-base`} maxLength={200} value={q.label}
                        onChange={(e) => setQ(i, { label: e.target.value })} placeholder="¿Qué quieres preguntar?" />
                      <input aria-label={`Ayuda de la pregunta ${i + 1}`} className={inputCls} maxLength={500} value={q.help}
                        onChange={(e) => setQ(i, { help: e.target.value })} placeholder="Ayuda (opcional): un ejemplo, qué esperas" />
                      <div role="group" aria-label={`Tipo de la pregunta ${i + 1}`} className="flex flex-wrap gap-1.5">
                        {TIPOS_PREGUNTA.map((t) => (
                          <button key={t.id} type="button" onClick={() => setQ(i, { type: t.id })} aria-pressed={q.type === t.id}
                            disabled={fija && q.type !== t.id} title={fija && q.type !== t.id ? 'Ya hay respuestas: no cambia de tipo' : t.ayuda}
                            className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${q.type === t.id ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/80 hover:bg-tea/15'}`}>
                            <Ico name={t.ico} className="h-4 w-4" />{t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-tea/10 pt-2 sm:pl-8">
                    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-tea/85">
                      <input type="checkbox" checked={q.required} onChange={(e) => setQ(i, { required: e.target.checked })} className="h-4 w-4 accent-[#00e6bc]" />
                      Obligatoria
                    </label>
                    <span className="flex items-center gap-1">
                      <button type="button" onClick={() => moverQ(i, -1)} disabled={i === 0} aria-label={`Subir la pregunta ${i + 1}`}
                        className="grid h-11 w-11 place-items-center rounded-full text-tea/70 transition hover:bg-tea/5 hover:text-tea disabled:opacity-30"><Ico name="atras" className="h-4 w-4 rotate-90" /></button>
                      <button type="button" onClick={() => moverQ(i, 1)} disabled={i === form.questions.length - 1} aria-label={`Bajar la pregunta ${i + 1}`}
                        className="grid h-11 w-11 place-items-center rounded-full text-tea/70 transition hover:bg-tea/5 hover:text-tea disabled:opacity-30"><Ico name="ir" className="h-4 w-4 rotate-90" /></button>
                      <button type="button" onClick={() => quitarQ(i)} disabled={fija} aria-label={`Quitar la pregunta ${i + 1}`}
                        title={fija ? 'Ya hay respuestas: no se puede quitar' : undefined}
                        className="grid h-11 w-11 place-items-center rounded-full text-tea/70 transition hover:bg-tea/5 hover:text-candy disabled:opacity-30"><Ico name="cerrar" className="h-4 w-4" /></button>
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-sm text-tea/70">Añadir:</span>
            {TIPOS_PREGUNTA.map((t) => (
              <button key={t.id} type="button" onClick={() => anadirQ(t.id)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-tea/15 px-3.5 text-sm font-semibold text-tea/85 transition hover:border-caribbean/50 hover:text-caribbean">
                <Ico name="mas" className="h-4 w-4" />{t.label}
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-tea/10 pt-5">
          <Btn onClick={guardar} disabled={guardando}>{guardando ? 'Guardando…' : id ? 'Guardar cambios' : 'Guardar borrador'}</Btn>
          <Link to={id ? `/panel/admin/convocatorias/${id}` : '/panel/admin/convocatorias'} className="inline-flex min-h-11 items-center text-sm font-semibold text-tea/70 hover:text-tea hover:underline">Cancelar</Link>
        </div>
      </div>
    </>
  )
}
