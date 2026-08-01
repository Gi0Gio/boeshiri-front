import { apiFetch } from './client'

/** Biblioteca de documentos (§8). Solo miembros; admin gated por permiso. */
export const documentsApi = {
  list: (biblioteca, categoria) => {
    const q = new URLSearchParams()
    if (biblioteca) q.set('biblioteca', biblioteca)
    if (categoria) q.set('categoria', categoria)
    const s = q.toString()
    return apiFetch(`/documentos${s ? `?${s}` : ''}`)
  },
  get: (id) => apiFetch(`/documentos/${id}`),
  create: (data) => apiFetch('/documentos', { method: 'POST', body: data }),
  replace: (id, data) => apiFetch(`/documentos/${id}`, { method: 'PUT', body: data }),
  remove: (id) => apiFetch(`/documentos/${id}`, { method: 'DELETE' }),
}
