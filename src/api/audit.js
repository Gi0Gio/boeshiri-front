import { apiFetch } from './client'

/** Historial de auditoría (RF-AUD-02). Requiere auditoria.ver (Super Admin). */
export const auditApi = {
  list: (take = 100) => apiFetch(`/admin/auditoria?take=${take}`),
}
