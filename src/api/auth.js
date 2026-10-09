import { apiFetch, iniciarSesion, cerrarSesion, cambiarContrasena } from './client'

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
  // Con sesión: cierra las demás y deja la cookie nueva en este navegador.
  changePassword: (currentPassword, newPassword) => cambiarContrasena({ currentPassword, newPassword }),
  // Misma respuesta exista o no la cuenta.
  forgotPassword: (email) => apiFetch('/auth/recuperar', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (token, newPassword) =>
    apiFetch('/auth/restablecer', { method: 'POST', body: { token, newPassword }, auth: false }),
  // Postulación rechazada: vuelve a revisión pasados 30 días.
  reapply: () => apiFetch('/auth/postular-de-nuevo', { method: 'POST' }),
}
