import { createContext, useContext, useState, useCallback } from 'react'

/**
 * Simulación de sesión para el prototipo (sin backend).
 * El rol se guarda en localStorage para que sobreviva a recargas.
 * Roles: 'miembro' | 'junta' | 'superadmin'  (null = visitante).
 */
const SessionContext = createContext(null)
const KEY = 'boeshiri-demo-rol'

export const NIVEL = { miembro: 1, junta: 2, superadmin: 3 }

export const ROLES = {
  miembro: { label: 'Miembro', desc: 'Perfil, publicaciones, grupos y marketplace.' },
  junta: { label: 'Junta Directiva', desc: 'Todo lo de miembro + administración.' },
  superadmin: { label: 'Super Administrador', desc: 'Control total: roles, permisos y auditoría.' },
}

export function SessionProvider({ children }) {
  const [rol, setRolState] = useState(() => localStorage.getItem(KEY) || null)

  const setRol = useCallback((r) => {
    setRolState(r)
    if (r) localStorage.setItem(KEY, r)
    else localStorage.removeItem(KEY)
  }, [])

  const logout = useCallback(() => setRol(null), [setRol])

  return (
    <SessionContext.Provider value={{ rol, setRol, logout }}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider')
  return ctx
}

/** ¿El rol activo alcanza el nivel mínimo requerido? */
export function alcanza(rol, minimo) {
  return rol && NIVEL[rol] >= NIVEL[minimo]
}
