import { useState } from 'react'
import { PageHeader, Card, Stat, Chip, Btn, Reveal, Table, Th, Td, Tr, inputCls, labelCls } from '../ui'
import { financeApi } from '../../api/finance'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const money = (n) => `$${Number(n || 0).toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })
const hoyInput = () => new Date().toISOString().slice(0, 10)
const BLANK = { date: hoyInput(), concept: '', type: 'Income', amount: '' }

export default function AdminFinanzas() {
  const { hasPermission } = useSession()
  const puedeVer = hasPermission('finanzas.ver')
  const puedeEditar = hasPermission('finanzas.editar')

  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data, loading, error } = useFetch(() => (puedeVer ? financeApi.summary() : Promise.resolve(null)), [version, puedeVer])

  const [abierto, setAbierto] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const nuevo = () => { setEditId(null); setForm(BLANK); setMsg(null); setAbierto(true) }
  const cerrar = () => { setAbierto(false); setEditId(null); setForm(BLANK) }
  const editar = (m) => { setEditId(m.id); setForm({ date: m.date.slice(0, 10), concept: m.concept, type: m.type, amount: String(m.amount) }); setMsg(null); setAbierto(true) }

  async function guardar() {
    const amount = Number(form.amount)
    if (!form.concept.trim() || !(amount > 0)) { setMsg({ ok: false, text: 'Concepto y monto (> 0) son obligatorios.' }); return }
    setSaving(true); setMsg(null)
    const body = { date: new Date(form.date).toISOString(), concept: form.concept.trim(), type: form.type, amount }
    try {
      if (editId) await financeApi.updateMovement(editId, body)
      else await financeApi.createMovement(body)
      setMsg({ ok: true, text: editId ? 'Movimiento actualizado.' : 'Movimiento registrado.' })
      cerrar(); reload()
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo guardar.' }) }
    finally { setSaving(false) }
  }

  async function eliminar(id) {
    if (!(await confirm({ message: '¿Eliminar este movimiento?', danger: true, confirmLabel: 'Eliminar' }))) return
    try { await financeApi.deleteMovement(id); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo eliminar.' }) }
  }

  if (!puedeVer) return (
    <>
      <PageHeader eyebrow="Administración" title="Finanzas" description="La Junta ve el balance general; solo el Tesorero puede modificarlo." />
      <Card><p className="text-sm text-tea/60">Tu rol no tiene acceso a las finanzas.</p></Card>
    </>
  )

  const movimientos = data?.movements ?? []

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Finanzas"
        description="La Junta ve el balance general; solo el Tesorero puede modificarlo."
        actions={puedeEditar && <Btn tone="candy" onClick={() => (abierto ? cerrar() : nuevo())}>{abierto ? 'Cerrar' : '+ Registrar movimiento'}</Btn>}
      />

      {!puedeEditar && <p className="mb-6 rounded-xl border border-terracotta/25 bg-terracotta/[0.08] px-4 py-3 text-sm text-tea/75">🔒 Estás en <strong>modo lectura</strong>. Editar el balance requiere el rol de <strong>Tesorero</strong>.</p>}

      {abierto && puedeEditar && (
        <Reveal className="mb-6">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{editId ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Fecha</label>
                <input type="date" className={`${inputCls} mt-1.5`} value={form.date} onChange={(e) => set({ date: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Tipo</label>
                <select className={`${inputCls} mt-1.5`} value={form.type} onChange={(e) => set({ type: e.target.value })}>
                  <option value="Income">Ingreso</option>
                  <option value="Expense">Egreso</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Concepto</label>
                <input className={`${inputCls} mt-1.5`} value={form.concept} onChange={(e) => set({ concept: e.target.value })} placeholder="Ej. Cuotas de miembros" />
              </div>
              <div>
                <label className={labelCls}>Monto (USD)</label>
                <input type="number" min="0.01" step="0.01" className={`${inputCls} mt-1.5`} value={form.amount} onChange={(e) => set({ amount: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="mt-6 flex justify-end"><Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Registrar'}</Btn></div>
          </Card>
        </Reveal>
      )}

      {loading && <p className="text-tea/50">Cargando finanzas…</p>}
      {error && <p className="text-candy">No se pudo cargar el balance.</p>}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Reveal><Stat valor={money(data.balance)} etiqueta="Balance general" /></Reveal>
            <Reveal delay={80}><Stat valor={money(data.totalIncome)} etiqueta="Ingresos" tono="#00735e" /></Reveal>
            <Reveal delay={160}><Stat valor={money(data.totalExpense)} etiqueta="Egresos" tono="#e60035" /></Reveal>
          </div>

          <Reveal delay={120} className="mt-6">
            <Table minW="620px">
              <thead>
                <Tr className="hover:bg-transparent"><Th>Fecha</Th><Th>Concepto</Th><Th>Tipo</Th><Th className="text-right">Monto</Th>{puedeEditar && <Th> </Th>}</Tr>
              </thead>
              <tbody>
                {movimientos.length === 0 && <Tr><Td className="text-tea/45" colSpan={puedeEditar ? 5 : 4}>Aún no hay movimientos.</Td></Tr>}
                {movimientos.map((m) => (
                  <Tr key={m.id}>
                    <Td className="font-mono text-xs text-tea/45">{fmtFecha(m.date)}</Td>
                    <Td className="text-tea">{m.concept}</Td>
                    <Td><Chip tone={m.type === 'Income' ? 'caribbean' : 'terracotta'}>{m.type === 'Income' ? 'Ingreso' : 'Egreso'}</Chip></Td>
                    <Td className={`text-right font-mono font-semibold ${m.type === 'Income' ? 'text-caribbean' : 'text-candy'}`}>{m.type === 'Income' ? '+' : '−'}{money(m.amount)}</Td>
                    {puedeEditar && (
                      <Td className="text-right">
                        <div className="flex justify-end gap-3 text-xs font-semibold uppercase tracking-wide">
                          <button onClick={() => editar(m)} className="text-caribbean/80 hover:text-caribbean">Editar</button>
                          <button onClick={() => eliminar(m.id)} className="text-candy hover:underline">Eliminar</button>
                        </div>
                      </Td>
                    )}
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Reveal>
        </>
      )}
    </>
  )
}
