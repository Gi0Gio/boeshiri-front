import { apiFetch } from './client'

/** Comisiones, equipos y membresías (§7). Requiere sesión. */
export const groupsApi = {
  commissions: () => apiFetch('/grupos/comisiones'),
  commission: (id) => apiFetch(`/grupos/comisiones/${id}`),
  mine: () => apiFetch('/grupos/mias'),
  requestJoin: (id) => apiFetch(`/grupos/comisiones/${id}/solicitar`, { method: 'POST' }),
  joinRequests: (id) => apiFetch(`/grupos/comisiones/${id}/solicitudes`),
  // decision: 'Accept' | 'Reject'
  decideJoin: (reqId, decision) => apiFetch(`/grupos/solicitudes/${reqId}/decidir`, { method: 'POST', body: { decision } }),
  createCommission: (data) => apiFetch('/grupos/comisiones', { method: 'POST', body: data }),
  createTeam: (id, data) => apiFetch(`/grupos/comisiones/${id}/equipos`, { method: 'POST', body: data }),
  assignCoordinator: (id, userId) => apiFetch(`/grupos/comisiones/${id}/coordinador`, { method: 'POST', body: { userId } }),
  // Coordinador, líder o Junta. Salir de una comisión saca también de sus equipos.
  removeMember: (groupId, userId) => apiFetch(`/grupos/${groupId}/integrantes/${userId}`, { method: 'DELETE' }),
  leave: (groupId) => apiFetch(`/grupos/${groupId}/salir`, { method: 'POST' }),
  addTeamMember: (teamId, userId) => apiFetch(`/grupos/equipos/${teamId}/integrantes`, { method: 'POST', body: { userId } }),
}
