import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Btn, Reveal, inputCls, labelCls } from '../ui'
import { marketplaceApi } from '../../api/marketplace'
import { profileApi } from '../../api/profile'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import ImageUpload from '../../components/ImageUpload'
import CompartirBoton from '../../components/CompartirBoton'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const estadoTono = { Published: 'caribbean', Sold: 'gris', Hidden: 'terracotta' }
const estadoLabel = { Published: 'Publicado', Sold: 'Vendido', Hidden: 'Oculto' }
const BLANK = { kind: 'Product', name: '', category: '', price: '', priceMax: '', description: '', deliveryLocation: '', images: [] }

/** Rango si lo hay, precio si no, y "a convenir" cuando vale 0. */
export function precioTexto(p) {
  if (p.priceMax != null && p.priceMax > p.price) return `$${p.price} – $${p.priceMax}`
  return p.price > 0 ? `$${p.price}` : 'A convenir'
}

export default function MiMarketplace() {
  const { hasPermission } = useSession()
  const puede = hasPermission('marketplace.gestionar_propio')

  const [version, setVersion] = useState(0)
  const { data: perfil } = useFetch(() => profileApi.me(), [version])
  const { data: prods, loading, error } = useFetch(() => marketplaceApi.mine(), [version])
  const reload = () => setVersion((v) => v + 1)
  const activo = perfil?.marketplaceActive

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

  const setImageAt = (i, url) => setForm((f) => {
    const imgs = [...f.images]
    if (url) imgs[i] = url; else imgs.splice(i, 1)
    return { ...f, images: imgs }
  })

  async function darDeAlta() {
    setMsg(null)
    try { await marketplaceApi.enroll(); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo dar de alta.' }) }
  }

  async function editar(id) {
    setMsg(null)
    try {
      const p = await marketplaceApi.get(id)
      setForm({ kind: p.kind ?? 'Product', name: p.name ?? '', category: p.category ?? '', price: String(p.price ?? ''), priceMax: p.priceMax != null ? String(p.priceMax) : '', description: p.description ?? '', deliveryLocation: p.deliveryLocation ?? '', images: p.images ?? [] })
      setEditId(id); setAbierto(true)
    } catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo abrir el producto.' }) }
  }

  async function guardar() {
    if (!form.name.trim() || !form.category.trim()) { setMsg({ ok: false, text: 'Nombre y categoría son obligatorios.' }); return }
    setSaving(true); setMsg(null)
    const base = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price) || 0,
      // El rango solo viaja en servicios; en un producto el backend lo rechaza.
      priceMax: form.kind === 'Service' && form.priceMax !== '' ? Number(form.priceMax) : null,
      description: form.description || null,
      deliveryLocation: form.deliveryLocation || null,
      // Lista completa: el backend borra del bucket lo que no venga en ella.
      images: form.images.filter(Boolean),
    }
    try {
      if (editId) await marketplaceApi.update(editId, base)
      else await marketplaceApi.create({ ...base, kind: form.kind })
      setMsg({ ok: true, text: editId ? 'Producto actualizado.' : 'Producto publicado.' })
      cerrar(); reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo guardar.' })
    } finally { setSaving(false) }
  }

  async function cambiarEstado(id, action) {
    if (action === 'Delete' && !(await confirm({ message: '¿Eliminar este anuncio?', danger: true, confirmLabel: 'Eliminar' }))) return
    try { await marketplaceApi.changeStatus(id, action); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo cambiar el estado.' }) }
  }

  const mios = prods ?? []

  return (
    <>
      <PageHeader
        eyebrow="Miembro"
        title="Mi marketplace"
        description="Publica tus productos. Boesh Irí no gestiona pagos: el visitante te contacta con los datos de tu perfil."
        actions={puede && activo && <Btn tone="candy" onClick={() => (abierto ? cerrar() : nuevo())}>{abierto ? 'Cerrar' : '+ Nuevo producto'}</Btn>}
      />


      {!puede && <Card className="mb-6"><p className="text-sm text-tea/60">Tu rol aún no puede vender en el marketplace.</p></Card>}

      {puede && (
        <Reveal className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-caribbean/25 bg-caribbean/[0.06] p-5">
            {activo ? (
              <>
                <div>
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-cream">Estás dado de alta en el marketplace</p>
                  <p className="mt-1 font-mono text-xs text-tea/55">Tu contacto se toma del perfil{perfil?.email ? `: ${perfil.email}` : ''}</p>
                </div>
                <Chip tone="caribbean">Vendedor activo</Chip>
              </>
            ) : (
              <>
                <div>
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-cream">Aún no vendes en el marketplace</p>
                  <p className="mt-1 font-mono text-xs text-tea/55">Date de alta para poder publicar productos.</p>
                </div>
                <Btn onClick={darDeAlta}>Darme de alta</Btn>
              </>
            )}
          </div>
        </Reveal>
      )}

      {abierto && activo && (
        <Reveal className="mb-8">
          <Card>
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-cream">{editId ? 'Editar anuncio' : 'Nuevo anuncio'}</h2>
            <div className="mt-5 space-y-4">
              {!editId ? (
                <div>
                  <label className={labelCls}>Tipo</label>
                  <div className="mt-1.5 inline-flex rounded-full bg-tea/8 p-1">
                    {[{ id: 'Product', label: 'Producto' }, { id: 'Service', label: 'Servicio' }].map((k) => (
                      <button key={k.id} type="button" onClick={() => set({ kind: k.id })}
                        className={`rounded-full px-5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide transition ${form.kind === k.id ? 'bg-caribbean text-jungle' : 'text-tea/55 hover:text-tea'}`}>
                        {k.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 font-mono text-[0.65rem] text-tea/40">{form.kind === 'Service' ? 'Un servicio: tutorías, asesorías, encargos…' : 'Un bien físico que entregas.'}</p>
                </div>
              ) : (
                <Chip tone={form.kind === 'Service' ? 'rainforest' : 'tea'}>{form.kind === 'Service' ? 'Servicio' : 'Producto'}</Chip>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input className={`${inputCls} mt-1.5`} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder={form.kind === 'Service' ? 'Ej. Tutorías de guitarra' : 'Nombre del producto'} />
                </div>
                <div>
                  <label className={labelCls}>Categoría</label>
                  <input className={`${inputCls} mt-1.5`} value={form.category} onChange={(e) => set({ category: e.target.value })} placeholder={form.kind === 'Service' ? 'Educación, Diseño, Asesoría…' : 'Arte, Música, Textil…'} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>{form.kind === 'Service' ? 'Precio desde (USD)' : 'Precio (USD)'}</label>
                  <input type="number" min="0" step="0.01" className={`${inputCls} mt-1.5`} value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="0 = a convenir" />
                  {/* Rango solo en servicios: su costo depende del alcance del trabajo,
                      y pedir un precio único obliga a inventarse una cifra. */}
                  {form.kind === 'Service' && (
                    <>
                      <label className={`${labelCls} mt-3 block`}>Precio hasta (opcional)</label>
                      <input
                        type="number" min="0" step="0.01"
                        className={`${inputCls} mt-1.5`}
                        value={form.priceMax}
                        onChange={(e) => set({ priceMax: e.target.value })}
                        placeholder="Vacío = precio fijo"
                      />
                    </>
                  )}
                </div>
                <div>
                  <label className={labelCls}>{form.kind === 'Service' ? 'Modalidad / lugar' : 'Lugar de entrega'}</label>
                  <input className={`${inputCls} mt-1.5`} value={form.deliveryLocation} onChange={(e) => set({ deliveryLocation: e.target.value })} placeholder={form.kind === 'Service' ? 'En línea, David, a domicilio…' : 'David, Boquete…'} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={3} className={`${inputCls} mt-1.5 resize-none`} value={form.description} onChange={(e) => set({ description: e.target.value })} placeholder="Detalles, materiales, medidas…" />
              </div>
              <div className="space-y-3">
                {form.images.map((url, i) => (
                  <ImageUpload key={i} value={url} onChange={(u) => setImageAt(i, u)} folder="productos" label={`Imagen ${i + 1}`} />
                ))}
                {form.images.length < 5 && (
                  <ImageUpload key={`new-${form.images.length}`} value="" onChange={(u) => u && set({ images: [...form.images, u] })} folder="productos" label="Añadir imagen (hasta 5)" />
                )}
                {editId && (
                  <p className="font-mono text-[0.65rem] text-tea/40">Las que quites se borran del almacenamiento al guardar.</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Btn onClick={guardar} disabled={saving}>{saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Publicar'}</Btn>
            </div>
          </Card>
        </Reveal>
      )}

      {loading && <p className="text-tea/50">Cargando productos…</p>}
      {error && <p className="text-candy">No se pudieron cargar tus productos.</p>}
      {!loading && !error && activo && mios.length === 0 && (
        <Card><p className="text-sm text-tea/55">Aún no has publicado productos. Usa «+ Nuevo producto».</p></Card>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mios.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 90}>
            <Card className="overflow-hidden p-0">
              <div className="relative flex aspect-[4/3] items-end justify-between overflow-hidden p-4" style={p.coverImage ? undefined : { background: 'linear-gradient(150deg,#00735e,#002420)' }}>
                {p.coverImage && <img src={p.coverImage} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />}
                {/* Velo inferior: sostiene el precio y las pills cuando la foto es clara. */}
                {p.coverImage && <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-jungle-deep/85 to-transparent" />}
                <span className="relative flex items-center gap-1.5">
                  <Chip tone="foto">{p.category}</Chip>
                  {p.kind === 'Service' && <Chip tone="fotoAcento">Servicio</Chip>}
                </span>
                <span className="relative font-display text-xl font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,17,14,0.8)]">{precioTexto(p)}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-base font-semibold uppercase leading-tight tracking-wide text-cream">{p.name}</h3>
                  <Chip tone={estadoTono[p.status]}>{estadoLabel[p.status] ?? p.status}</Chip>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 border-t border-tea/8 pt-3 text-xs font-semibold uppercase tracking-wide">
                  <Link to={`/marketplace/${p.id}`} target="_blank" className="text-caribbean/80 hover:text-caribbean">Ver</Link>
                  <button onClick={() => editar(p.id)} className="text-caribbean/80 hover:text-caribbean">Editar</button>
                  {/* Compartir desde aquí: es donde publicas, y es justo cuando
                      quieres difundirlo. Solo si está visible al público. */}
                  {p.status === 'Published' && (
                    <CompartirBoton tipo="producto" id={p.id} titulo={p.name} variant="panel" />
                  )}
                  {p.status === 'Published'
                    ? <button onClick={() => cambiarEstado(p.id, 'Hide')} className="text-caribbean/80 hover:text-caribbean">Ocultar</button>
                    : p.status === 'Hidden' && <button onClick={() => cambiarEstado(p.id, 'Show')} className="text-caribbean/80 hover:text-caribbean">Mostrar</button>}
                  {/* Un servicio no se agota: si no hay agenda, se oculta. */}
                  {p.kind !== 'Service' && p.status !== 'Sold' && (
                    <button onClick={() => cambiarEstado(p.id, 'Sold')} className="text-caribbean/80 hover:text-caribbean">Vendido</button>
                  )}
                  <button onClick={() => cambiarEstado(p.id, 'Delete')} className="text-candy hover:underline">Eliminar</button>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </>
  )
}
