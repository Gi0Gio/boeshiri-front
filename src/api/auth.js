import { apiFetch, iniciarSesion, cerrarSesion } from './client'

/** Endpoints de autenticación (§4.6, §7). */
export const authApi = {
  register: (data) => apiFetch('/auth/registro', { method: 'POST', body: data, auth: false }),
  verify: (token) => apiFetch(`/auth/verificar?token=${encodeURIComponent(token)}`, { auth: false }),
  // Responde lo mismo exista o no la cuenta: no revela quién está registrado.
  resendVerification: (email) =>
    apiFetch('/auth/reenviar-verificacion', { method: 'POST', body: { email }, auth: false }),
  // Por el mismo origen (proxy): la respuesta deja la cookie de renovación.
  login: (data) => iniciarSesion(data),
  logout: () => cerrarSesion(),
  me: () => apiFetch('/auth/yo'),
}
