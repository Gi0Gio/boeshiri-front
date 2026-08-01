import { apiFetch } from './client'

/**
 * Publicaciones (§6). Lectura pública; con sesión se incluyen las exclusivas
 * para miembros. Crear/editar/moderar requiere permisos.
 */
export const publicationsApi = {
  // auth:true adjunta el token si existe (para ver las exclusivas); anónimo funciona igual.
  list: (tipo) => apiFetch(`/publicaciones${tipo ? `?tipo=${tipo}` : ''}`),
  get: (id) => apiFetch(`/publicaciones/${id}`),
  mine: () => apiFetch('/publicaciones/mias'),
  moderationList: () => apiFetch('/publicaciones/moderacion'),
  create: (data) => apiFetch('/publicaciones', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/publicaciones/${id}`, { method: 'PUT', body: data }),
  changeStatus: (id, action) => apiFetch(`/publicaciones/${id}/estado`, { method: 'PATCH', body: { action } }),
}
