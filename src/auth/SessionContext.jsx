import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'
import { esperarSesion, onSesionPerdida } from '../api/client'

/**
 * Sesión real respaldada por la API (JWT + permisos efectivos). La autorización
 * usa `hasPermission`; qué página abre cada permiso está en panel/acceso.js.
 */
const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Recuperar la sesión al cargar con la cookie de renovación. Un fallo de red o
  // un 5xx deja la pantalla sin sesión, pero no la cierra: al recargar se reintenta.
  useEffect(() => {
    let active = true
    const dejarDeOir = onSesionPerdida(() => setUser(null))
    ;(async () => {
      try {
        if (await esperarSesion()) {
          const me = await authApi.me()
          if (active) setUser(me)
        }
      } catch { /* sin conexión: se queda como visitante */ }
      if (active) setLoading(false)
    })()
    return () => {
      active = false
      dejarDeOir()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    await authApi.login({ email, password })
    const me = await authApi.me()
    setUser(me)
    return me
  }, [])

  /** Vuelve a pedir /auth/yo (tras un cambio de estado de la propia cuenta). */
  const recargar = useCallback(async () => {
    const me = await authApi.me()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    authApi.logout()
  }, [])

  const permisos = user?.permissions ?? []
  const hasPermission = useCallback(
    (key) => permisos.includes('*') || permisos.includes(key),
    [permisos],
  )

  return (
    <SessionContext.Provider value={{ user, permisos, hasPermission, login, logout, recargar, setUser, loading }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider')
  return ctx
}
