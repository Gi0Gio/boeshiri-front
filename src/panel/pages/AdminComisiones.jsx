import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Btn, Reveal, inputCls, labelCls } from '../ui'
import { groupsApi } from '../../api/groups'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'

export default function AdminComisiones() {
  const { hasPermission } = useSession()
  const puedeCrear = hasPermission('comisiones.ver_todas')

  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data, loading, error } = useFetch(() => groupsApi.commissions(), [version])

  const [abierto, setAbierto] = useState(false)
  const [form, setForm] = useState({ name: '', permanent: true })
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  async function crear() {
    if (!form.name.trim()) { setMsg({ ok: false, text: 'El nombre es obligatorio.' }); return }
    setSaving(true); setMsg(null)
    try {
      await groupsApi.createCommission({ name: form.name.trim(), permanent: form.permanent })
      setMsg({ ok: true, text: 'Comisión creada.' })
      setForm({ name: '', permanent: true }); setAbierto(false); reload()
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo crear la comisión.' }) }
    finally { setSaving(false) }
  }

  const comisiones = data ?? []

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Comisiones y equipos"
        description="Áreas permanentes de trabajo. Crea comisiones y entra a cada una para gestionar integrantes, equipos y solicitudes."
        actions={puedeCrear && <Btn tone="candy" onClick={() => setAbierto((v) => !v)}>{abierto ? 'Cerrar' : '+ Nueva comisión'}</Btn>}
      />


      {abierto && puedeCrear && (
        <Reveal className="mb-8">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">Nueva comisión</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>Nombre</label>
                <input className={`${inputCls} mt-1.5`} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej. Comisión de Arte Urbano" />
              </div>
              <label className="flex items-center gap-2 text-sm text-tea/70">
                <input type="checkbox" checked={form.permanent} onChange={(e) => setForm((f) => ({ ...f, permanent: e.target.checked }))} className="h-4 w-4 accent-[#00e6bc]" />
                Permanente (si la desmarcas, es temporal)
              </label>
              <p className="font-mono text-[0.65rem] text-tea/40">El coordinador se designa dentro de la comisión, una vez tenga integrantes.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <Btn onClick={crear} disabled={saving}>{saving ? 'Creando…' : 'Crear comisión'}</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      {loading && <p className="text-tea/50">Cargando comisiones…</p>}
      {error && <p className="text-candy">No se pudieron cargar las comisiones.</p>}
      {!loading && !error && comisiones.length === 0 && (
        <Card><p className="text-sm text-tea/55">Aún no hay comisiones.{puedeCrear && ' Crea la primera con «+ Nueva comisión».'}</p></Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {comisiones.map((c, i) => (
          <Reveal key={c.id} delay={(i % 2) * 90}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{c.name}</h3>
                  <p className="mt-1 font-mono text-xs text-tea/50">Coordina {c.coordinatorName || '— sin coordinador'}</p>
                </div>
                <Chip tone={c.permanent ? 'caribbean' : 'terracotta'}>{c.permanent ? 'Permanente' : 'Temporal'}</Chip>
              </div>
              <div className="mt-4">
                <span className="font-display text-2xl font-semibold text-cream">{c.memberCount}</span>
                <span className="ml-1 font-mono text-xs text-tea/45">integrantes</span>
              </div>
              <div className="mt-4 border-t border-tea/8 pt-4">
                <Link to={`/panel/grupos/${c.id}`} className="font-mono text-xs font-semibold uppercase tracking-wide text-caribbean/80 hover:text-caribbean">Gestionar comisión →</Link>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </>
  )
}
