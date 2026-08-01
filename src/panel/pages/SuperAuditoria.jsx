import { PageHeader, Card, Reveal, Table, Th, Td, Tr } from '../ui'
import { auditApi } from '../../api/audit'
import { useFetch } from '../../hooks/useFetch'

const fmtFecha = (iso) => new Date(iso).toLocaleString('es-PA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function SuperAuditoria() {
  const { data, loading, error } = useFetch(() => auditApi.list(200))
  const entradas = data ?? []

  return (
    <>
      <PageHeader eyebrow="Sistema · Super Admin" title="Auditoría" description="Registro de acciones relevantes del sistema. Visible únicamente para el Super Administrador." />

      {loading && <p className="text-tea/50">Cargando auditoría…</p>}
      {error && <Card><p className="text-sm text-tea/60">No se pudo cargar la auditoría (¿tienes permiso de Super Admin?).</p></Card>}
      {!loading && !error && entradas.length === 0 && <Card><p className="text-sm text-tea/55">Aún no hay acciones registradas.</p></Card>}

      {!loading && !error && entradas.length > 0 && (
        <Reveal>
          <Table minW="640px">
            <thead>
              <Tr className="hover:bg-transparent"><Th>Fecha</Th><Th>Actor</Th><Th>Acción</Th><Th className="hidden sm:table-cell">Objeto</Th></Tr>
            </thead>
            <tbody>
              {entradas.map((a) => (
                <Tr key={a.id}>
                  <Td className="whitespace-nowrap font-mono text-xs text-tea/45">{fmtFecha(a.timestamp)}</Td>
                  <Td className="font-medium text-tea">{a.actorEmail || '—'}</Td>
                  <Td className="font-mono text-xs text-caribbean/90">{a.action}</Td>
                  <Td className="hidden sm:table-cell font-mono text-xs text-tea/55">{a.objectType}{a.objectId ? ` · ${a.objectId.slice(0, 8)}` : ''}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Reveal>
      )}
    </>
  )
}
