import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Chip, Btn, Reveal, Table, Th, Td, Tr, inputCls } from '../ui'
import { storageApi, usoMeta } from '../../api/storage'
import { useFetch } from '../../hooks/useFetch'
import { useToast } from '../../components/Toast'
import { useConfirm } from '../../components/ConfirmDialog'

const fmtSize = (b) => {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}
const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })

/** Dónde vive la entidad dueña, para poder ir a verla antes de decidir. */
function rutaDueño(f) {
  switch (f.ownerType) {
    case 'Perfil': return `/perfil/${f.ownerId}`
    case 'Publicación': return `/publicaciones/${f.ownerId}`
    case 'Producto': return `/marketplace/${f.ownerId}`
    default: return null
  }
}

const FILTROS = [
  { id: 'seguros', label: 'Seguros de borrar' },
  { id: 'Trash', label: 'Papelera' },
  { id: 'Orphan', label: 'Huérfanos' },
  { id: 'InUse', label: 'En uso' },
  { id: '', label: 'Todos' },
]

export default function SuperArchivos() {
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data, loading, error } = useFetch(() => storageApi.list(), [version])
  const toast = useToast()
  const confirm = useConfirm()

  // Abre en lo seguro: es la limpieza habitual y evita tropezar con lo que no
  // se debe tocar.
  const [filtro, setFiltro] = useState('seguros')
  const [busqueda, setBusqueda] = useState('')
  const [busy, setBusy] = useState(null)

  const habilitado = data?.enabled
  const archivos = useMemo(() => data?.objects ?? [], [data])

  const papelera = archivos.filter((f) => f.usage === 'Trash')
  const pesoPapelera = papelera.reduce((s, f) => s + (f.size || 0), 0)

  const lista = archivos.filter((f) => {
    const q = busqueda.trim().toLowerCase()
    if (q && !`${f.key} ${f.ownerName ?? ''} ${f.ownerType ?? ''}`.toLowerCase().includes(q)) return false
    if (filtro === 'seguros') return usoMeta(f.usage).seguro
    if (filtro) return f.usage === filtro
    return true
  })

  async function borrar(f) {
    const meta = usoMeta(f.usage)
    if (!meta.seguro) {
      toast.error(`Está en uso por ${f.ownerType?.toLowerCase()} «${f.ownerName}». Elimina esa entidad primero.`)
      return
    }

    const ok = await confirm({
      title: '¿Borrar este archivo?',
      message: f.usage === 'Trash'
        ? `Pertenece a ${f.ownerType?.toLowerCase()} «${f.ownerName}», que ya está eliminada. Sale de Cloudflare R2 y no se puede recuperar.`
        : 'Ningún contenido lo referencia. Sale de Cloudflare R2 y no se puede recuperar.',
      danger: true,
      confirmLabel: 'Borrar',
    })
    if (!ok) return

    setBusy(f.key)
    try {
      await storageApi.remove(f.key)
      toast.success('Archivo borrado.')
      reload()
    } catch (e) {
      toast.error(e.message || 'No se pudo borrar.')
    } finally { setBusy(null) }
  }

  async function vaciarPapelera() {
    const ok = await confirm({
      title: '¿Vaciar la papelera?',
      message: `Se borrarán ${papelera.length} archivos (${fmtSize(pesoPapelera)}) de contenido ya eliminado. Las publicaciones y productos se conservan como registro; solo se van sus imágenes.`,
      danger: true,
      confirmLabel: 'Vaciar',
    })
    if (!ok) return

    setBusy('papelera')
    try {
      const r = await storageApi.emptyTrash()
      toast.success(r?.mensaje || 'Papelera vaciada.')
      reload()
    } catch (e) {
      toast.error(e.message || 'No se pudo vaciar.')
    } finally { setBusy(null) }
  }

  return (
    <>
      <PageHeader
        eyebrow="Sistema · Super Admin"
        title="Gestor de archivos"
        description="Todo lo que vive en Cloudflare R2, con lo que lo referencia. Solo se puede borrar lo que no rompe el sitio."
        actions={papelera.length > 0 && (
          <Btn tone="candy" onClick={vaciarPapelera} disabled={busy === 'papelera'}>
            {busy === 'papelera' ? 'Vaciando…' : `Vaciar papelera (${papelera.length})`}
          </Btn>
        )}
      />

      {!loading && !habilitado && (
        <Card className="mb-6"><p className="text-sm text-tea/60">El almacenamiento no está configurado. Faltan las credenciales de R2.</p></Card>
      )}

      {loading && <p className="text-tea/50">Cargando archivos…</p>}
      {error && <p className="text-candy">No se pudieron cargar los archivos.</p>}

      {!loading && !error && archivos.length === 0 && habilitado && (
        <Card><p className="text-sm text-tea/55">El bucket está vacío.</p></Card>
      )}

      {!loading && !error && archivos.length > 0 && (
        <>
          <div className="mb-4 rounded-2xl border border-tea/10 bg-jungle p-4">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre de archivo o por su dueño…"
              className={inputCls}
              autoComplete="off"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {FILTROS.map((f) => (
                <button
                  key={f.id || 'todos'}
                  type="button"
                  onClick={() => setFiltro(f.id)}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition ${filtro === f.id ? 'bg-caribbean text-jungle' : 'bg-tea/8 text-tea/55 hover:bg-tea/15 hover:text-tea'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="mt-3 font-mono text-xs text-tea/40">
              {lista.length} de {archivos.length} archivos
              {papelera.length > 0 && ` · papelera: ${papelera.length} (${fmtSize(pesoPapelera)})`}
            </p>
          </div>

          {lista.length === 0 ? (
            <Card><p className="text-sm text-tea/55">Nada coincide con el filtro. Si buscabas basura que limpiar, buena señal.</p></Card>
          ) : (
            <Reveal>
              <Table minW="820px">
                <thead>
                  <Tr className="hover:bg-transparent">
                    <Th>Archivo</Th><Th>Situación</Th><Th>Lo usa</Th>
                    <Th className="hidden lg:table-cell">Tamaño</Th><Th className="hidden lg:table-cell">Subido</Th><Th> </Th>
                  </Tr>
                </thead>
                <tbody>
                  {lista.map((f) => {
                    const meta = usoMeta(f.usage)
                    const ruta = rutaDueño(f)
                    return (
                      <Tr key={f.key}>
                        <Td>
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="break-all font-mono text-xs text-tea/80 hover:text-caribbean">
                            {f.key}
                          </a>
                        </Td>
                        <Td><Chip tone={meta.tone}>{meta.label}</Chip></Td>
                        <Td className="text-tea/60">
                          {f.ownerType ? (
                            <>
                              <span className="font-mono text-[0.65rem] uppercase tracking-wide text-tea/40">{f.ownerType}</span>
                              <span className="block truncate text-sm">
                                {ruta
                                  ? <Link to={ruta} target="_blank" className="hover:text-caribbean">{f.ownerName}</Link>
                                  : f.ownerName}
                              </span>
                            </>
                          ) : <span className="text-xs text-tea/35">Nada lo referencia</span>}
                        </Td>
                        <Td className="hidden lg:table-cell font-mono text-xs text-tea/40">{fmtSize(f.size)}</Td>
                        <Td className="hidden lg:table-cell font-mono text-xs text-tea/40">{fmtFecha(f.lastModified)}</Td>
                        <Td className="text-right">
                          {meta.seguro ? (
                            <button
                              onClick={() => borrar(f)}
                              disabled={busy === f.key}
                              className="text-xs font-semibold uppercase tracking-wide text-candy hover:underline disabled:opacity-40"
                            >
                              {busy === f.key ? '…' : 'Borrar'}
                            </button>
                          ) : (
                            <span className="font-mono text-[0.65rem] uppercase tracking-wide text-tea/25" title="Borrarlo dejaría un enlace roto en el sitio">
                              Protegido
                            </span>
                          )}
                        </Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </Table>
            </Reveal>
          )}

          <p className="mt-4 font-mono text-xs leading-relaxed text-tea/40">
            «En uso» no se borra desde aquí: primero elimina la publicación o el producto, y eso lo manda a la papelera.
            Ojo, ocultar contenido no protege su imagen — la URL de R2 es pública. Para material inapropiado hay que eliminarlo y vaciar la papelera.
          </p>
        </>
      )}
    </>
  )
}
