import { apiFetch } from './client'

/** Eventos (RF-PUB-10/11 público; RF-EVT-01/02 gestión). cuando: All|Upcoming|Past. */
export const eventsApi = {
  list: (cuando) => apiFetch(`/eventos${cuando ? `?cuando=${cuando}` : ''}`, { auth: false }),
  get: (id) => apiFetch(`/eventos/${id}`, { auth: false }),
  myHistory: () => apiFetch('/eventos/mi-historial'),

  // ── Gestión (permiso eventos.gestionar) ──
  listManage: (cuando) => apiFetch(`/eventos/gestion${cuando ? `?cuando=${cuando}` : ''}`),
  getManage: (id) => apiFetch(`/eventos/gestion/${id}`),
  create: (data) => apiFetch('/eventos', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/eventos/${id}`, { method: 'PUT', body: data }),
  changeStatus: (id, action) => apiFetch(`/eventos/${id}/estado`, { method: 'PATCH', body: { action } }),
  recordAttendance: (id, count, memberIds) => apiFetch(`/eventos/${id}/asistencia`, { method: 'POST', body: { count, memberIds } }),
}
