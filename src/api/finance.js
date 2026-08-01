import { apiFetch } from './client'

/** Finanzas (§10.4). Ver exige finanzas.ver; editar exige finanzas.editar (Tesorero). */
export const financeApi = {
  summary: () => apiFetch('/finanzas'),
  createMovement: (data) => apiFetch('/finanzas/movimientos', { method: 'POST', body: data }),
  updateMovement: (id, data) => apiFetch(`/finanzas/movimientos/${id}`, { method: 'PUT', body: data }),
  deleteMovement: (id) => apiFetch(`/finanzas/movimientos/${id}`, { method: 'DELETE' }),
}
