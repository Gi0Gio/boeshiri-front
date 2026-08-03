import { apiFetch } from './client'

/** Roles y permisos (RBAC aditivo, D-1). Requiere roles.gestionar (Super Admin). */
export const rolesApi = {
  list: () => apiFetch('/admin/roles'),
  // ── Gestión de roles (RF-SA-02). Los de sistema no se editan ni borran ──
  createRole: (data) => apiFetch('/admin/roles', { method: 'POST', body: data }),
  updateRole: (id, data) => apiFetch(`/admin/roles/${id}`, { method: 'PUT', body: data }),
  setPermissions: (id, permissions) => apiFetch(`/admin/roles/${id}/permisos`, { method: 'PUT', body: { permissions } }),
  deleteRole: (id) => apiFetch(`/admin/roles/${id}`, { method: 'DELETE' }),

  permissions: () => apiFetch('/admin/permisos'),
  users: () => apiFetch('/admin/usuarios'),
  assign: (userId, roleId) => apiFetch(`/admin/usuarios/${userId}/roles`, { method: 'POST', body: { roleId } }),
  remove: (userId, roleId) => apiFetch(`/admin/usuarios/${userId}/roles/${roleId}`, { method: 'DELETE' }),
}
