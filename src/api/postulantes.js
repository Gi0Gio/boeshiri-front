import { apiFetch } from './client'

/** Postulantes (RF-PUB-15). Requiere permiso postulantes.decidir (Junta / RRHH). */
export const postulantesApi = {
  list: () => apiFetch('/admin/postulantes'),
  // decision: 'Aceptar' | 'Rechazar'
  decide: (id, decision, motivo) => apiFetch(`/admin/postulantes/${id}/decidir`, { method: 'POST', body: { decision, motivo: motivo || null } }),
  // Emite un enlace nuevo para entregarlo a mano cuando el correo no llega.
  // Anula los anteriores y queda registrado en auditoría.
  verificationLink: (id) => apiFetch(`/admin/postulantes/${id}/enlace-verificacion`, { method: 'POST' }),
}
