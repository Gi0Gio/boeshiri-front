import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Chip, Btn, PillTabs } from '../ui'
import { eventsApi } from '../../api/events'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'
import { partesFecha, franja, entrada, faltaParaConfirmar } from '../../utils/eventos'
import Ico from '../Ico'

const TABS = [{ id: 'All', label: 'Todos' }, { id: 'Upcoming', label: 'Próximos' }, { id: 'Past', label: 'Pasados' }]

/**
 * La Agenda de la Junta: un evento por fila, con su punto (en planeación,
 * próximo o pasado) y lo que le falta. Crear y editar abren su propia página.
 * La asistencia se anota en la fila de un evento que ya ocurrió.
 */
export default function AdminEventos() {
  const [tab, setTab] = useState('All')
  const [version, setVersion] = useState(0)
  const { data, loading, error } = useFetch(() => eventsApi.listManage(tab), [tab, version])
  const reload = () => setVersion((v) => v + 1)
  const toast = useToast()
  const confirm = useConfirm()
  const [asistId, setAsistId] = useState(null)
  const [asistCount, setAsistCount] = useState('')

  async function cambiarEstado(e, action) {
    if (action === 'Delete' && !(await confirm({ title: '¿Eliminar el evento?', message: `«${e.title}» desaparece de la agenda. No se puede deshacer.`, danger: true, confirmLabel: 'Eliminar' }))) return
    try { await eventsApi.changeStatus(e.id, action); reload() }
    catch (err) { toast.error(err.message || 'No se pudo cambiar el estado.') }
  }

  async function guardarAsistencia(id) {
    const count = Number(asistCount)
    if (!Number.isInteger(count) || count < 0) { toast.error('Escribe cuántas personas vinieron.'); return }
    try {
      await eventsApi.recordAttendance(id, count, [])
      toast.success('Asistencia guardada.')
      setAsistId(null); setAsistCount(''); reload()
    } catch (err) { toast.error(err.message || 'No se pudo guardar la asistencia.') }
  }

  const eventos = data ?? []
  const pasado = (e) => Boolean(e.date) && new Date(e.date) < new Date()

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Los eventos del colectivo. Uno en planeación ya se anuncia como «Próximamente», aunque falten la fecha o el costo."
        actions={<Btn as={Link} to="/panel/admin/eventos/nuevo"><Ico name="mas" className="h-4 w-4" />Nuevo evento</Btn>}
      />

      <PillTabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? (
        <p className="text-tea/70">Cargando eventos…</p>
      ) : error ? (
        <p className="rounded-2xl border border-candy/30 bg-jungle p-5 text-tea">No se pudieron cargar los eventos.</p>
      ) : eventos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-tea/20 p-6">
          <p className="text-tea/85">{tab === 'Past' ? 'Todavía no hay eventos realizados.' : 'No hay eventos en esta vista.'}</p>
          {tab !== 'Past' && <Btn as={Link} to="/panel/admin/eventos/nuevo" className="mt-4"><Ico name="mas" className="h-4 w-4" />Crear el primero</Btn>}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {eventos.map((e) => {
            const p = partesFecha(e.date)
            const falta = e.planning ? faltaParaConfirmar(e) : []
            const yaPaso = pasado(e)
            return (
              <li key={e.id} className={`rounded-2xl border bg-jungle ${e.planning ? 'border-dashed border-tea/25' : 'border-tea/10'}`}>
                <div className="flex gap-4 p-4 sm:p-5">
                  {/* Bloque de fecha: el día, o «pronto» si aún no lo hay. */}
                  <div className={`flex h-16 w-16 flex-none flex-col items-center justify-center self-start rounded-xl text-center ${p ? 'bg-jungle-deep/60' : 'border border-dashed border-tea/25'}`}>
                    {p ? (
                      <>
                        <span className="font-display text-2xl font-semibold leading-none text-cream">{p.dia}</span>
                        <span className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-tea/70">{p.mes}</span>
                      </>
                    ) : (
                      <span className="text-xs font-semibold leading-tight text-tea/70">Sin<br />fecha</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="mr-1 font-semibold text-cream">{e.title}</span>
                      {e.planning ? <Chip tone="terracotta">En planeación</Chip> : yaPaso ? <Chip tone="gris">Realizado</Chip> : <Chip tone="caribbean">Confirmado</Chip>}
                      {e.status !== 'Published' && <Chip tone="gris">Oculto</Chip>}
                      {e.visibility === 'Members' && <Chip tone="tea">Solo miembros</Chip>}
                    </div>
                    <p className="mt-1 text-sm text-tea/75">
                      {[e.category, p ? `${p.dow} ${p.fecha} · ${franja(e.date, e.endsAt)}` : 'Fecha por confirmar', e.location, entrada(e.cost)].filter(Boolean).join(' · ')}
                    </p>
                    {falta.length > 0 && <p className="mt-1 text-sm font-semibold text-terracotta">Falta para confirmarlo: {falta.join(' y ')}</p>}

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
                      <Link to={`/panel/admin/eventos/${e.id}/editar`} className="inline-flex min-h-11 items-center gap-1.5 text-caribbean hover:underline"><Ico name="pluma" className="h-4 w-4" />Editar</Link>
                      <a href={`/eventos/${e.id}`} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1.5 text-caribbean hover:underline"><Ico name="enlace" className="h-4 w-4" />Ver</a>
                      {e.status === 'Published'
                        ? <button type="button" onClick={() => cambiarEstado(e, 'Hide')} className="inline-flex min-h-11 items-center text-tea/80 hover:text-tea hover:underline">Ocultar</button>
                        : <button type="button" onClick={() => cambiarEstado(e, 'Show')} className="inline-flex min-h-11 items-center text-tea/80 hover:text-tea hover:underline">Mostrar</button>}
                      <button type="button" onClick={() => cambiarEstado(e, 'Delete')} className="inline-flex min-h-11 items-center text-tea/70 hover:text-candy hover:underline">Eliminar</button>
                    </div>

                    {/* Asistencia: solo tiene sentido cuando el evento ya pasó. */}
                    {yaPaso && (
                      asistId === e.id ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <label htmlFor={`asist-${e.id}`} className="text-sm text-tea/85">¿Cuántas personas vinieron?</label>
                          <input id={`asist-${e.id}`} type="number" min="0" inputMode="numeric" value={asistCount} autoFocus
                            onChange={(ev) => setAsistCount(ev.target.value)}
                            className="w-24 rounded-xl border border-tea/15 bg-jungle-deep/60 px-3 py-2 font-mono text-cream" />
                          <button type="button" onClick={() => guardarAsistencia(e.id)} aria-label="Guardar asistencia"
                            className="grid h-11 w-11 place-items-center rounded-full bg-caribbean text-jungle"><Ico name="check" className="h-4 w-4" /></button>
                          <button type="button" onClick={() => setAsistId(null)} aria-label="Cancelar"
                            className="grid h-11 w-11 place-items-center rounded-full text-tea/70 hover:bg-tea/5 hover:text-tea"><Ico name="cerrar" className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => { setAsistId(e.id); setAsistCount(String(e.attendanceCount || '')) }}
                          className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm text-tea/80 hover:text-caribbean">
                          <Ico name="users" className="h-4 w-4" />
                          {e.attendanceCount > 0 ? <><span className="font-mono">{e.attendanceCount}</span> asistentes · cambiar</> : 'Anotar la asistencia'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
