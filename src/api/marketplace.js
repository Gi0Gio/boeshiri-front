import { apiFetch } from './client'

/** Marketplace de productos de los miembros (§9). Catálogo público; gestión propia. */
export const marketplaceApi = {
  list: (nombre, categoria, vendedor) => {
    const q = new URLSearchParams()
    if (nombre) q.set('nombre', nombre)
    if (categoria && categoria !== 'Todo') q.set('categoria', categoria)
    if (vendedor) q.set('vendedor', vendedor)
    const s = q.toString()
    return apiFetch(`/marketplace${s ? `?${s}` : ''}`)
  },
  get: (id) => apiFetch(`/marketplace/${id}`),
  mine: () => apiFetch('/marketplace/mios'),
  moderationList: () => apiFetch('/marketplace/moderacion'),
  enroll: () => apiFetch('/marketplace/alta', { method: 'POST' }),
  create: (data) => apiFetch('/marketplace', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/marketplace/${id}`, { method: 'PUT', body: data }),
  changeStatus: (id, action) => apiFetch(`/marketplace/${id}/estado`, { method: 'PATCH', body: { action } }),
}
