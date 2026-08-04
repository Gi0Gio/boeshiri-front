import { useState, useRef, useEffect } from 'react'

/**
 * Ayuda contextual: un «?» que explica para qué sirve una sección.
 *
 * Se abre por clic, no por hover: en un móvil no hay puntero y un tooltip que
 * solo responde a hover es un tooltip que la mitad de la gente nunca ve. En
 * escritorio el hover también lo muestra, que es lo que ahí se espera.
 */
export default function InfoTooltip({ children, label = 'Qué es esto', align = 'left' }) {
  const [abierto, setAbierto] = useState(false)
  const [hover, setHover] = useState(false)
  const caja = useRef(null)

  // Clic fuera y Escape lo cierran: si no, en móvil queda abierto tapando
  // contenido y sin manera evidente de quitarlo.
  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => { if (!caja.current?.contains(e.target)) setAbierto(false) }
    const esc = (e) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  const visible = abierto || hover

  return (
    <span ref={caja} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-expanded={visible}
        onClick={() => setAbierto((v) => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className={`flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[0.7rem] font-bold transition ${
          visible ? 'border-caribbean bg-caribbean text-jungle' : 'border-tea/30 text-tea/50 hover:border-caribbean hover:text-caribbean'
        }`}
      >
        ?
      </button>

      {visible && (
        <span
          role="tooltip"
          className={`absolute top-7 z-30 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-caribbean/25 bg-jungle-deep p-4 text-xs leading-relaxed text-tea/80 shadow-[0_18px_40px_rgba(0,17,14,0.55)] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </span>
      )}
    </span>
  )
}
