import { useEffect, useState } from 'react'
import { tasksApi } from '../api/tasks'

/** Orden de «lo que toca»: lo que ya está en marcha, luego lo pendiente, y lo que espera revisión. */
export const ORDEN_ESTADO = { InProgress: 0, Pending: 1, InReview: 2, Done: 3 }

export const ESTADO = {
  Pending: { label: 'Pendiente', corto: 'Por hacer' },
  InProgress: { label: 'En proceso', corto: 'En proceso' },
  InReview: { label: 'En revisión', corto: 'En revisión' },
  Done: { label: 'Completado', corto: 'Hecho' },
}

/**
 * El siguiente paso de una tarea para esta persona, o null si no le toca moverla.
 * Quien coordina o lidera la lleva paso a paso; quien solo es responsable la
 * entrega (a revisión) y, una vez revisada, la cierra (RF-KAN-03).
 */
export function siguientePaso(tarea, { esGestor, userId }) {
  const esResponsable = (tarea.assignees ?? []).some((a) => a.userId === userId)
  if (esGestor) {
    return { Pending: 'InProgress', InProgress: 'InReview', InReview: 'Done' }[tarea.status] ?? null
  }
  if (esResponsable) {
    return { Pending: 'InReview', InProgress: 'InReview', InReview: 'Done' }[tarea.status] ?? null
  }
  return null
}

/** Una tarea activa sin nadie a cargo: el tablero la sube y la marca para que no se olvide. */
export const sinResponsable = (t) => t.status !== 'Done' && (t.assignees ?? []).length === 0

/**
 * Cuántas tareas activas lleva cada integrante de un grupo, para repartir mejor.
 * Devuelve `{ porPersona: Map(userId → n), sinResponsable: n }`. Solo pide el
 * tablero si quien mira forma parte del grupo (la API responde 403 si no).
 */
export function useCargaTareas(groupId, activo, version = 0) {
  const [carga, setCarga] = useState(null)
  useEffect(() => {
    if (!activo) { setCarga(null); return }
    let vivo = true
    tasksApi.board(groupId)
      .then((ts) => {
        if (!vivo) return
        const porPersona = new Map()
        for (const t of ts) {
          if (t.status === 'Done') continue
          for (const a of t.assignees ?? []) porPersona.set(a.userId, (porPersona.get(a.userId) ?? 0) + 1)
        }
        setCarga({ porPersona, sinResponsable: ts.filter(sinResponsable).length })
      })
      .catch(() => { if (vivo) setCarga(null) })
    return () => { vivo = false }
  }, [groupId, activo, version])
  return carga
}

export const TEXTO_PASO = {
  InProgress: 'Empezar',
  InReview: 'Entregar',
  Done: 'Dar por hecha',
}

/**
 * Las tareas asignadas a esta persona en todos sus grupos, sin las completadas.
 * La API no tiene un listado «mis tareas», así que se juntan los tableros de
 * cada grupo (una petición por grupo; un miembro está en pocos).
 */
export function useMisTareas(grupos, userId, version = 0) {
  const [estado, setEstado] = useState({ tareas: [], cargando: true, error: null })

  useEffect(() => {
    if (!grupos) return
    let vivo = true
    setEstado((e) => ({ ...e, cargando: true, error: null }))
    Promise.allSettled(grupos.map((g) => tasksApi.board(g.id).then((ts) => ts.map((t) => ({ ...t, grupo: g })))))
      .then((rs) => {
        if (!vivo) return
        const fallidos = rs.filter((r) => r.status === 'rejected').length
        const todas = rs.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
        const mias = todas
          .filter((t) => t.status !== 'Done' && (t.assignees ?? []).some((a) => a.userId === userId))
          .sort((a, b) => ORDEN_ESTADO[a.status] - ORDEN_ESTADO[b.status] || new Date(b.createdAt) - new Date(a.createdAt))
        setEstado({
          tareas: mias,
          todas,
          cargando: false,
          error: fallidos === grupos.length && grupos.length > 0 ? 'No se pudieron cargar tus tareas.' : null,
        })
      })
    return () => { vivo = false }
  }, [grupos, userId, version])

  return estado
}
