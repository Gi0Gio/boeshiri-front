import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'
import { esperarSesion, onSesionPerdida } from '../api/client'

/**
 * Sesión real respaldada por la API (JWT + permisos efectivos).
 * Se mantiene un `rol` DERIVADO (miembro/junta/superadmin) y `alcanza()` por
 * compatibilidad con el panel; la autorización fina usa `hasPermission`.
 */
const SessionContext = createContext(null)

export const NIVEL = { miembro: 1, junta: 2, superadmin: 3 }

export const ROLES = {
  miembro: { label: 'Miembro', desc: 'Perfil, publicaciones, grupos y marketplace.' },
  junta: { label: 'Junta Directiva', desc: 'Todo lo de miembro + administración.' },
  superadmin: { label: 'Super Administrador', desc: 'Control total: roles, permisos y auditoría.' },
}

/** Deriva un nivel de conveniencia a partir de los permisos efectivos. */
function deriveRol(permisos) {
  if (permisos.includes('*') || permisos.includes('roles.gestionar') || permisos.includes('auditoria.ver'))
    return 'superadmin'
  if (permisos.includes('panel_admin.ver')) return 'junta'
  return 'miembro'
}

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

  const logout = useCallback(() => {
    setUser(null)
    authApi.logout()
  }, [])

  const permisos = user?.permissions ?? []
  const hasPermission = useCallback(
    (key) => permisos.includes('*') || permisos.includes(key),
    [permisos],
  )
  const rol = user ? deriveRol(permisos) : null

  return (
    <SessionContext.Provider value={{ user, rol, permisos, hasPermission, login, logout, loading }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider')
  return ctx
}

/** ¿El rol derivado alcanza el nivel mínimo requerido? (compatibilidad panel) */
export function alcanza(rol, minimo) {
  return rol && NIVEL[rol] >= NIVEL[minimo]
}
