import { apiFetch } from './client'

/** Perfil propio del miembro (RF-MEM-01..05). Requiere sesión. */
export const profileApi = {
  me: () => apiFetch('/mi/perfil'),
  update: (data) => apiFetch('/mi/perfil', { method: 'PUT', body: data }),
  updatePrivacy: (data) => apiFetch('/mi/perfil/privacidad', { method: 'PUT', body: data }),
  updateSocialLinks: (links) => apiFetch('/mi/redes', { method: 'PUT', body: { links } }),
  // Ley 81: acceso a los datos propios y supresión.
  exportData: () => apiFetch('/mi/datos'),
  deleteAccount: (password) => apiFetch('/mi/cuenta/eliminar', { method: 'POST', body: { password } }),
}
