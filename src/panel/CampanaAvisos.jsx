import { useState, useEffect, useRef, useCallback } from 'react'
import { notificationsApi } from '../api/notifications'
import { useToast } from '../components/Toast'

/** Cada cuánto se recomprueba el contador mientras el panel está abierto. */
const INTERVALO_MS = 60_000

const fmtRelativo = (iso) => {
  const min = Math.round((Date.now() - new Date(iso)) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'ayer' : `hace ${d} días`
}

/**
 * Campana de avisos del panel (RF-TRA-02).
 *
 * Antes los avisos solo se veían entrando al Dashboard, así que nadie se
 * enteraba de que los tenía. El contador se refresca cada minuto: es una
 * petición mínima y sin ella la campana se queda congelada mientras trabajas.
 */
export default function CampanaAvisos() {
  const [abierta, setAbierta] = useState(false)
  const [sinLeer, setSinLeer] = useState(0)
  const [avisos, setAvisos] = useState([])
  const [cargando, setCargando] = useState(false)
  const toast = useToast()
  const caja = useRef(null)

  const refrescarContador = useCallback(async () => {
    try {
      const r = await notificationsApi.unreadCount()
      setSinLeer(r?.count ?? 0)
    } catch { /* sin sesión o red caída: la campana simplemente no se actualiza */ }
  }, [])

  useEffect(() => {
    refrescarContador()
    const t = setInterval(refrescarContador, INTERVALO_MS)
    return () => clearInterval(t)
  }, [refrescarContador])

  // Cerrar al pulsar fuera. Sin esto el panel se queda abierto tapando contenido.
  useEffect(() => {
    if (!abierta) return
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) setAbierta(false) }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [abierta])

  async function alternar() {
    const nuevo = !abierta
    setAbierta(nuevo)
    if (!nuevo) return

    // La lista se pide al abrir, no de fondo: solo el contador viaja periódicamente.
    setCargando(true)
    try {
      setAvisos(await notificationsApi.list())
    } catch (e) {
      toast.error(e.message || 'No se pudieron cargar los avisos.')
    } finally { setCargando(false) }
  }

  async function marcarUno(a) {
    if (a.read) return
    try {
      await notificationsApi.markRead(a.id)
      setAvisos((xs) => xs.map((x) => (x.id === a.id ? { ...x, read: true } : x)))
      setSinLeer((n) => Math.max(0, n - 1))
    } catch (e) {
      toast.error(e.message || 'No se pudo marcar como leído.')
    }
  }

  async function marcarTodas() {
    try {
      await notificationsApi.markAllRead()
      setAvisos((xs) => xs.map((x) => ({ ...x, read: true })))
      setSinLeer(0)
    } catch (e) {
      toast.error(e.message || 'No se pudieron marcar.')
    }
  }

  return (
    <div className="relative" ref={caja}>
      <button
        type="button"
        onClick={alternar}
        aria-label={sinLeer > 0 ? `Avisos: ${sinLeer} sin leer` : 'Avisos'}
        aria-expanded={abierta}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-tea/15 text-tea/70 transition hover:border-caribbean hover:text-caribbean"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {sinLeer > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-candy px-1 font-mono text-[0.6rem] font-bold text-white">
            {sinLeer > 9 ? '9+' : sinLeer}
          </span>
        )}
      </button>

      {abierta && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-tea/12 bg-jungle shadow-[0_16px_48px_rgba(0,17,14,0.6)]">
          <div className="flex items-center justify-between border-b border-tea/10 px-4 py-3">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-cream">Avisos</p>
            {sinLeer > 0 && (
              <button onClick={marcarTodas} className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-caribbean transition hover:underline">
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cargando && <p className="px-4 py-6 text-center text-sm text-tea/45">Cargando…</p>}
            {!cargando && avisos.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-tea/45">No tienes avisos.</p>
            )}
            {!cargando && avisos.map((a) => (
              <button
                key={a.id}
                onClick={() => marcarUno(a)}
                className={`flex w-full gap-3 border-b border-tea/5 px-4 py-3 text-left transition last:border-0 hover:bg-tea/5 ${a.read ? 'opacity-55' : ''}`}
              >
                <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${a.read ? 'bg-transparent' : 'bg-caribbean'}`} />
                <span className="min-w-0">
                  <span className="block text-sm leading-snug text-tea">{a.message}</span>
                  <span className="mt-0.5 block font-mono text-[0.65rem] text-tea/40">{fmtRelativo(a.createdAt)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
