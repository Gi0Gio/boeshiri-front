import { apiFetch } from './client'

/** Roles y permisos (RBAC aditivo, D-1). Requiere roles.gestionar (Super Admin). */
export const rolesApi = {
  list: () => apiFetch('/admin/roles'),
  permissions: () => apiFetch('/admin/permisos'),
  users: () => apiFetch('/admin/usuarios'),
  assign: (userId, roleId) => apiFetch(`/admin/usuarios/${userId}/roles`, { method: 'POST', body: { roleId } }),
  remove: (userId, roleId) => apiFetch(`/admin/usuarios/${userId}/roles/${roleId}`, { method: 'DELETE' }),
}
