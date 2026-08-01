import { apiFetch } from './client'

/** Endpoints de autenticación (§4.6, §7). */
export const authApi = {
  register: (data) => apiFetch('/auth/registro', { method: 'POST', body: data, auth: false }),
  verify: (token) => apiFetch(`/auth/verificar?token=${encodeURIComponent(token)}`, { auth: false }),
  login: (data) => apiFetch('/auth/login', { method: 'POST', body: data, auth: false }),
  me: () => apiFetch('/auth/yo'),
}
