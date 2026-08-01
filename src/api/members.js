import { apiFetch } from './client'

/**
 * Gestión de estados de miembro (RF-ADM-03). Requiere el permiso
 * `miembros.gestionar_estado` (Junta Directiva).
 */
export const membersApi = {
  list: () => apiFetch('/admin/miembros'),
  // status: 'Active' | 'Inactive' | 'Suspended' | 'Retired' | 'Expelled'
  changeStatus: (id, status, motivo) =>
    apiFetch(`/admin/miembros/${id}/estado`, {
      method: 'PATCH',
      body: { status, motivo: motivo || null },
    }),
}

/** Estados y su presentación en el panel (Catálogo de Permisos §3). */
export const ESTADOS_MIEMBRO = [
  { id: 'Active', label: 'Activo', tone: 'caribbean', hint: 'Acceso pleno al panel.' },
  { id: 'Inactive', label: 'Inactivo', tone: 'gris', hint: 'Membresía en pausa.' },
  { id: 'Suspended', label: 'Suspendido', tone: 'terracotta', hint: 'No puede iniciar sesión.' },
  { id: 'Retired', label: 'Retirado', tone: 'gris', hint: 'Se fue voluntariamente. No puede iniciar sesión.' },
  { id: 'Expelled', label: 'Expulsado', tone: 'candy', hint: 'Baja por la administración. No puede iniciar sesión.' },
]

export const estadoMeta = (id) =>
  ESTADOS_MIEMBRO.find((e) => e.id === id) ?? { id, label: id, tone: 'gris', hint: '' }

/** Estados que cortan la sesión: merecen confirmación explícita. */
export const ESTADOS_BLOQUEANTES = ['Suspended', 'Retired', 'Expelled']
