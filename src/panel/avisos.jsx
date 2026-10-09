import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { notificationsApi } from '../api/notifications'

/** Cada cuánto se recomprueba el contador mientras el panel está abierto. */
const INTERVALO_MS = 60_000

const SinLeerContext = createContext({ sinLeer: 0, refrescar: () => {}, fijar: () => {} })

/**
 * Contador de avisos sin leer, compartido entre la pestaña «Avisos» (su
 * insignia) y la página de avisos (que lo baja al marcar). Antes había una
 * campana y una lista en el inicio que mostraban lo mismo por separado.
 */
export function SinLeerProvider({ children }) {
  const [sinLeer, fijar] = useState(0)

  const refrescar = useCallback(async () => {
    try {
      const r = await notificationsApi.unreadCount()
      fijar(r?.count ?? 0)
    } catch { /* sin red: el contador se queda como estaba */ }
  }, [])

  useEffect(() => {
    refrescar()
    const t = setInterval(refrescar, INTERVALO_MS)
    return () => clearInterval(t)
  }, [refrescar])

  return <SinLeerContext.Provider value={{ sinLeer, refrescar, fijar }}>{children}</SinLeerContext.Provider>
}

export const useSinLeer = () => useContext(SinLeerContext)

export function hace(iso) {
  const min = Math.round((Date.now() - new Date(iso)) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  if (d === 1) return 'ayer'
  if (d < 30) return `hace ${d} días`
  return new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })
}
