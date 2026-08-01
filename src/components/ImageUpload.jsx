import { useRef, useState } from 'react'
import { uploadFile } from '../api/uploads'
import { compressImage } from '../utils/image'

/**
 * Campo de imagen reutilizable (panel): muestra vista previa, sube al API con
 * compresión previa a WebP, y permite pegar una URL manual como alternativa.
 * Controlado: `value` es la URL actual; `onChange(url)` la actualiza.
 */
export default function ImageUpload({ value, onChange, folder = 'misc', label = 'Imagen', shape = 'rounded-2xl', className = '' }) {
  const inputRef = useRef(null)
  const [estado, setEstado] = useState(null) // null | 'subiendo' | error string

  async function elegir(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setEstado('subiendo')
    try {
      const optimizada = await compressImage(file, { maxDim: folder === 'avatars' ? 800 : 1600 })
      const url = await uploadFile(optimizada, folder)
      onChange(url)
      setEstado(null)
    } catch (err) {
      setEstado(err.message || 'No se pudo subir la imagen.')
    }
  }

  return (
    <div className={className}>
      <label className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-caribbean">{label}</label>
      <div className="mt-1.5 flex items-start gap-4">
        <div className={`h-20 w-20 flex-none overflow-hidden border border-tea/15 bg-jungle-deep/60 ${shape}`}>
          {value
            ? <img src={value} alt="" className="h-full w-full object-cover" />
            : <span className="flex h-full w-full items-center justify-center text-tea/25">🖼️</span>}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={estado === 'subiendo'}
              className="rounded-full bg-caribbean px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-jungle transition hover:bg-caribbean/80 disabled:opacity-50">
              {estado === 'subiendo' ? 'Subiendo…' : value ? 'Cambiar' : 'Subir imagen'}
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')} className="rounded-full border border-tea/20 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-tea/70 transition hover:border-candy hover:text-candy">
                Quitar
              </button>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={elegir} />
          <input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…o pega una URL de imagen"
            className="mt-2 w-full rounded-lg border border-tea/12 bg-jungle-deep/40 px-3 py-1.5 font-mono text-[0.7rem] text-tea/70 placeholder:text-tea/30 focus:border-caribbean focus:outline-none"
          />
          <p className="mt-1 font-mono text-[0.62rem] text-tea/40">Se optimiza a WebP automáticamente antes de subir.</p>
          {estado && estado !== 'subiendo' && <p className="mt-1 text-xs text-candy">{estado}</p>}
        </div>
      </div>
    </div>
  )
}
