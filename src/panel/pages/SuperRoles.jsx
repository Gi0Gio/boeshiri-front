import { useState } from 'react'
import { PageHeader, Card, Chip, Btn, Reveal, DemoNote } from '../ui'
import { roles, permisos } from '../../data/panel'

export default function SuperRoles() {
  const inicial = {}
  roles.forEach((r) => {
    inicial[r.nombre] = {}
    permisos.forEach((p) => { inicial[r.nombre][p] = r.permisos.includes('Todos') || r.permisos.includes(p) })
  })
  const [matriz, setMatriz] = useState(inicial)
  const toggle = (rol, permiso) => setMatriz((m) => ({ ...m, [rol]: { ...m[rol], [permiso]: !m[rol][permiso] } }))

  return (
    <>
      <PageHeader
        eyebrow="Sistema · Super Admin"
        title="Roles y permisos"
        description="Los permisos se asignan a los roles; los usuarios acumulan permisos al sumar roles. Solo el Super Admin crea y configura roles (modelo tipo Discord)."
        actions={<Btn tone="candy">+ Crear rol</Btn>}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r, i) => (
          <Reveal key={r.nombre} delay={(i % 3) * 70}>
            <Card className="flex items-center justify-between py-4">
              <div>
                <Chip tone={r.color === 'jungle' ? 'gris' : r.color}>{r.nombre}</Chip>
                <p className="mt-2 font-mono text-xs text-tea/45">{r.usuarios} usuarios</p>
              </div>
              <button className="font-mono text-xs font-semibold uppercase tracking-wide text-caribbean/80 hover:text-caribbean">Editar</button>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="overflow-x-auto rounded-2xl border border-tea/10 bg-jungle">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-tea/10 bg-black/20 px-5 py-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-tea/45">Permiso</th>
                {roles.map((r) => <th key={r.nombre} className="border-b border-tea/10 bg-black/20 px-3 py-3 text-center font-mono text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-tea/45">{r.nombre.split(' ')[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {permisos.map((p) => (
                <tr key={p} className="border-b border-tea/5 last:border-0 hover:bg-tea/[0.04]">
                  <td className="px-5 py-2.5 text-tea/80">{p}</td>
                  {roles.map((r) => {
                    const on = matriz[r.nombre][p]
                    const locked = r.permisos.includes('Todos')
                    return (
                      <td key={r.nombre} className="px-3 py-2.5 text-center">
                        <button disabled={locked} onClick={() => toggle(r.nombre, p)} className={`h-5 w-5 rounded text-xs font-bold transition ${on ? 'bg-caribbean text-jungle shadow-[0_0_8px_rgba(0,230,188,0.4)]' : 'bg-tea/10 text-transparent'} ${locked ? 'opacity-70' : 'hover:ring-2 hover:ring-caribbean/40'}`} aria-label={`${p} para ${r.nombre}`}>✓</button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
      <p className="mt-4 text-xs text-tea/45">El Super Admin puede todo lo de la Junta y controla el sistema; lo único que no puede es publicar en nombre de otra persona.</p>
      <DemoNote />
    </>
  )
}
