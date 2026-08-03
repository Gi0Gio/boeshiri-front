import { apiFetch } from './client'

/** Gestor de archivos del bucket R2 (solo super admin). */
export const storageApi = {
  list: (prefix) => apiFetch(`/archivos/gestor${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`),
  remove: (key) => apiFetch(`/archivos/gestor?key=${encodeURIComponent(key)}`, { method: 'DELETE' }),
  emptyTrash: () => apiFetch('/archivos/gestor/vaciar-papelera', { method: 'POST' }),
}

/**
 * Situación de cada archivo. Solo la papelera y los huérfanos son seguros de
 * borrar: lo que está en uso dejaría un enlace roto en el sitio.
 */
export const USOS = {
  InUse: { label: 'En uso', tone: 'caribbean', seguro: false },
  Trash: { label: 'En papelera', tone: 'terracotta', seguro: true },
  Orphan: { label: 'Huérfano', tone: 'gris', seguro: true },
}

export const usoMeta = (u) => USOS[u] ?? { label: u, tone: 'gris', seguro: false }
