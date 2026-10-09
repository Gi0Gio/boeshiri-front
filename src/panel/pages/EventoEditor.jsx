import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Btn, inputCls } from '../ui'
import { eventsApi } from '../../api/events'
import { useToast } from '../../components/Toast'
import FotosPublicacion from '../publicar/FotosPublicacion'
import { duracion } from '../../utils/eventos'
import Ico from '../Ico'

/**
 * Crear o editar un evento. Un evento puede nacer «En planeación»: se anuncia
 * como «Próximamente» aunque falten la fecha o el costo, y se confirma cuando
 * están. La API exige los dos para confirmarlo, y aquí se dice antes de intentarlo.
 */
const BLANCO = { planning: true, title: '', category: '', description: '', dia: '', inicio: '', fin: '', location: '', costoModo: 'definir', costo: '', visibility: 'Public', images: [] }

const dosDigitos = (n) => String(n).padStart(2, '0')
const aDia = (d) => `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
const aHora = (d) => `${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`
/** Día y hora locales (Panamá) → ISO. Sin hora, el evento empieza a mediodía para no cambiar de día al pasar a UTC. */
const aIso = (dia, hora) => (dia ? new Date(`${dia}T${hora || '12:00'}`).toISOString() : null)

const Etiqueta = ({ htmlFor, children, extra }) => (
  <label htmlFor={htmlFor} className="text-sm font-semibold text-cream">
    {children}{extra && <span className="font-normal text-tea/70"> {extra}</span>}
  </label>
)

/** Pastillas de opción única, con su radiogroup para lectores de pantalla. */
function Opciones({ etiqueta, id, opciones, valor, onChange }) {
  return (
    <div>
      <p id={id} className="text-sm font-semibold text-cream">{etiqueta}</p>
      <div role="radiogroup" aria-labelledby={id} className="mt-1.5 inline-flex flex-wrap rounded-full border border-tea/15 bg-tea/5 p-1">
        {opciones.map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={valor === v} onClick={() => onChange(v)}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${valor === v ? 'bg-caribbean text-jungle' : 'text-tea/75 hover:text-tea'}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EventoEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState(BLANCO)
  const [cargando, setCargando] = useState(Boolean(id))
  const [guardando, setGuardando] = useState(false)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  useEffect(() => {
    if (!id) return
    eventsApi.getManage(id).then((e) => {
      const ini = e.date ? new Date(e.date) : null
      const fin = e.endsAt ? new Date(e.endsAt) : null
      setForm({
        planning: e.planning,
        title: e.title ?? '',
        category: e.category ?? '',
        description: e.description ?? '',
        dia: ini ? aDia(ini) : '',
        inicio: ini ? aHora(ini) : '',
        fin: fin ? aHora(fin) : '',
        location: e.location ?? '',
        costoModo: e.cost == null ? 'definir' : e.cost > 0 ? 'monto' : 'gratis',
        costo: e.cost > 0 ? String(e.cost) : '',
        visibility: e.visibility ?? 'Public',
        images: e.images ?? [],
      })
      setCargando(false)
    }).catch((err) => { toast.error(err.message || 'No se pudo abrir el evento.'); navigate('/panel/admin/eventos') })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const costo = form.costoModo === 'definir' ? null : form.costoModo === 'gratis' ? 0 : (form.costo === '' ? null : Number(form.costo))
  const inicioIso = aIso(form.dia, form.inicio)
  const finIso = form.dia && form.fin ? aIso(form.dia, form.fin) : null
  const faltan = [!form.dia && 'la fecha', costo == null && 'el costo'].filter(Boolean)
  const finMal = finIso && inicioIso && new Date(finIso) <= new Date(inicioIso)

  async function guardar() {
    if (!form.title.trim()) { toast.error('Ponle un título.'); return }
    if (!form.category.trim()) { toast.error('Ponle una categoría: taller, concierto, exposición…'); return }
    if (!form.planning && faltan.length) { toast.error(`Para confirmarlo falta ${faltan.join(' y ')}. Déjalo en planeación mientras tanto.`); return }
    if (form.costoModo === 'monto' && !(Number(form.costo) > 0)) { toast.error('Escribe el costo, o elige «Gratis» o «Por definir».'); return }
    if (finMal) { toast.error('La hora de fin tiene que ser después del inicio.'); return }
    setGuardando(true)
    const datos = {
      planning: form.planning,
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim() || null,
      date: inicioIso,
      endsAt: finIso,
      location: form.location.trim() || null,
      cost: costo,
      visibility: form.visibility,
      images: form.images,
    }
    try {
      if (id) await eventsApi.update(id, datos)
      else await eventsApi.create(datos)
      toast.success(form.planning ? 'Guardado en planeación. Ya se anuncia como «Próximamente».' : id ? 'Evento actualizado.' : 'Evento creado.')
      navigate('/panel/admin/eventos')
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar.')
    } finally { setGuardando(false) }
  }

  if (cargando) return <p className="text-tea/70">Cargando…</p>

  return (
    <>
      <Link to="/panel/admin/eventos" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-caribbean hover:underline">
        <Ico name="atras" className="h-4 w-4" />Agenda
      </Link>
      <h1 className="mb-6 mt-1 font-display text-3xl font-semibold uppercase tracking-wide text-cream md:text-4xl">{id ? 'Editar evento' : 'Nuevo evento'}</h1>

      <div className="space-y-7">
        <div>
          <Opciones etiqueta="¿En qué punto está?" id="ev-estado" valor={form.planning ? 'plan' : 'ok'}
            onChange={(v) => set({ planning: v === 'plan' })}
            opciones={[['plan', 'En planeación'], ['ok', 'Confirmado']]} />
          <p className={`mt-1.5 text-sm ${!form.planning && faltan.length ? 'text-terracotta' : 'text-tea/70'}`}>
            {form.planning
              ? 'Se anuncia como «Próximamente». La fecha y el costo pueden quedar para después.'
              : faltan.length ? `Para confirmarlo falta ${faltan.join(' y ')}.` : 'Con fecha y costo: se anuncia con todos sus datos.'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div>
            <Etiqueta htmlFor="ev-titulo">Título</Etiqueta>
            <input id="ev-titulo" className={`${inputCls} mt-1.5 text-base`} maxLength={200} value={form.title}
              onChange={(e) => set({ title: e.target.value })} placeholder="Garabateo: ARCANA" />
          </div>
          <div>
            <Etiqueta htmlFor="ev-cat">Categoría</Etiqueta>
            <input id="ev-cat" className={`${inputCls} mt-1.5`} maxLength={80} value={form.category}
              onChange={(e) => set({ category: e.target.value })} placeholder="Taller, concierto…" />
          </div>
        </div>

        <div>
          <Etiqueta htmlFor="ev-desc" extra="(opcional)">De qué va</Etiqueta>
          <textarea id="ev-desc" rows={5} maxLength={4000} className={`${inputCls} mt-1.5 text-base leading-relaxed`} value={form.description}
            onChange={(e) => set({ description: e.target.value })} placeholder="Qué se hace, para quién, qué incluye la entrada…" />
        </div>

        <fieldset className="rounded-2xl border border-tea/10 bg-jungle p-4 sm:p-5">
          <legend className="px-1 text-sm font-semibold text-cream">Cuándo y dónde</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Etiqueta htmlFor="ev-dia" extra={form.planning ? '(si ya la hay)' : undefined}>Día</Etiqueta>
              <input id="ev-dia" type="date" className={`${inputCls} mt-1.5`} value={form.dia} onChange={(e) => set({ dia: e.target.value })} />
            </div>
            <div>
              <Etiqueta htmlFor="ev-ini">Empieza</Etiqueta>
              <input id="ev-ini" type="time" className={`${inputCls} mt-1.5`} value={form.inicio} disabled={!form.dia} onChange={(e) => set({ inicio: e.target.value })} />
            </div>
            <div>
              <Etiqueta htmlFor="ev-fin" extra="(opcional)">Termina</Etiqueta>
              <input id="ev-fin" type="time" className={`${inputCls} mt-1.5`} value={form.fin} disabled={!form.dia} onChange={(e) => set({ fin: e.target.value })} />
            </div>
          </div>
          <p className={`mt-2 text-sm ${finMal ? 'text-terracotta' : 'text-tea/70'}`}>
            {!form.dia ? 'Sin día, se anuncia como «Fecha por confirmar».'
              : finMal ? 'La hora de fin tiene que ser después del inicio.'
              : duracion(inicioIso, finIso) ? `Dura ${duracion(inicioIso, finIso)}.` : 'Sin hora de fin, se muestra solo el inicio.'}
          </p>
          <div className="mt-4">
            <Etiqueta htmlFor="ev-lugar" extra="(opcional)">Lugar</Etiqueta>
            <input id="ev-lugar" className={`${inputCls} mt-1.5`} maxLength={200} value={form.location}
              onChange={(e) => set({ location: e.target.value })} placeholder="Kara Coffee Shop & Deli, David" />
          </div>
        </fieldset>

        <div>
          <Opciones etiqueta="Entrada" id="ev-costo" valor={form.costoModo} onChange={(v) => set({ costoModo: v })}
            opciones={[['gratis', 'Gratis'], ['monto', 'Con costo'], ['definir', 'Por definir']]} />
          {form.costoModo === 'monto' && (
            <div className="mt-2.5 flex max-w-48 items-stretch overflow-hidden rounded-xl border border-tea/15 bg-jungle-deep/60 focus-within:border-caribbean focus-within:ring-2 focus-within:ring-caribbean/25">
              <span className="flex items-center border-r border-tea/15 px-3 font-mono text-tea/70">$</span>
              <input aria-label="Costo de la entrada en dólares" type="number" inputMode="decimal" min="0" step="0.01" value={form.costo}
                onChange={(e) => set({ costo: e.target.value })} placeholder="12"
                className="w-full bg-transparent px-3 py-2.5 font-mono text-base text-cream outline-none placeholder:text-tea/40" />
            </div>
          )}
          {form.costoModo === 'definir' && <p className="mt-1.5 text-sm text-tea/70">Se anuncia como «Costo por definir».</p>}
        </div>

        <FotosPublicacion value={form.images} onChange={(images) => set({ images })} max={4} etiqueta="Fotos (opcional)" />

        <Opciones etiqueta="¿Quién lo ve?" id="ev-quien" valor={form.visibility} onChange={(v) => set({ visibility: v })}
          opciones={[['Public', 'Todo el mundo'], ['Members', 'Solo miembros']]} />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-tea/10 pt-5">
          <Btn onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando…' : form.planning ? 'Guardar en planeación' : id ? 'Guardar cambios' : 'Crear evento'}
          </Btn>
          <Link to="/panel/admin/eventos" className="inline-flex min-h-11 items-center text-sm font-semibold text-tea/70 hover:text-tea hover:underline">Cancelar</Link>
        </div>
      </div>
    </>
  )
}
