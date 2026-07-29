import { useState } from 'react'
import { PageHeader, Card, Chip, Btn, Reveal, DemoNote, PillTabs, Table, Th, Td, Tr } from '../ui'
import { miembros, postulantes, estadoTono } from '../../data/panel'

export default function AdminMiembros() {
  const [tab, setTab] = useState('Miembros')

  return (
    <>
      <PageHeader eyebrow="Administración" title="Gestión de miembros" description="Aprueba postulantes (Junta o Recursos Humanos) y administra los estados de los miembros." />

      <PillTabs
        tabs={[{ id: 'Miembros', label: 'Miembros' }, { id: 'Postulantes', label: 'Postulantes', badge: postulantes.length }]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'Miembros' ? (
        <Reveal>
          <Table minW="680px">
            <thead>
              <Tr className="hover:bg-transparent"><Th>Miembro</Th><Th>Disciplina</Th><Th>Comisión</Th><Th>Roles</Th><Th>Estado</Th></Tr>
            </thead>
            <tbody>
              {miembros.map((m) => (
                <Tr key={m.nombre}>
                  <Td className="font-medium text-tea">{m.nombre}</Td>
                  <Td className="text-tea/55">{m.disciplina}</Td>
                  <Td className="text-tea/55">{m.comision}</Td>
                  <Td><div className="flex flex-wrap gap-1">{m.roles.map((r) => <Chip key={r} tone="gris">{r}</Chip>)}</div></Td>
                  <Td><Chip tone={estadoTono[m.estado]}>{m.estado}</Chip></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Reveal>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {postulantes.map((p, i) => (
            <Reveal key={p.correo} delay={(i % 2) * 90}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{p.nombre}</h3>
                    <p className="mt-1 font-mono text-xs text-tea/50">{p.correo} · {p.telefono}</p>
                  </div>
                  <Chip tone="tea">{p.fecha}</Chip>
                </div>
                <p className="mt-3 rounded-lg border border-tea/10 bg-black/20 px-4 py-2 text-sm italic text-tea/70">"{p.razon}"</p>
                <div className="mt-4 flex gap-2">
                  <Btn className="flex-1 justify-center">Aceptar</Btn>
                  <Btn tone="ghost" className="flex-1 justify-center">Rechazar</Btn>
                </div>
              </Card>
            </Reveal>
          ))}
          <p className="font-mono text-xs text-tea/40 md:col-span-2">Un correo rechazado no puede volver a postularse hasta pasado 1 mes.</p>
        </div>
      )}
      <DemoNote />
    </>
  )
}
