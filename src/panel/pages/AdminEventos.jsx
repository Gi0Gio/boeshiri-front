import { PageHeader, Chip, Btn, Reveal, DemoNote, Table, Th, Td, Tr } from '../ui'
import { eventosProximos, eventosPasados } from '../../data/contenido'

function Fila({ nombre, categoria, fecha, estado, tono }) {
  return (
    <Tr>
      <Td className="font-medium text-tea">{nombre}</Td>
      <Td className="hidden sm:table-cell text-tea/55">{categoria}</Td>
      <Td className="font-mono text-xs text-tea/50">{fecha}</Td>
      <Td><Chip tone={tono}>{estado}</Chip></Td>
      <Td className="text-right">
        <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
          <button className="text-caribbean/80 hover:text-caribbean">Editar</button>
          <button className="text-caribbean/80 hover:text-caribbean">Ocultar</button>
          <button className="text-candy hover:underline">Eliminar</button>
        </div>
      </Td>
    </Tr>
  )
}

export default function AdminEventos() {
  return (
    <>
      <PageHeader eyebrow="Administración" title="Gestión de eventos" description="Crea, oculta y elimina eventos. Un evento es un proyecto con lugar, costo, imágenes y visibilidad." actions={<Btn tone="candy">+ Nuevo evento</Btn>} />

      <Reveal>
        <Table minW="620px">
          <thead>
            <Tr className="hover:bg-transparent"><Th>Evento</Th><Th className="hidden sm:table-cell">Categoría</Th><Th>Fecha</Th><Th>Estado</Th><Th> </Th></Tr>
          </thead>
          <tbody>
            {eventosProximos.map((e) => <Fila key={e.slug} nombre={e.titulo} categoria={e.categoria} fecha={`${e.dia} ${e.mes} ${e.año}`} estado="Próximo · Público" tono="caribbean" />)}
            {eventosPasados.map((e) => <Fila key={e.titulo} nombre={e.titulo} categoria={e.categoria} fecha={e.fecha} estado="Realizado" tono="gris" />)}
          </tbody>
        </Table>
      </Reveal>
      <DemoNote />
    </>
  )
}
