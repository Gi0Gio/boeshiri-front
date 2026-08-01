import { apiFetch } from './client'

/** Panel de transparencia (§10.7). Leer: miembros; gestionar: transparencia.gestionar. */
export const transparencyApi = {
  list: (incluirOcultos) => apiFetch(`/transparencia${incluirOcultos ? '?incluirOcultos=true' : ''}`),
  get: (id) => apiFetch(`/transparencia/${id}`),
  create: (data) => apiFetch('/transparencia', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/transparencia/${id}`, { method: 'PUT', body: data }),
  changeStatus: (id, action) => apiFetch(`/transparencia/${id}/estado`, { method: 'PATCH', body: { action } }),
}
