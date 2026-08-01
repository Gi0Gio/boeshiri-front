import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Reveal, PillTabs } from '../ui'
import { publicationsApi } from '../../api/publications'
import { marketplaceApi } from '../../api/marketplace'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const TIPO_PUB = { News: 'Noticia', Article: 'Artículo', Photo: 'Foto', Video: 'Video', Music: 'Música' }
const estadoPubTono = { Published: 'caribbean', Hidden: 'terracotta' }
const estadoProdTono = { Published: 'caribbean', Hidden: 'terracotta', Sold: 'gris' }
const estadoProdLabel = { Published: 'Publicado', Hidden: 'Oculto', Sold: 'Vendido' }

export default function AdminModeracion() {
  const { hasPermission } = useSession()
  const puedePub = hasPermission('publicaciones.moderar')
  const puedeProd = hasPermission('productos.moderar')

  const [tab, setTab] = useState('publicaciones')
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  const { data: pubs, loading: lp, error: ep } = useFetch(() => (puedePub ? publicationsApi.moderationList() : Promise.resolve([])), [version, puedePub])
  const { data: prods, loading: lpr, error: epr } = useFetch(() => (puedeProd ? marketplaceApi.moderationList() : Promise.resolve([])), [version, puedeProd])

  async function moderarPub(id, action) {
    if (action === 'Delete' && !(await confirm({ message: '¿Eliminar esta publicación? El autor dejará de verla.', danger: true, confirmLabel: 'Eliminar' }))) return
    try { await publicationsApi.changeStatus(id, action); setMsg({ ok: true, text: 'Publicación actualizada.' }); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo moderar.' }) }
  }
  async function moderarProd(id, action) {
    if (action === 'Delete' && !(await confirm({ message: '¿Eliminar este producto?', danger: true, confirmLabel: 'Eliminar' }))) return
    try { await marketplaceApi.changeStatus(id, action); setMsg({ ok: true, text: 'Producto actualizado.' }); reload() }
    catch (e) { setMsg({ ok: false, text: e.message || 'No se pudo moderar.' }) }
  }

  const listaPubs = pubs ?? []
  const listaProds = prods ?? []

  return (
    <>
      <PageHeader eyebrow="Administración" title="Moderación" description="Los miembros publican sin aprobación previa. La Junta y el Super Admin pueden ocultar o eliminar lo que no cumpla los lineamientos." />


      <PillTabs
        tabs={[
          { id: 'publicaciones', label: 'Publicaciones', badge: listaPubs.length || undefined },
          { id: 'productos', label: 'Marketplace', badge: listaProds.length || undefined },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'publicaciones' ? (
        !puedePub ? <Card><p className="text-sm text-tea/60">No tienes permiso para moderar publicaciones.</p></Card>
        : lp ? <p className="text-tea/50">Cargando…</p>
        : ep ? <p className="text-candy">No se pudo cargar la cola.</p>
        : listaPubs.length === 0 ? <Card><p className="text-sm text-tea/55">No hay publicaciones para moderar.</p></Card>
        : (
          <div className="space-y-4">
            {listaPubs.map((c, i) => (
              <Reveal key={c.id} delay={(i % 4) * 60}>
                <Card className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone="tea">{TIPO_PUB[c.type] ?? c.type}</Chip>
                      <Chip tone={estadoPubTono[c.status] ?? 'gris'}>{c.status === 'Published' ? 'Visible' : 'Oculta'}</Chip>
                      {c.visibility === 'Members' && <Chip tone="terracotta">Solo miembros</Chip>}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold uppercase tracking-wide text-cream">{c.title}</h3>
                    <p className="font-mono text-xs text-tea/45">por {c.authorName}</p>
                  </div>
                  <div className="flex gap-3 text-xs font-semibold uppercase tracking-wide">
                    <Link to={`/publicaciones/${c.id}`} target="_blank" className="text-caribbean/80 hover:text-caribbean">Ver</Link>
                    {c.status === 'Published'
                      ? <button onClick={() => moderarPub(c.id, 'Hide')} className="text-caribbean/80 hover:text-caribbean">Ocultar</button>
                      : <button onClick={() => moderarPub(c.id, 'Show')} className="text-caribbean/80 hover:text-caribbean">Mostrar</button>}
                    <button onClick={() => moderarPub(c.id, 'Delete')} className="text-candy hover:underline">Eliminar</button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )
      ) : (
        !puedeProd ? <Card><p className="text-sm text-tea/60">No tienes permiso para moderar el marketplace.</p></Card>
        : lpr ? <p className="text-tea/50">Cargando…</p>
        : epr ? <p className="text-candy">No se pudo cargar la cola.</p>
        : listaProds.length === 0 ? <Card><p className="text-sm text-tea/55">No hay productos para moderar.</p></Card>
        : (
          <div className="space-y-4">
            {listaProds.map((c, i) => (
              <Reveal key={c.id} delay={(i % 4) * 60}>
                <Card className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone="tea">{c.category}</Chip>
                      {c.kind === 'Service' && <Chip tone="rainforest">Servicio</Chip>}
                      <Chip tone={estadoProdTono[c.status] ?? 'gris'}>{estadoProdLabel[c.status] ?? c.status}</Chip>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold uppercase tracking-wide text-cream">{c.name} <span className="text-rainforest">· {c.price > 0 ? `$${c.price}` : 'A convenir'}</span></h3>
                    <p className="font-mono text-xs text-tea/45">por {c.sellerName}</p>
                  </div>
                  <div className="flex gap-3 text-xs font-semibold uppercase tracking-wide">
                    <Link to={`/marketplace/${c.id}`} target="_blank" className="text-caribbean/80 hover:text-caribbean">Ver</Link>
                    {c.status === 'Published'
                      ? <button onClick={() => moderarProd(c.id, 'Hide')} className="text-caribbean/80 hover:text-caribbean">Ocultar</button>
                      : c.status === 'Hidden' && <button onClick={() => moderarProd(c.id, 'Show')} className="text-caribbean/80 hover:text-caribbean">Mostrar</button>}
                    <button onClick={() => moderarProd(c.id, 'Delete')} className="text-candy hover:underline">Eliminar</button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )
      )}

      <p className="mt-4 text-xs text-tea/45">Un enlace a contenido oculto/eliminado muestra un mensaje genérico, sin exponer detalles internos.</p>
    </>
  )
}
