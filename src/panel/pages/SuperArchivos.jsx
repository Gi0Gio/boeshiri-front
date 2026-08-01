import { useState } from 'react'
import { PageHeader, Card, Chip, Reveal, PillTabs, Table, Th, Td, Tr } from '../ui'
import { storageApi } from '../../api/storage'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const CARPETAS = [
  { id: '', label: 'Todo' },
  { id: 'avatars/', label: 'Avatares' },
  { id: 'publicaciones/', label: 'Publicaciones' },
  { id: 'documentos/', label: 'Documentos' },
  { id: 'productos/', label: 'Productos' },
  { id: 'misc/', label: 'Otros' },
]

const IMG_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i
const fmtSize = (b) => {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

export default function SuperArchivos() {
  const [carpeta, setCarpeta] = useState('')
  const [version, setVersion] = useState(0)
  const { data, loading, error } = useFetch(() => storageApi.list(carpeta), [carpeta, version])
  const reload = () => setVersion((v) => v + 1)
  const toast = useToast()
  const confirm = useConfirm()
  const setMsg = (m) => { if (m) m.ok ? toast.success(m.text) : toast.error(m.text) }

  const enabled = data?.enabled
  const objetos = data?.objects ?? []
  const total = objetos.reduce((s, o) => s + (o.size || 0), 0)

  async function eliminar(o) {
    if (!(await confirm({ title: '¿Eliminar de Cloudflare?', message: `Se borrará "${o.key}" de forma permanente.`, danger: true, confirmLabel: 'Eliminar' }))) return
    setMsg(null)
    try {
      await storageApi.remove(o.key)
      setMsg({ ok: true, text: 'Archivo eliminado del bucket.' })
      reload()
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'No se pudo eliminar.' })
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Gestor de archivos"
        description="Objetos almacenados en Cloudflare R2. Eliminar aquí borra el archivo del bucket de forma permanente."
        actions={objetos.length > 0 && <Chip tone="tea">{objetos.length} archivos · {fmtSize(total)}</Chip>}
      />


      <PillTabs tabs={CARPETAS} active={carpeta} onChange={setCarpeta} />

      {!loading && !error && enabled === false && (
        <Card><p className="text-sm text-tea/60">El almacenamiento (R2) todavía no está configurado. Cuando se añadan las llaves, aquí verás y podrás gestionar los archivos.</p></Card>
      )}

      {loading && <p className="text-tea/50">Cargando archivos…</p>}
      {error && <p className="text-candy">No se pudieron cargar los archivos.</p>}

      {!loading && !error && enabled && objetos.length === 0 && (
        <Card><p className="text-sm text-tea/55">No hay archivos en esta carpeta.</p></Card>
      )}

      {!loading && !error && objetos.length > 0 && (
        <Reveal>
          <Table minW="680px">
            <thead>
              <Tr className="hover:bg-transparent">
                <Th>Archivo</Th><Th className="hidden sm:table-cell">Key</Th><Th className="hidden md:table-cell">Tamaño</Th><Th className="hidden lg:table-cell">Modificado</Th><Th> </Th>
              </Tr>
            </thead>
            <tbody>
              {objetos.map((o) => (
                <Tr key={o.key}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-none overflow-hidden rounded-lg border border-tea/10 bg-jungle-deep/60">
                        {IMG_EXT.test(o.key)
                          ? <img src={o.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                          : <span className="flex h-full w-full items-center justify-center text-tea/30">📄</span>}
                      </div>
                      <a href={o.url} target="_blank" rel="noopener noreferrer" className="truncate font-mono text-xs text-caribbean/80 hover:text-caribbean">{o.key.split('/').pop()}</a>
                    </div>
                  </Td>
                  <Td className="hidden sm:table-cell font-mono text-[0.7rem] text-tea/40">{o.key}</Td>
                  <Td className="hidden md:table-cell font-mono text-xs text-tea/50">{fmtSize(o.size)}</Td>
                  <Td className="hidden lg:table-cell font-mono text-xs text-tea/40">{o.lastModified ? new Date(o.lastModified).toLocaleDateString('es-PA') : '—'}</Td>
                  <Td className="text-right">
                    <button onClick={() => eliminar(o)} className="text-xs font-semibold uppercase tracking-wide text-candy hover:underline">Eliminar</button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Reveal>
      )}
    </>
  )
}
