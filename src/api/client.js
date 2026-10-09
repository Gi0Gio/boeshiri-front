/**
 * Cliente HTTP mínimo para la API de Boesh Irí.
 * Base URL desde VITE_API_URL; adjunta el JWT y normaliza errores (problem+json).
 */
// El build de producción exige VITE_API_URL (ver vite.config.js), así que este
// respaldo solo actúa en `npm run dev`. La barra final se recorta porque las rutas
// ya empiezan por "/": pegar la URL con barra en el hosting daría "//auth/login".
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')

export const API_BASE = BASE

/**
 * Sesión.
 *
 * El JWT dura poco y vive solo en memoria: un script inyectado no encuentra nada
 * que robar en localStorage. Lo que mantiene la sesión entre visitas es una cookie
 * HttpOnly de renovación que pone la API. Los endpoints que la tocan (login,
 * renovar, salir) se llaman por el MISMO origen del sitio, a través del proxy de
 * Netlify (public/_redirects) o de Vite en local: si se llamaran a Railway, la
 * cookie sería de terceros y Safari la descartaría.
 *
 * La marca en localStorage solo dice "hubo sesión en este navegador". Evita que
 * cada visitante anónimo dispare una renovación condenada al 401.
 */
const MARCA_SESION = 'boeshiri-sesion'
let accessToken = null
let arranque = null // primer intento de recuperar la sesión al cargar
let renovacion = null // renovación en curso, compartida por quien la necesite
let generacion = 0 // sube al cerrar sesión: invalida renovaciones que ya iban en vuelo
const oyentesPerdida = new Set()

// Versiones anteriores guardaban el JWT en localStorage. Ya no se usa: se retira.
try { localStorage.removeItem('boeshiri-token') } catch { /* almacenamiento bloqueado */ }

function hayMarca() {
  try { return localStorage.getItem(MARCA_SESION) === '1' } catch { return false }
}

function marcar(activa) {
  try {
    if (activa) localStorage.setItem(MARCA_SESION, '1')
    else localStorage.removeItem(MARCA_SESION)
  } catch { /* almacenamiento bloqueado: solo se pierde el atajo */ }
}

export function getToken() {
  return accessToken
}

/** Avisa cuando la API da la sesión por terminada (cookie caducada o revocada). */
export function onSesionPerdida(fn) {
  oyentesPerdida.add(fn)
  return () => oyentesPerdida.delete(fn)
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
    429: 'Demasiados intentos seguidos. Espera un momento y vuelve a probar.',
  }[status] || (status >= 500 ? 'Ocurrió un error en el servidor. Inténtalo de nuevo.' : `Error ${status}`)
}

const errorDeRed = () => new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0, null)

/** Lee la respuesta como JSON o lanza ApiError con el mejor mensaje disponible. */
async function leer(res) {
  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { /* respuesta no-JSON */ }

  if (!res.ok) {
    // Validación → `detail` (resumen legible); AppException → `title`; si no, mapa por status.
    let message = data?.detail || data?.title || statusMessage(res.status)
    // En un 429 la API dice cuánto esperar: mejor un número que «un momento».
    const espera = Number(res.headers.get('Retry-After'))
    if (res.status === 429 && espera > 0) {
      const minutos = Math.ceil(espera / 60)
      message = `Demasiados intentos seguidos. Vuelve a probar en ${espera < 90 ? `${espera} segundos` : `${minutos} minutos`}.`
    }
    throw new ApiError(message, res.status, data)
  }
  return data
}

/** POST a un endpoint de sesión, por el mismo origen para que viaje la cookie. */
async function llamarSesion(path, body, token) {
  let res
  try {
    const headers = body !== undefined ? { 'Content-Type': 'application/json' } : {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    res = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw errorDeRed()
  }
  return leer(res)
}

/**
 * Pide un JWT nuevo con la cookie. Devuelve el resultado, o null si la sesión ya
 * no existe (401). Lanza ante fallos de red o del servidor, que no significan que
 * la sesión haya terminado.
 */
export function renovarSesion() {
  if (!renovacion) {
    const gen = generacion
    renovacion = llamarSesion('/auth/renovar')
      .then((data) => {
        if (gen !== generacion) return null
        accessToken = data.token
        return data
      })
      .catch((err) => {
        if (err.status !== 401) throw err
        accessToken = null
        marcar(false)
        oyentesPerdida.forEach((fn) => fn())
        return null
      })
      .finally(() => {
        renovacion = null
      })
  }
  return renovacion
}

/**
 * Espera a que se resuelva la sesión guardada antes de la primera petición. Sin
 * esto, las páginas que cargan datos al montar saldrían anónimas y no verían, por
 * ejemplo, las publicaciones exclusivas.
 */
export function esperarSesion() {
  if (!arranque) arranque = hayMarca() ? renovarSesion().catch(() => null) : Promise.resolve(null)
  return arranque
}

export async function iniciarSesion(credenciales) {
  const data = await llamarSesion('/auth/login', credenciales)
  accessToken = data.token
  arranque = Promise.resolve(data)
  marcar(true)
  return data
}

/**
 * Cambia la contraseña. La API cierra todas las sesiones y deja una cookie nueva
 * para este navegador, así que va por el mismo origen como el login.
 */
export async function cambiarContrasena(datos) {
  await esperarSesion()
  let data
  try {
    data = await llamarSesion('/auth/cambiar-contrasena', datos, accessToken)
  } catch (err) {
    if (err.status !== 401) throw err
    // El JWT caducó en medio: se renueva una vez y se repite.
    const renovada = await renovarSesion().catch(() => null)
    if (!renovada) throw err
    data = await llamarSesion('/auth/cambiar-contrasena', datos, accessToken)
  }
  generacion++ // las renovaciones en vuelo traen tokens ya revocados
  accessToken = data.token
  arranque = Promise.resolve(data)
  marcar(true)
  return data
}

export async function cerrarSesion() {
  generacion++
  accessToken = null
  arranque = Promise.resolve(null)
  marcar(false)
  // Si falla, la cookie queda en el navegador, pero sin marca no se usa y caduca sola.
  try { await llamarSesion('/auth/salir') } catch { /* sin conexión */ }
}

/**
 * fetch con el JWT adjunto. Si la API responde 401 porque el JWT caducó, renueva
 * una vez y repite la petición: el usuario no se entera.
 */
export async function fetchConSesion(url, init = {}, { auth = true } = {}) {
  if (auth) await esperarSesion()

  const enviar = async (token) => {
    const headers = { ...init.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`
    try {
      return await fetch(url, { ...init, headers })
    } catch {
      // Fallo de red / servidor caído (fetch lanza TypeError).
      throw errorDeRed()
    }
  }

  const enviado = auth ? accessToken : null
  let res = await enviar(enviado)

  if (res.status === 401 && enviado) {
    // Otra petición pudo renovar mientras esta iba en camino: entonces basta con reintentar.
    const vigente = accessToken !== enviado
      ? accessToken
      : (await renovarSesion().catch(() => null))?.token
    if (vigente) res = await enviar(vigente)
  }
  return res
}

export async function apiFetch(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const finalHeaders = { ...headers }
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json'

  const res = await fetchConSesion(`${BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }, { auth })

  return leer(res)
}
