import { useState, useMemo } from 'react'
import { PageHeader, Card, Chip, Btn, Reveal, inputCls } from '../ui'
import { rolesApi } from '../../api/roles'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

/** Chip de rol con su color (hex de la BD) o un color por defecto. */
function RolChip({ name, color }) {
  const bg = color && color.startsWith('#') ? color : '#00735e'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-cream" style={{ backgroundColor: bg + '33', border: `1px solid ${bg}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: bg }} />{name}
    </span>
  )
}

const ESTADO_ES = {
  Active: 'Activo', Inactive: 'Inactivo', Suspended: 'Suspendido',
  Retired: 'Retirado', Expelled: 'Expulsado', Applicant: 'Postulante',
}

export default function SuperRoles() {
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data: roles, loading: lr, error: er } = useFetch(() => rolesApi.list(), [version])
  const { data: permisos, loading: lp } = useFetch(() => rolesApi.permissions(), [version])
  const { data: usuarios, loading: lu, error: eu } = useFetch(() => rolesApi.users(), [version])
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  // La matriz es material de consulta, no de trabajo diario: ocupaba media pantalla
  // por encima de lo que sí se usa a diario, que es asignar roles.
  const [verMatriz, setVerMatriz] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')   // '' todos · 'sin' sin roles · id de rol
  const [busy, setBusy] = useState(null)

  // Editor de rol. `editando` null = cerrado; sin id = creando uno nuevo.
  const [editando, setEditando] = useState(null)
  const COLORES = ['#00e6bc', '#00735e', '#d67a63', '#e60035', '#d9f2c2', '#002420']
  // Los postulantes y las bajas ensucian la lista: asignar roles es una tarea
  // sobre gente activa. Se pueden mostrar por si hay que retirarle un rol a
  // alguien suspendido, pero no estorban por defecto.
  const [verNoActivos, setVerNoActivos] = useState(false)

  const listaRoles = roles ?? []
  const listaPerm = permisos ?? []
  const listaUsuarios = usuarios ?? []

  const tienePermiso = (rol, key) => rol.permissions.includes('*') || rol.permissions.includes(key)

  const activos = useMemo(
    () => (verNoActivos ? listaUsuarios : listaUsuarios.filter((u) => u.status === 'Active')),
    [listaUsuarios, verNoActivos],
  )

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return activos.filter((u) => {
      if (q && !`${u.fullName} ${u.email}`.toLowerCase().includes(q)) return false
      if (filtroRol === 'sin') return u.roles.length === 0
      if (filtroRol) return u.roles.some((r) => r.id === filtroRol)
      return true
    })
  }, [activos, busqueda, filtroRol])

  const ocultos = listaUsuarios.length - activos.length

  const abrirNuevo = () => setEditando({ name: '', color: COLORES[0], permissions: [] })
  const abrirEdicion = (r) => setEditando({ id: r.id, name: r.name, color: r.color || COLORES[0], permissions: [...r.permissions] })

  const alternarPermiso = (key) => setEditando((e) => ({
    ...e,
    permissions: e.permissions.includes(key) ? e.permissions.filter((k) => k !== key) : [...e.permissions, key],
  }))

  async function guardarRol() {
    const nombre = editando.name.trim()
    if (!nombre) { setMsg({ ok: false, text: 'El nombre del rol es obligatorio.' }); return }

    setBusy('rol'); setMsg(null)
    try {
      if (editando.id) {
        // Nombre/color y permisos van por endpoints distintos: el mapa de permisos
        // se reemplaza entero y conviene poder auditarlo por separado.
        await rolesApi.updateRole(editando.id, { name: nombre, color: editando.color })
        await rolesApi.setPermissions(editando.id, editando.permissions)
      } else {
        await rolesApi.createRole({ name: nombre, color: editando.color, permissions: editando.permissions })
      }
      setMsg({ ok: true, text: editando.id ? 'Rol actualizado.' : 'Rol creado.' })
      setEditando(null)
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo guardar el rol.' })
    } finally { setBusy(null) }
  }

  async function borrarRol(r) {
    const ok = await confirm({
      title: `¿Eliminar el rol «${r.name}»?`,
      message: r.userCount > 0
        ? `${r.userCount} ${r.userCount === 1 ? 'miembro perderá' : 'miembros perderán'} los permisos que este rol les daba.`
        : 'No lo tiene asignado nadie.',
      danger: true,
      confirmLabel: 'Eliminar',
    })
    if (!ok) return

    setBusy(r.id); setMsg(null)
    try {
      const res = await rolesApi.deleteRole(r.id)
      setMsg({ ok: true, text: res?.mensaje || 'Rol eliminado.' })
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo eliminar.' })
    } finally { setBusy(null) }
  }

  async function asignar(userId, roleId) {
    if (!roleId) return
    setBusy(userId); setMsg(null)
    try { await rolesApi.assign(userId, roleId); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo asignar el rol.' }) }
    finally { setBusy(null) }
  }

  async function retirar(userId, roleId) {
    setBusy(userId); setMsg(null)
    try { await rolesApi.remove(userId, roleId); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo retirar el rol.' }) }
    finally { setBusy(null) }
  }

  return (
    <>
      <PageHeader
        eyebrow="Sistema · Super Admin"
        title="Roles y permisos"
        description="Los permisos se asignan a los roles; los usuarios acumulan permisos al sumar roles (modelo aditivo tipo Discord)."
        actions={<Btn onClick={abrirNuevo}>+ Nuevo rol</Btn>}
      />

      {/* Editor de rol */}
      {editando && (
        <Reveal className="mb-6">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">
              {editando.id ? 'Editar rol' : 'Nuevo rol'}
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-caribbean">Nombre</label>
                <input
                  className={`${inputCls} mt-1.5`}
                  value={editando.name}
                  onChange={(e) => setEditando((x) => ({ ...x, name: e.target.value }))}
                  placeholder="Ej. Fotógrafo, Archivista…"
                  autoFocus
                />
              </div>
              <div>
                <label className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-caribbean">Color</label>
                <div className="mt-1.5 flex gap-2">
                  {COLORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditando((x) => ({ ...x, color: c }))}
                      aria-label={`Color ${c}`}
                      className={`h-9 w-9 rounded-full border-2 transition ${editando.color === c ? 'border-cream' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-caribbean">
                Permisos <span className="font-normal normal-case tracking-normal text-tea/40">({editando.permissions.length} de {listaPerm.length})</span>
              </label>
              {/* El comodín no se ofrece: concederlo crearía un segundo Super
                  Administrador saltándose el modelo, y el backend lo rechaza. */}
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {listaPerm.filter((p) => p.key !== '*').map((p) => {
                  const activo = editando.permissions.includes(p.key)
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => alternarPermiso(p.key)}
                      title={p.description || ''}
                      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-left transition ${activo ? 'bg-caribbean/12' : 'hover:bg-tea/5'}`}
                    >
                      <span className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded text-[0.6rem] font-bold ${activo ? 'bg-caribbean text-jungle' : 'bg-tea/12 text-transparent'}`}>✓</span>
                      <span className="min-w-0">
                        <span className={`block font-mono text-xs ${activo ? 'text-cream' : 'text-tea/60'}`}>{p.key}</span>
                        {p.description && <span className="block text-[0.7rem] leading-snug text-tea/35">{p.description}</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Btn onClick={guardarRol} disabled={busy === 'rol'}>{busy === 'rol' ? 'Guardando…' : 'Guardar'}</Btn>
              <Btn tone="ghost" onClick={() => setEditando(null)}>Cancelar</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      {(er || eu) && <p className="mb-6 text-candy">No se pudo cargar la información de roles (¿tienes permiso de Super Admin?).</p>}

      {/* Roles */}
      {lr ? <p className="text-tea/50">Cargando roles…</p> : (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listaRoles.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 70}>
              <Card className="flex h-full flex-col justify-between py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <RolChip name={r.name} color={r.color} />
                    <p className="mt-2 font-mono text-xs text-tea/45">
                      {r.userCount} usuarios · {r.permissions.includes('*') ? 'todos los permisos' : `${r.permissions.length} permisos`}
                    </p>
                  </div>
                  {r.isSystem && <Chip tone="gris">Sistema</Chip>}
                </div>

                {/* Los de sistema no se editan: la semilla repondría sus permisos
                    al reiniciar, así que el cambio sería una ilusión. */}
                {r.isSystem ? (
                  <p className="mt-3 font-mono text-[0.65rem] text-tea/25">Definido por el sistema</p>
                ) : (
                  <div className="mt-3 flex gap-3 text-xs font-semibold uppercase tracking-wide">
                    <button onClick={() => abrirEdicion(r)} className="text-caribbean/80 hover:text-caribbean">Editar</button>
                    <button onClick={() => borrarRol(r)} disabled={busy === r.id} className="text-candy hover:underline disabled:opacity-40">
                      {busy === r.id ? '…' : 'Eliminar'}
                    </button>
                  </div>
                )}
              </Card>
            </Reveal>
          ))}
        </div>
      )}

      {/* Matriz de permisos: plegada por defecto */}
      {!lp && !lr && listaPerm.length > 0 && (
        <div className="mb-10">
          <button
            type="button"
            onClick={() => setVerMatriz((v) => !v)}
            aria-expanded={verMatriz}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-tea/10 bg-jungle px-5 py-4 text-left transition hover:border-caribbean/40"
          >
            <span>
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-cream">Matriz de permisos</span>
              <span className="mt-0.5 block font-mono text-xs text-tea/45">
                {listaPerm.length} permisos × {listaRoles.length} roles
              </span>
            </span>
            <span className={`flex-none font-mono text-xs uppercase tracking-[0.12em] text-caribbean transition-transform ${verMatriz ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {verMatriz && (
            <Reveal className="mt-3">
              <div className="overflow-x-auto rounded-2xl border border-tea/10 bg-jungle">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border-b border-tea/10 bg-black/20 px-5 py-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-tea/45">Permiso</th>
                      {listaRoles.map((r) => <th key={r.id} className="border-b border-tea/10 bg-black/20 px-3 py-3 text-center font-mono text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-tea/45">{r.name.split(' ')[0]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {listaPerm.map((p) => (
                      <tr key={p.key} className="border-b border-tea/5 last:border-0 hover:bg-tea/[0.04]">
                        <td className="px-5 py-2.5 font-mono text-xs text-tea/80" title={p.description || ''}>{p.key}</td>
                        {listaRoles.map((r) => (
                          <td key={r.id} className="px-3 py-2.5 text-center">
                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold ${tienePermiso(r, p.key) ? 'bg-caribbean text-jungle' : 'bg-tea/10 text-transparent'}`}>✓</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-tea/45">El comodín «*» del Super Administrador concede todos los permisos. Editar la matriz por rol llegará en una próxima iteración.</p>
            </Reveal>
          )}
        </div>
      )}

      {/* Explorador de miembros */}
      <Reveal>
        <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-cream">Roles por miembro</h2>

        <div className="rounded-2xl border border-tea/10 bg-jungle p-4">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className={inputCls}
            autoComplete="off"
          />

          {/* Filtro por rol: la pregunta habitual es "¿quién es Tesorero?" o
              "¿a quién le falta rol?", no recorrer la lista entera. */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[{ id: '', label: 'Todos' }, { id: 'sin', label: 'Sin roles' }, ...listaRoles.map((r) => ({ id: r.id, label: r.name }))].map((f) => (
              <button
                key={f.id || 'todos'}
                type="button"
                onClick={() => setFiltroRol(f.id)}
                className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${filtroRol === f.id ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/55 hover:bg-tea/15 hover:text-tea'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs text-tea/40">
              {filtrados.length} de {activos.length} miembros{verNoActivos ? '' : ' activos'}
            </p>
            {(ocultos > 0 || verNoActivos) && (
              <button
                type="button"
                onClick={() => setVerNoActivos((v) => !v)}
                className="font-mono text-xs text-tea/45 underline-offset-4 transition hover:text-caribbean hover:underline"
              >
                {verNoActivos ? 'Ocultar los no activos' : `Mostrar ${ocultos} no activos`}
              </button>
            )}
          </div>
        </div>

        {lu ? <p className="mt-4 text-tea/50">Cargando miembros…</p> : (
          <div className="mt-4 space-y-3">
            {filtrados.length === 0 && (
              <Card><p className="text-sm text-tea/55">Ningún miembro coincide con la búsqueda.</p></Card>
            )}

            {filtrados.map((u) => {
              const idsAsignados = new Set(u.roles.map((r) => r.id))
              const disponibles = listaRoles.filter((r) => !idsAsignados.has(r.id))
              return (
                <Card key={u.id} className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold uppercase tracking-wide text-cream">{u.fullName}</p>
                    <p className="break-all font-mono text-xs text-tea/45">{u.email} · {ESTADO_ES[u.status] ?? u.status}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {u.roles.length === 0 && <span className="font-mono text-xs text-tea/35">Sin roles</span>}
                      {u.roles.map((r) => (
                        <span key={r.id} className="inline-flex items-center gap-1">
                          <RolChip name={r.name} color={r.color} />
                          <button
                            onClick={() => retirar(u.id, r.id)}
                            disabled={busy === u.id}
                            className="font-mono text-xs text-tea/35 transition hover:text-candy disabled:opacity-40"
                            aria-label={`Quitar el rol ${r.name} a ${u.fullName}`}
                            title={`Quitar ${r.name}`}
                          >✕</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {disponibles.length > 0 ? (
                    <select
                      value=""
                      disabled={busy === u.id}
                      onChange={(e) => asignar(u.id, e.target.value)}
                      className="flex-none rounded-lg border border-tea/15 bg-jungle-deep/60 px-3 py-2 font-mono text-xs text-tea focus:border-caribbean focus:outline-none disabled:opacity-50"
                      aria-label={`Añadir rol a ${u.fullName}`}
                    >
                      <option value="">{busy === u.id ? 'Guardando…' : '+ Añadir rol…'}</option>
                      {disponibles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  ) : (
                    <span className="flex-none font-mono text-xs text-tea/30">Tiene todos los roles</span>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </Reveal>
    </>
  )
}
