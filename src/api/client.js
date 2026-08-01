/**
 * Cliente HTTP mínimo para la API de Boesh Irí.
 * Base URL desde VITE_API_URL; adjunta el JWT y normaliza errores (problem+json).
 */
// El build de producción exige VITE_API_URL (ver vite.config.js), así que este
// respaldo solo actúa en `npm run dev`. La barra final se recorta porque las rutas
// ya empiezan por "/": pegar la URL con barra en el hosting daría "//auth/login".
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')
const TOKEN_KEY = 'boeshiri-token'

export const API_BASE = BASE

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/** Mensaje en español a partir del código de estado (respaldo si no hay cuerpo). */
function statusMessage(status) {
  return {
    400: 'Solicitud inválida. Revisa los datos.',
    401: 'Necesitas iniciar sesión.',
    403: 'No tienes permiso para esta acción.',
    404: 'No se encontró el recurso.',
    409: 'Conflicto con el estado actual.',
    413: 'El archivo es demasiado grande.',
    429: 'Demasiadas solicitudes, espera un momento.',
  }[status] || (status >= 500 ? 'Ocurrió un error en el servidor. Inténtalo de nuevo.' : `Error ${status}`)
}

export async function apiFetch(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const finalHeaders = { ...headers }
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json'

  const token = getToken()
  if (auth && token) finalHeaders['Authorization'] = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // Fallo de red / servidor caído (fetch lanza TypeError).
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0, null)
  }

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { /* respuesta no-JSON */ }

  if (!res.ok) {
    // Validación → `detail` (resumen legible); AppException → `title`; si no, mapa por status.
    const message = data?.detail || data?.title || statusMessage(res.status)
    throw new ApiError(message, res.status, data)
  }
  return data
}
