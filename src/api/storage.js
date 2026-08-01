import { apiFetch } from './client'

/** Gestor de archivos del bucket R2 (solo super admin). */
export const storageApi = {
  list: (prefix) => apiFetch(`/archivos/gestor${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`),
  remove: (key) => apiFetch(`/archivos/gestor?key=${encodeURIComponent(key)}`, { method: 'DELETE' }),
}
