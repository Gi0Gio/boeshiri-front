import { useState } from 'react'
import { useToast } from './Toast'

/**
 * Compartir una publicación o un anuncio (RF-MKT-05).
 *
 * El enlace se reparte con el dominio del sitio, aunque quien lo resuelve es la
 * API: `/compartir/*` está redirigido por proxy en _redirects. Hace falta porque
 * los robots de WhatsApp e Instagram no ejecutan JavaScript, así que de la SPA
 * solo obtendrían un index vacío; esa ruta les entrega el HTML con las etiquetas
 * og:* y a la persona la manda al sitio sin que note el rodeo.
 */
export default function CompartirBoton({ tipo, id, titulo, className = '' }) {
  const toast = useToast()
  const [abierto, setAbierto] = useState(false)

  // Origen del sitio, no el de la API: el proxy de _redirects lo resuelve.
  const enlace = `${window.location.origin}/compartir/${tipo}/${id}`
  const imagen = (formato) => `${enlace}/imagen.png${formato ? `?formato=${formato}` : ''}`

  async function compartir() {
    // La bandeja nativa es el mejor camino en móvil: lleva a WhatsApp, Instagram
    // y al resto sin que tengamos que integrar ninguna.
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url: enlace })
        return
      } catch {
        return // cancelado por la persona: no es un error
      }
    }
    setAbierto((v) => !v)
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace)
      toast.success('Enlace copiado.')
    } catch {
      toast.error(enlace)
    }
    setAbierto(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={compartir}
        className="inline-flex items-center gap-2 rounded-full border border-rainforest/30 px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.15em] text-rainforest transition hover:border-rainforest hover:bg-rainforest hover:text-cream"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        Compartir
      </button>

      {abierto && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-rainforest/20 bg-white p-3 shadow-[0_16px_40px_rgba(0,37,32,0.18)]">
          <button onClick={copiar} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-jungle transition hover:bg-tea/30">
            Copiar enlace
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${titulo} — ${enlace}`)}`}
            target="_blank" rel="noopener noreferrer"
            onClick={() => setAbierto(false)}
            className="block rounded-lg px-3 py-2 text-sm text-jungle transition hover:bg-tea/30"
          >
            Enviar por WhatsApp
          </a>

          <div className="mt-2 border-t border-rainforest/10 pt-2">
            <p className="px-3 pb-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-jungle/40">
              Descargar imagen
            </p>
            {/* Dos formatos porque son dos usos distintos: el cuadrado va en chats
                y grupos; el vertical, en historias. */}
            <a href={imagen()} download target="_blank" rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2 text-sm text-jungle transition hover:bg-tea/30">
              Cuadrada · para chats
            </a>
            <a href={imagen('historia')} download target="_blank" rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2 text-sm text-jungle transition hover:bg-tea/30">
              Vertical · para historias
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
