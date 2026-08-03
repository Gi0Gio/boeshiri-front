import { apiFetch } from './client'

/** Avisos in-app del usuario (RF-PUB-16, RF-TRA-02). Requiere sesión. */
export const notificationsApi = {
  list: () => apiFetch('/notificaciones'),
  unreadCount: () => apiFetch('/notificaciones/no-leidas'),
  markRead: (id) => apiFetch(`/notificaciones/${id}/leer`, { method: 'POST' }),
  markAllRead: () => apiFetch('/notificaciones/leer-todas', { method: 'POST' }),
}
