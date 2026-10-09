import { useRef, useState } from 'react'
import { uploadFile } from '../../api/uploads'
import { compressImage } from '../../utils/image'
import Ico from '../Ico'

/**
 * Fotos de una publicación: se eligen varias a la vez o se sueltan encima, se
 * comprimen a WebP y suben en orden. La primera es la portada (la que sale en el
 * Mural); las flechas cambian el orden. Antes eran tres campos sueltos, uno por
 * imagen, sin manera de elegir cuál iba de portada.
 */
export default function FotosPublicacion({ value, onChange, max, requerida, etiqueta }) {
  const inputRef = useRef(null)
  const [subiendo, setSubiendo] = useState(0)
  const [error, setError] = useState(null)
  const [encima, setEncima] = useState(false)
  const caben = max - value.length

  async function subir(files) {
    const lista = [...files].filter((f) => f.type.startsWith('image/'))
    if (lista.length === 0) return
    const tomadas = lista.slice(0, caben)
    setError(lista.length > caben ? `Caben ${max} ${max === 1 ? 'foto' : 'fotos'}: se subieron las primeras.` : null)
    setSubiendo(tomadas.length)
    let urls = [...value]
    for (const f of tomadas) {
      try {
        const url = await uploadFile(await compressImage(f, { maxDim: 1600 }), 'publicaciones')
        urls = [...urls, url]
        onChange(urls)
      } catch (e) {
        setError(e.message || 'No se pudo subir una de las fotos.')
      }
      setSubiendo((n) => n - 1)
    }
  }

  const mover = (i, d) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const copia = [...value]
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
    onChange(copia)
  }

  return (
    <div>
      <p className="text-sm font-semibold text-cream">
        {etiqueta}
        <span className="ml-2 font-mono text-xs font-normal text-tea/70">{value.length}/{max}</span>
      </p>

      {value.length > 0 && (
        <ul className="mt-2 grid grid-cols-3 gap-2.5">
          {value.map((url, i) => (
            <li key={url} className="group relative aspect-square overflow-hidden rounded-2xl border border-tea/10 bg-jungle-deep">
              <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && max > 1 && (
                <span className="absolute left-2 top-2 rounded-full bg-jungle-deep/85 px-2 py-0.5 text-xs font-semibold text-cream backdrop-blur">Portada</span>
              )}
              <span className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
                {value.length > 1 && (
                  <span className="flex gap-1">
                    <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Mover la foto ${i + 1} antes`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-jungle-deep/80 text-cream backdrop-blur transition hover:bg-jungle-deep disabled:opacity-0">
                      <Ico name="atras" className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => mover(i, 1)} disabled={i === value.length - 1} aria-label={`Mover la foto ${i + 1} después`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-jungle-deep/80 text-cream backdrop-blur transition hover:bg-jungle-deep disabled:opacity-0">
                      <Ico name="ir" className="h-4 w-4" />
                    </button>
                  </span>
                )}
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Quitar la foto ${i + 1}`}
                  className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-jungle-deep/80 text-cream backdrop-blur transition hover:bg-candy">
                  <Ico name="cerrar" className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
          {Array.from({ length: subiendo }, (_, i) => (
            <li key={`subiendo-${i}`} className="grid aspect-square animate-pulse place-items-center rounded-2xl border border-tea/10 bg-tea/5 text-xs text-tea/70">Subiendo…</li>
          ))}
        </ul>
      )}

      {caben > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setEncima(true) }}
          onDragLeave={() => setEncima(false)}
          onDrop={(e) => { e.preventDefault(); setEncima(false); subir(e.dataTransfer.files) }}
          disabled={subiendo > 0}
          className={`mt-2 flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 text-center transition ${value.length === 0 ? 'min-h-36' : 'min-h-20'} ${encima ? 'border-caribbean bg-caribbean/10' : 'border-tea/20 hover:border-caribbean/60 hover:bg-tea/5'} disabled:opacity-60`}
        >
          <Ico name="imagen" className="h-6 w-6 text-caribbean" />
          <span className="text-sm font-semibold text-cream">
            {value.length === 0 ? (max === 1 ? 'Elige una foto o suéltala aquí' : 'Elige fotos o suéltalas aquí') : 'Añadir otra'}
          </span>
          <span className="text-xs text-tea/70">
            {max > 1 ? `Hasta ${max}; la primera es la portada.` : 'Sale de portada en el Mural.'} JPG, PNG o WebP, máx. 5 MB.
          </span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple={max > 1} className="hidden"
        onChange={(e) => { subir(e.target.files); e.target.value = '' }} />

      {error && <p className="mt-2 text-sm text-candy">{error}</p>}
      {requerida && value.length === 0 && subiendo === 0 && (
        <p className="mt-2 text-sm text-terracotta">Una publicación de fotos necesita al menos una.</p>
      )}
    </div>
  )
}
