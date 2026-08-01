import { apiFetch } from './client'

/** Postulantes (RF-PUB-15). Requiere permiso postulantes.decidir (Junta / RRHH). */
export const postulantesApi = {
  list: () => apiFetch('/admin/postulantes'),
  // decision: 'Aceptar' | 'Rechazar'
  decide: (id, decision, motivo) => apiFetch(`/admin/postulantes/${id}/decidir`, { method: 'POST', body: { decision, motivo: motivo || null } }),
}
