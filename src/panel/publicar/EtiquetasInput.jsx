import { useId, useMemo, useState } from 'react'
import Ico from '../Ico'

const clave = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
const MAX = 8

/**
 * Etiquetas como fichas. Al escribir sugiere las que ya usa el colectivo (sin
 * distinguir mayúsculas ni tildes), para que no convivan «poesia», «Poesía» y
 * «poesía». La primera acompaña al tipo en las tarjetas («Artículo · Poesía»), y
 * se dice ahí mismo en vez de esconderlo en una ayuda.
 */
export default function EtiquetasInput({ value, onChange, conocidas = [], tipoLabel }) {
  const [texto, setTexto] = useState('')
  const [activa, setActiva] = useState(0)
  const idLista = useId()

  const sugerencias = useMemo(() => {
    const k = clave(texto)
    if (!k) return []
    const puestas = new Set(value.map(clave))
    return conocidas.filter((t) => clave(t).startsWith(k) && !puestas.has(clave(t))).slice(0, 5)
  }, [texto, value, conocidas])

  function agregar(t) {
    const limpia = t.trim().replace(/,$/, '')
    if (!limpia || value.length >= MAX) return
    // Si ya existe en el colectivo, se usa su forma escrita: «poesia» → «Poesía».
    const existente = conocidas.find((c) => clave(c) === clave(limpia))
    const final = existente ?? limpia
    if (!value.some((v) => clave(v) === clave(final))) onChange([...value, final])
    setTexto('')
    setActiva(0)
  }

  function teclas(e) {
    if (e.key === 'ArrowDown' && sugerencias.length) { e.preventDefault(); setActiva((a) => (a + 1) % sugerencias.length) }
    else if (e.key === 'ArrowUp' && sugerencias.length) { e.preventDefault(); setActiva((a) => (a - 1 + sugerencias.length) % sugerencias.length) }
    else if (e.key === 'Enter' || e.key === ',') {
      if (!texto.trim()) return
      e.preventDefault()
      agregar(sugerencias[activa] ?? texto)
    } else if (e.key === 'Backspace' && !texto && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      <label htmlFor={`${idLista}-in`} className="text-sm font-semibold text-cream">
        Etiquetas <span className="font-normal text-tea/70">(opcional)</span>
      </label>
      <div className="relative mt-1.5">
        <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-tea/15 bg-jungle-deep/60 px-2 py-1.5 focus-within:border-caribbean focus-within:ring-2 focus-within:ring-caribbean/25">
          {value.map((t, i) => (
            <span key={t} className={`inline-flex h-8 items-center gap-1 rounded-full pl-3 pr-1 text-sm ${i === 0 ? 'bg-caribbean font-semibold text-jungle' : 'bg-tea/10 text-tea'}`}>
              {t}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Quitar la etiqueta ${t}`}
                className="grid h-7 w-7 place-items-center rounded-full opacity-75 hover:opacity-100">
                <Ico name="cerrar" className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {value.length < MAX && (
            <input
              id={`${idLista}-in`}
              value={texto}
              onChange={(e) => { setTexto(e.target.value); setActiva(0) }}
              onKeyDown={teclas}
              onBlur={() => texto.trim() && agregar(texto)}
              role="combobox"
              aria-expanded={sugerencias.length > 0}
              aria-controls={idLista}
              aria-activedescendant={sugerencias.length ? `${idLista}-${activa}` : undefined}
              placeholder={value.length ? 'Otra…' : 'poesía, mural, chiriquí…'}
              className="min-w-28 flex-1 bg-transparent px-1.5 py-1 text-sm text-cream outline-none placeholder:text-tea/40"
            />
          )}
        </div>
        {sugerencias.length > 0 && (
          <ul id={idLista} role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-tea/15 bg-jungle shadow-[0_12px_28px_-12px_rgba(0,17,14,0.5)]">
            {sugerencias.map((s, i) => (
              <li key={s} id={`${idLista}-${i}`} role="option" aria-selected={i === activa}
                onMouseDown={(e) => { e.preventDefault(); agregar(s) }}
                className={`flex min-h-11 cursor-pointer items-center px-4 text-sm ${i === activa ? 'bg-caribbean/12 font-semibold text-caribbean' : 'text-tea'}`}>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-1.5 text-xs text-tea/70">
        {value.length
          ? <>La primera sale junto al tipo: <strong className="font-semibold text-tea">«{tipoLabel} · {value[0]}»</strong>.</>
          : 'Enter o coma para añadir. La primera que pongas sale junto al tipo.'}
      </p>
    </div>
  )
}
