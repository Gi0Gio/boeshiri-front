import { useState } from 'react'
import { PageHeader, Chip, Btn, Reveal, DemoNote, PillTabs, Table, Th, Td, Tr } from '../ui'
import { documentos } from '../../data/panel'

const accesoTono = { Miembros: 'caribbean', Administración: 'terracotta' }

export default function Documentos() {
  const [tab, setTab] = useState('Comunidad')
  const lista = documentos.filter((d) => d.biblioteca === tab)

  return (
    <>
      <PageHeader
        eyebrow="Miembro"
        title="Documentos y biblioteca"
        description="Repositorio interno, exclusivo para miembros. Sube archivos directamente o adjúntalos desde un artículo."
        actions={<Btn tone="candy">+ Subir documento</Btn>}
      />

      <PillTabs tabs={['Comunidad', 'Administración']} active={tab} onChange={setTab} />

      <p className="mb-4 rounded-xl border border-tea/10 bg-black/20 px-4 py-3 text-xs leading-relaxed text-tea/60">
        {tab === 'Comunidad'
          ? 'Material aportado por los miembros (anteproyectos, tesis, ensayos). Subida libre, sin curaduría. Para publicar de cara al público se usan los artículos.'
          : 'Plantillas y cartas membretadas de la Junta, de fácil acceso para todos los miembros. La documentación de nivel Administración queda restringida por permisos.'}
      </p>

      <Reveal>
        <Table minW="640px">
          <thead>
            <Tr className="hover:bg-transparent">
              <Th>Nombre</Th><Th className="hidden sm:table-cell">Categoría</Th><Th className="hidden md:table-cell">Autor</Th><Th className="hidden md:table-cell">Fecha</Th><Th>Acceso</Th><Th> </Th>
            </Tr>
          </thead>
          <tbody>
            {lista.map((d) => (
              <Tr key={d.nombre}>
                <Td className="font-medium text-tea">📄 {d.nombre}</Td>
                <Td className="hidden sm:table-cell text-tea/55">{d.categoria}</Td>
                <Td className="hidden md:table-cell text-tea/55">{d.autor}</Td>
                <Td className="hidden md:table-cell font-mono text-xs text-tea/40">{d.fecha}</Td>
                <Td><Chip tone={accesoTono[d.acceso]}>{d.acceso}</Chip></Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                    <button className="text-caribbean/80 hover:text-caribbean">Descargar</button>
                    <button className="text-caribbean/80 hover:text-caribbean">Reemplazar</button>
                    <button className="text-candy hover:underline">Eliminar</button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Reveal>
      <p className="mt-4 font-mono text-xs text-tea/40">v1: solo se conserva la última versión al reemplazar (sin versionado).</p>
      <DemoNote />
    </>
  )
}
