import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'
import { setToken, getToken } from '../api/client'

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

  // Hidratar la sesión al cargar si hay token guardado.
  useEffect(() => {
    let active = true
    ;(async () => {
      if (getToken()) {
        try {
          const me = await authApi.me()
          if (active) setUser(me)
        } catch (err) {
          // Solo un rechazo de credenciales invalida la sesión. Ante un fallo de
          // red (status 0) o un 5xx transitorio se conserva el token: borrarlo
          // expulsaría al usuario por un problema ajeno a su sesión.
          if (err.status === 401 || err.status === 403) setToken(null)
        }
      }
      if (active) setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    setToken(res.token)
    const me = await authApi.me()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
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
