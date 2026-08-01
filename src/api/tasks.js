import { apiFetch } from './client'

/**
 * Tablero Kanban de un grupo (§7.4). Autorización CONTEXTUAL, no por rol global:
 * solo los integrantes ven el tablero; el líder/coordinador crea y mueve tareas
 * (RF-KAN-02); el responsable mueve la suya a En revisión/Completado (RF-KAN-03).
 */
export const tasksApi = {
  board: (groupId) => apiFetch(`/grupos/${groupId}/tareas`),
  create: (groupId, data) => apiFetch(`/grupos/${groupId}/tareas`, { method: 'POST', body: data }),
  // status: 'Pending' | 'InProgress' | 'InReview' | 'Done'
  move: (taskId, status) => apiFetch(`/tareas/${taskId}/mover`, { method: 'PATCH', body: { status } }),
  addLink: (taskId, data) => apiFetch(`/tareas/${taskId}/enlaces`, { method: 'POST', body: data }),
}

/** Columnas fijas del tablero (RF-KAN-01; no configurables, RF-KAN-04). */
export const COLUMNAS_KANBAN = [
  { id: 'Pending', label: 'Pendiente', tone: 'gris' },
  { id: 'InProgress', label: 'En proceso', tone: 'caribbean' },
  { id: 'InReview', label: 'En revisión', tone: 'terracotta' },
  { id: 'Done', label: 'Completado', tone: 'rainforest' },
]

/** Columnas a las que un responsable (no líder) puede mover su tarea (RF-KAN-03). */
export const COLUMNAS_RESPONSABLE = ['InReview', 'Done']
