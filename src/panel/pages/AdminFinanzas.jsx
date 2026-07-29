import { PageHeader, Stat, Chip, Btn, Reveal, DemoNote, Table, Th, Td, Tr } from '../ui'
import { finanzas } from '../../data/panel'
import { useSession } from '../../auth/SessionContext'

export default function AdminFinanzas() {
  const { rol } = useSession()
  const puedeEditar = rol === 'superadmin' // en la demo, proxy del rol Tesorero

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Finanzas"
        description="La Junta ve el balance general; solo el Tesorero puede modificarlo."
        actions={<Btn tone={puedeEditar ? 'primary' : 'ghost'} className={puedeEditar ? '' : 'pointer-events-none opacity-50'}>{puedeEditar ? 'Registrar movimiento' : 'Solo lectura'}</Btn>}
      />

      {!puedeEditar && (
        <p className="mb-6 rounded-xl border border-terracotta/25 bg-terracotta/[0.08] px-4 py-3 text-sm text-tea/75">🔒 Estás viendo en <strong>modo lectura</strong>. Editar el balance requiere el rol de <strong>Tesorero</strong>.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Reveal><Stat valor={`$${finanzas.balance.toLocaleString()}`} etiqueta="Balance general" /></Reveal>
        <Reveal delay={80}><Stat valor={`$${finanzas.ingresos.toLocaleString()}`} etiqueta="Ingresos" tono="#00735e" /></Reveal>
        <Reveal delay={160}><Stat valor={`$${finanzas.egresos.toLocaleString()}`} etiqueta="Egresos" tono="#e60035" /></Reveal>
      </div>

      <Reveal delay={120} className="mt-6">
        <Table minW="560px">
          <thead>
            <Tr className="hover:bg-transparent"><Th>Fecha</Th><Th>Concepto</Th><Th>Tipo</Th><Th className="text-right">Monto</Th></Tr>
          </thead>
          <tbody>
            {finanzas.movimientos.map((m, i) => (
              <Tr key={i}>
                <Td className="font-mono text-xs text-tea/45">{m.fecha}</Td>
                <Td className="text-tea">{m.concepto}</Td>
                <Td><Chip tone={m.tipo === 'Ingreso' ? 'caribbean' : 'terracotta'}>{m.tipo}</Chip></Td>
                <Td className={`text-right font-mono font-semibold ${m.monto > 0 ? 'text-caribbean' : 'text-candy'}`}>{m.monto > 0 ? '+' : '−'}${Math.abs(m.monto)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Reveal>
      <DemoNote />
    </>
  )
}
