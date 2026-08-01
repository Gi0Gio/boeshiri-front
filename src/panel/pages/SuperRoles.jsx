import { useState } from 'react'
import { PageHeader, Card, Chip, Reveal } from '../ui'
import { rolesApi } from '../../api/roles'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'

/** Chip de rol con su color (hex de la BD) o un color por defecto. */
function RolChip({ name, color }) {
  const bg = color && color.startsWith('#') ? color : '#00735e'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-cream" style={{ backgroundColor: bg + '33', border: `1px solid ${bg}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: bg }} />{name}
    </span>
  )
}

export default function SuperRoles() {
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data: roles, loading: lr, error: er } = useFetch(() => rolesApi.list(), [version])
  const { data: permisos, loading: lp } = useFetch(() => rolesApi.permissions(), [version])
  const { data: usuarios, loading: lu, error: eu } = useFetch(() => rolesApi.users(), [version])
  const toast = useToast()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  const listaRoles = roles ?? []
  const listaPerm = permisos ?? []
  const listaUsuarios = usuarios ?? []

  const tienePermiso = (rol, key) => rol.permissions.includes('*') || rol.permissions.includes(key)

  async function asignar(userId, roleId) {
    if (!roleId) return
    setMsg(null)
    try { await rolesApi.assign(userId, roleId); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo asignar el rol.' }) }
  }
  async function retirar(userId, roleId) {
    setMsg(null)
    try { await rolesApi.remove(userId, roleId); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo retirar el rol.' }) }
  }

  return (
    <>
      <PageHeader
        eyebrow="Sistema · Super Admin"
        title="Roles y permisos"
        description="Los permisos se asignan a los roles; los usuarios acumulan permisos al sumar roles (modelo aditivo tipo Discord)."
      />


      {/* Roles */}
      {(er || eu) && <p className="mb-6 text-candy">No se pudo cargar la información de roles (¿tienes permiso de Super Admin?).</p>}
      {lr ? <p className="text-tea/50">Cargando roles…</p> : (
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listaRoles.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 70}>
              <Card className="flex items-center justify-between py-4">
                <div>
                  <RolChip name={r.name} color={r.color} />
                  <p className="mt-2 font-mono text-xs text-tea/45">{r.userCount} usuarios · {r.permissions.includes('*') ? 'todos los permisos' : `${r.permissions.length} permisos`}</p>
                </div>
                {r.isSystem && <Chip tone="gris">Sistema</Chip>}
              </Card>
            </Reveal>
          ))}
        </div>
      )}

      {/* Matriz de permisos (solo lectura) */}
      {!lp && !lr && listaPerm.length > 0 && (
        <Reveal>
          <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-cream">Matriz de permisos</h2>
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

      {/* Asignación de roles a usuarios */}
      <Reveal className="mt-10">
        <h2 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-cream">Roles por usuario</h2>
        {lu ? <p className="text-tea/50">Cargando usuarios…</p> : (
          <div className="space-y-3">
            {listaUsuarios.map((u) => {
              const idsAsignados = new Set(u.roles.map((r) => r.id))
              const disponibles = listaRoles.filter((r) => !idsAsignados.has(r.id))
              return (
                <Card key={u.id} className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-sm font-semibold uppercase tracking-wide text-cream">{u.fullName}</p>
                    <p className="font-mono text-xs text-tea/45">{u.email} · {u.status === 'Active' ? 'Activo' : u.status}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {u.roles.length === 0 && <span className="font-mono text-xs text-tea/35">Sin roles</span>}
                      {u.roles.map((r) => (
                        <span key={r.id} className="group inline-flex items-center gap-1">
                          <RolChip name={r.name} color={r.color} />
                          <button onClick={() => retirar(u.id, r.id)} className="font-mono text-xs text-tea/35 transition hover:text-candy" aria-label={`Quitar ${r.name}`}>✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {disponibles.length > 0 && (
                    <select defaultValue="" onChange={(e) => { asignar(u.id, e.target.value); e.target.value = '' }} className="rounded-lg border border-tea/15 bg-jungle-deep/60 px-3 py-2 font-mono text-xs text-tea focus:border-caribbean focus:outline-none">
                      <option value="">+ Añadir rol…</option>
                      {disponibles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
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
