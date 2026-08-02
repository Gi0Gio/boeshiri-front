import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Btn, Reveal, PillTabs, Table, Th, Td, Tr, inputCls } from '../ui'
import { postulantesApi } from '../../api/postulantes'
import { communityApi } from '../../api/community'
import { membersApi, ESTADOS_MIEMBRO, ESTADOS_BLOQUEANTES, estadoMeta } from '../../api/members'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })

export default function AdminMiembros() {
  const { hasPermission, user } = useSession()
  const puedeDecidir = hasPermission('postulantes.decidir')
  const puedeGestionarEstado = hasPermission('miembros.gestionar_estado')

  const [tab, setTab] = useState('Miembros')
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)

  // Con permiso de gestión se lista el directorio administrativo (estado + roles);
  // sin él, solo el directorio público de miembros activos.
  const { data: miembros, loading: lm, error: em } = useFetch(
    () => (puedeGestionarEstado ? membersApi.list() : communityApi.list()),
    [version, puedeGestionarEstado],
  )
  const { data: postulantes, loading: lp, error: ep } = useFetch(() => (puedeDecidir ? postulantesApi.list() : Promise.resolve([])), [version, puedeDecidir])

  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }
  const [busy, setBusy] = useState(null)

  async function decidir(id, decision) {
    if (decision === 'Rechazar' && !(await confirm({ title: '¿Rechazar postulación?', message: 'No podrá volver a postularse hasta pasado 1 mes.', danger: true, confirmLabel: 'Rechazar' }))) return
    setBusy(id); setMsg(null)
    try {
      await postulantesApi.decide(id, decision)
      setMsg({ ok: true, text: decision === 'Aceptar' ? 'Postulante aceptado como miembro.' : 'Postulación rechazada.' })
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo procesar.' })
    } finally { setBusy(null) }
  }

  /** Pide un enlace nuevo al servidor. Devuelve null si algo falla (ya avisado). */
  async function pedirEnlace(p) {
    setBusy(p.id); setMsg(null)
    try {
      return await postulantesApi.verificationLink(p.id)
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo generar el enlace.' })
      return null
    } finally { setBusy(null) }
  }

  async function enviarPorWhatsapp(p) {
    const datos = await pedirEnlace(p)
    if (!datos) return

    if (!datos.phone) {
      setMsg({ ok: false, text: 'No dejó teléfono al postularse. Usa «Copiar enlace».' })
      return
    }

    const texto =
      `Hola ${datos.fullName.split(' ')[0]}, soy de Boesh Irí. ` +
      `Para completar tu postulación confirma tu correo aquí: ${datos.link}\n\n` +
      `El enlace vence en 24 horas.`

    // wa.me exige el número sin "+" ni separadores.
    const numero = datos.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  }

  async function copiarEnlace(p) {
    const datos = await pedirEnlace(p)
    if (!datos) return
    try {
      await navigator.clipboard.writeText(datos.link)
      setMsg({ ok: true, text: 'Enlace copiado. Vence en 24 horas.' })
    } catch {
      // Sin permiso de portapapeles no queda otra que mostrarlo para copiar a mano.
      setMsg({ ok: false, text: datos.link })
    }
  }

  async function cambiarEstado(m, status) {
    if (!status || status === m.status) return
    const meta = estadoMeta(status)
    const bloquea = ESTADOS_BLOQUEANTES.includes(status)
    const ok = await confirm({
      title: `¿Pasar a «${meta.label}»?`,
      message: bloquea
        ? `${m.fullName} no podrá iniciar sesión mientras esté en «${meta.label}».`
        : `${m.fullName} pasará a «${meta.label}». ${meta.hint}`,
      danger: bloquea,
      confirmLabel: meta.label,
    })
    if (!ok) return

    setBusy(m.id); setMsg(null)
    try {
      await membersApi.changeStatus(m.id, status)
      setMsg({ ok: true, text: `${m.fullName} ahora está «${meta.label}».` })
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo cambiar el estado.' })
    } finally { setBusy(null) }
  }

  const listaMiembros = miembros ?? []
  const listaPost = postulantes ?? []

  return (
    <>
      <PageHeader eyebrow="Administración" title="Gestión de miembros" description="Aprueba postulantes (Junta o Recursos Humanos) y administra el estado de cada miembro." />

      <PillTabs
        tabs={[{ id: 'Miembros', label: 'Miembros' }, { id: 'Postulantes', label: 'Postulantes', badge: listaPost.length || undefined }]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'Miembros' ? (
        <>
          {lm && <p className="text-tea/50">Cargando miembros…</p>}
          {em && <p className="text-candy">No se pudo cargar el directorio.</p>}
          {!lm && !em && listaMiembros.length === 0 && <Card><p className="text-sm text-tea/55">Aún no hay miembros.</p></Card>}

          {/* Directorio administrativo: estado editable + roles (RF-ADM-03). */}
          {!lm && !em && listaMiembros.length > 0 && puedeGestionarEstado && (
            <Reveal>
              <Table minW="780px">
                <thead>
                  <Tr className="hover:bg-transparent"><Th>Miembro</Th><Th>Estado</Th><Th className="hidden md:table-cell">Roles</Th><Th className="hidden lg:table-cell">Último cambio</Th><Th>Cambiar a</Th></Tr>
                </thead>
                <tbody>
                  {listaMiembros.map((m) => {
                    const meta = estadoMeta(m.status)
                    const esYo = m.id === user?.id
                    return (
                      <Tr key={m.id}>
                        <Td>
                          <Link to={`/perfil/${m.id}`} target="_blank" className="font-medium text-tea hover:text-caribbean">{m.fullName}</Link>
                          <span className="block font-mono text-xs text-tea/45">{m.email}</span>
                        </Td>
                        <Td><Chip tone={meta.tone}>{meta.label}</Chip></Td>
                        <Td className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(m.roles ?? []).map((r) => <Chip key={r.id} tone="gris">{r.name}</Chip>)}
                            {(m.roles ?? []).length === 0 && <span className="text-xs text-tea/35">—</span>}
                          </div>
                        </Td>
                        <Td className="hidden lg:table-cell font-mono text-xs text-tea/45">{m.statusChangedAt ? fmtFecha(m.statusChangedAt) : '—'}</Td>
                        <Td>
                          {esYo ? (
                            <span className="font-mono text-xs text-tea/35">Tu cuenta</span>
                          ) : (
                            <select
                              className={`${inputCls} py-1.5 text-xs`}
                              value=""
                              disabled={busy === m.id}
                              onChange={(e) => cambiarEstado(m, e.target.value)}
                            >
                              <option value="">{busy === m.id ? 'Guardando…' : 'Elegir estado…'}</option>
                              {ESTADOS_MIEMBRO.filter((e) => e.id !== m.status).map((e) => (
                                <option key={e.id} value={e.id}>{e.label}</option>
                              ))}
                            </select>
                          )}
                        </Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </Table>
              <p className="mt-4 font-mono text-xs text-tea/40">Suspendido, Retirado y Expulsado impiden iniciar sesión. Los roles se asignan en «Sistema → Roles y permisos».</p>
            </Reveal>
          )}

          {/* Sin permiso de gestión: directorio público de miembros activos. */}
          {!lm && !em && listaMiembros.length > 0 && !puedeGestionarEstado && (
            <Reveal>
              <Table minW="620px">
                <thead>
                  <Tr className="hover:bg-transparent"><Th>Miembro</Th><Th className="hidden sm:table-cell">Disciplina</Th><Th className="hidden md:table-cell">Etiquetas</Th><Th> </Th></Tr>
                </thead>
                <tbody>
                  {listaMiembros.map((m) => (
                    <Tr key={m.id}>
                      <Td className="font-medium text-tea">{m.fullName}</Td>
                      <Td className="hidden sm:table-cell text-tea/55">{m.discipline || '—'}</Td>
                      <Td className="hidden md:table-cell"><div className="flex flex-wrap gap-1">{(m.tags ?? []).map((t) => <Chip key={t} tone="gris">{t}</Chip>)}</div></Td>
                      <Td className="text-right"><Link to={`/perfil/${m.id}`} target="_blank" className="text-xs font-semibold uppercase tracking-wide text-caribbean/80 hover:text-caribbean">Ver perfil</Link></Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
              <p className="mt-4 font-mono text-xs text-tea/40">Solo la Junta Directiva puede cambiar el estado de un miembro.</p>
            </Reveal>
          )}
        </>
      ) : (
        <>
          {!puedeDecidir ? (
            <Card><p className="text-sm text-tea/60">Solo la Junta o Recursos Humanos pueden revisar postulantes.</p></Card>
          ) : (
            <>
              {lp && <p className="text-tea/50">Cargando postulantes…</p>}
              {ep && <p className="text-candy">No se pudieron cargar los postulantes.</p>}
              {!lp && !ep && listaPost.length === 0 && <Card><p className="text-sm text-tea/55">No hay postulantes pendientes.</p></Card>}
              {!lp && !ep && listaPost.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {listaPost.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 2) * 90}>
                      <Card>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{p.fullName}</h3>
                            <p className="mt-1 break-all font-mono text-xs text-tea/50">{p.email}{p.phone ? ` · ${p.phone}` : ''}</p>
                            {p.discipline && <p className="mt-1 font-mono text-xs text-tea/40">{p.discipline}</p>}
                          </div>
                          <div className="flex flex-none flex-col items-end gap-1.5">
                            <Chip tone="tea">{fmtFecha(p.registeredAt)}</Chip>
                            {!p.emailVerified && <Chip tone="terracotta">Sin verificar</Chip>}
                          </div>
                        </div>
                        {p.applicationReason && <p className="mt-3 rounded-lg border border-tea/10 bg-black/20 px-4 py-2 text-sm italic text-tea/70">“{p.applicationReason}”</p>}

                        {p.emailVerified ? (
                          <div className="mt-4 flex gap-2">
                            <Btn className="flex-1 justify-center" onClick={() => decidir(p.id, 'Aceptar')} disabled={busy === p.id}>{busy === p.id ? '…' : 'Aceptar'}</Btn>
                            <Btn tone="ghost" className="flex-1 justify-center" onClick={() => decidir(p.id, 'Rechazar')} disabled={busy === p.id}>Rechazar</Btn>
                          </div>
                        ) : (
                          // RF-PUB-13b: sin correo verificado la solicitud no puede decidirse.
                          <div className="mt-4 rounded-lg border border-terracotta/25 bg-terracotta/10 px-4 py-3">
                            <p className="text-xs leading-relaxed text-tea/70">
                              Aún no confirma su correo, así que su postulación todavía no puede decidirse.
                              Si el correo no le llegó, pásale el enlace por WhatsApp.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Btn className="px-4 py-1.5" onClick={() => enviarPorWhatsapp(p)} disabled={busy === p.id}>
                                {busy === p.id ? '…' : 'Enviar por WhatsApp'}
                              </Btn>
                              <Btn tone="ghost" className="px-4 py-1.5" onClick={() => copiarEnlace(p)} disabled={busy === p.id}>
                                Copiar enlace
                              </Btn>
                            </div>
                          </div>
                        )}
                      </Card>
                    </Reveal>
                  ))}
                  <p className="font-mono text-xs text-tea/40 md:col-span-2">Un correo rechazado no puede volver a postularse hasta pasado 1 mes.</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
