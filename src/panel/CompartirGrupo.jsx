import { useToast } from '../components/Toast'
import Ico from './Ico'

/**
 * Compartir el enlace de un grupo por WhatsApp, Instagram o lo que tenga el
 * teléfono. El enlace es la dirección del propio panel: quien lo abre sin sesión
 * pasa por el login y vuelve aquí (PanelLayout → /login?volver=…). La vista previa
 * es la genérica del sitio, así que el nombre del grupo no queda a la vista de
 * quien no es del colectivo.
 */
export default function CompartirGrupo({ nombre, ruta }) {
  const toast = useToast()
  const enlace = `${window.location.origin}${ruta}`

  async function compartir() {
    // La bandeja nativa es el mejor camino en el celular: lleva a WhatsApp e
    // Instagram sin integrar ninguno.
    if (navigator.share) {
      try {
        await navigator.share({ title: `${nombre} · Boesh Irí`, text: `${nombre} en el panel de Boesh Irí`, url: enlace })
      } catch { /* cancelado por la persona: no es un error */ }
      return
    }
    try {
      await navigator.clipboard.writeText(enlace)
      toast.success('Enlace copiado. Pégalo en WhatsApp o Instagram.')
    } catch {
      toast.error(`No se pudo copiar. El enlace es ${enlace}`)
    }
  }

  return (
    <button type="button" onClick={compartir}
      className="inline-flex min-h-11 flex-none items-center gap-1.5 rounded-full bg-white/60 px-4 text-sm font-semibold text-[var(--g-tinta)] transition hover:bg-white">
      <Ico name="compartir" className="h-4 w-4" />
      Compartir
    </button>
  )
}
