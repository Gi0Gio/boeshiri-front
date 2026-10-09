import { apiFetch } from './client'

/**
 * Gritos: llamados abiertos entre miembros («¿quién se apunta a la playa?»).
 * Todo exige sesión salvo `summary`, que solo devuelve un número: un grito lleva
 * lugar, hora y a veces cuota, y eso no debería ser rastreable desde fuera.
 */
export const gritosApi = {
  /** Vivos (abiertos y que no han pasado), del que ocurre primero al último. */
  list: () => apiFetch('/gritos'),

  /** Los propios, en cualquier estado, para gestionarlos. */
  mine: () => apiFetch('/gritos/mios'),

  get: (id) => apiFetch(`/gritos/${id}`),

  /**
   * Cuántos hay abiertos. Es lo único anónimo: alimenta las piezas veladas del
   * mural sin que salga ningún dato de un miembro.
   */
  summary: () => apiFetch('/gritos/resumen', { auth: false }),

  create: (data) => apiFetch('/gritos', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/gritos/${id}`, { method: 'PUT', body: data }),

  apuntarme: (id) => apiFetch(`/gritos/${id}/apuntarme`, { method: 'POST' }),
  salirme: (id) => apiFetch(`/gritos/${id}/apuntarme`, { method: 'DELETE' }),

  // action: 'Close' | 'Cancel' | 'Delete'
  changeStatus: (id, action) => apiFetch(`/gritos/${id}/estado`, { method: 'PATCH', body: { action } }),
}
