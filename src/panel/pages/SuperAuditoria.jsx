import { PageHeader, Reveal, DemoNote, Table, Th, Td, Tr } from '../ui'
import { auditoria } from '../../data/panel'

export default function SuperAuditoria() {
  return (
    <>
      <PageHeader eyebrow="Sistema · Super Admin" title="Auditoría" description="Registro de acciones relevantes del sistema. Visible únicamente para el Super Administrador." />

      <Reveal>
        <Table minW="560px">
          <thead>
            <Tr className="hover:bg-transparent"><Th>Fecha</Th><Th>Actor</Th><Th>Acción</Th><Th className="hidden sm:table-cell">Objeto</Th></Tr>
          </thead>
          <tbody>
            {auditoria.map((a, i) => (
              <Tr key={i}>
                <Td className="whitespace-nowrap font-mono text-xs text-tea/45">{a.fecha}</Td>
                <Td className="font-medium text-tea">{a.actor}</Td>
                <Td className="text-caribbean/90">{a.accion}</Td>
                <Td className="hidden sm:table-cell text-tea/55">{a.objeto}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Reveal>
      <DemoNote />
    </>
  )
}
