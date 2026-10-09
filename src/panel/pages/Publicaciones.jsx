import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader, Card, Chip, Btn, Reveal } from '../ui'
import { publicationsApi } from '../../api/publications'
import { useFetch } from '../../hooks/useFetch'
import { useSession } from '../../auth/SessionContext'
import CompartirBoton from '../../components/CompartirBoton'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'
import Ico from '../Ico'

const TIPO = { Article: 'Escrito', Photo: 'Fotos', Video: 'Video', Music: 'Música', News: 'Noticia' }
const label = (api) => TIPO[api] ?? api

export default function Publicaciones() {
  const { hasPermission } = useSession()
  const puedeCrear = hasPermission('publicaciones.crear')
  const navigate = useNavigate()

  const [version, setVersion] = useState(0)
  const { data, loading, error } = useFetch(() => publicationsApi.mine(), [version])
  const reload = () => setVersion((v) => v + 1)
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  async function cambiarEstado(id, action) {
    if (action === 'Delete' && !(await confirm({ message: '¿Eliminar esta publicación? No se puede deshacer.', danger: true, confirmLabel: 'Eliminar' }))) return
    try {
      await publicationsApi.changeStatus(id, action)
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo cambiar el estado.' })
    }
  }

  const pubs = (data ?? []).filter((p) => p.status !== 'Deleted')

  return (
    <>
      <PageHeader
        title="Mis publicaciones"
        description="Lo que has publicado en el Mural. Publicas sin aprobación previa; la Junta puede moderar."
        actions={puedeCrear && <Btn as={Link} to="/panel/publicar"><Ico name="mas" className="h-4 w-4" />Publicar</Btn>}
      />

      {!puedeCrear && (
        <Card className="mb-6"><p className="text-sm text-tea/70">Tu rol aún no tiene permiso para publicar. Pídeselo a la Junta.</p></Card>
      )}

      {loading && <p className="text-tea/70">Cargando publicaciones…</p>}
      {error && <p className="text-candy">No se pudieron cargar tus publicaciones.</p>}
      {!loading && !error && pubs.length === 0 && (
        <Card><p className="text-sm text-tea/70">Aún no has publicado nada. {puedeCrear && <Link to="/panel/publicar" className="font-semibold text-caribbean hover:underline">Publica lo primero</Link>}</p></Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {pubs.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 80}>
            <Card>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Chip tone="tea">{label(p.type)}</Chip>
                  {p.visibility === 'Members' && <Chip tone="terracotta">Solo miembros</Chip>}
                </div>
                <Chip tone={p.status === 'Published' ? 'caribbean' : 'gris'}>{p.status === 'Published' ? 'Pública' : 'Oculta'}</Chip>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold uppercase tracking-wide text-cream">{p.title}</h3>
              <p className="mt-2 font-mono text-xs text-tea/70">
                Creada {new Date(p.createdAt).toLocaleDateString('es-PA')}{p.editedAt && ` · editada ${new Date(p.editedAt).toLocaleDateString('es-PA')}`}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 border-t border-tea/10 pt-2 text-sm font-semibold">
                <Link to={`/publicaciones/${p.id}`} target="_blank" className="inline-flex min-h-11 items-center text-caribbean hover:underline">Ver</Link>
                <button onClick={() => navigate(`/panel/publicar/${p.id}`)} className="inline-flex min-h-11 items-center text-caribbean hover:underline">Editar</button>
                {/* Solo si está publicada: compartir un enlace oculto daría 404 a
                    quien lo abra. */}
                {p.status === 'Published' && (
                  <CompartirBoton tipo="publicacion" id={p.id} titulo={p.title} variant="panel" />
                )}
                {p.status === 'Published'
                  ? <button onClick={() => cambiarEstado(p.id, 'Hide')} className="inline-flex min-h-11 items-center text-caribbean hover:underline">Ocultar</button>
                  : <button onClick={() => cambiarEstado(p.id, 'Show')} className="inline-flex min-h-11 items-center text-caribbean hover:underline">Mostrar</button>}
                <button onClick={() => cambiarEstado(p.id, 'Delete')} className="inline-flex min-h-11 items-center text-candy hover:underline">Eliminar</button>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </>
  )
}
