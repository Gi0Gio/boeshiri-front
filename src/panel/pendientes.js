import { useEffect, useState } from 'react'
import { postulantesApi } from '../api/postulantes'
import { groupsApi } from '../api/groups'

/**
 * Lo que espera una decisión de la Junta. Es la razón por la que alguien de la
 * Junta cambia de sombrero, así que «Lo mío» avisa de cuántas hay y el modo
 * Junta abre aquí. Cada fuente se pide solo si se tiene el permiso: sin él, la
 * API respondería 403 y no habría nada que decidir.
 */
export function usePendientesJunta(hasPermission, activo = true, version = 0) {
  const [estado, setEstado] = useState({ cargando: true, postulantes: [], solicitudes: [], sinCoordinador: [], total: 0 })

  useEffect(() => {
    if (!activo) return
    let vivo = true
    const verPostulantes = hasPermission('postulantes.decidir')
    const verComisiones = hasPermission('comisiones.ver_todas')

    ;(async () => {
      const [postulantes, comisiones] = await Promise.all([
        verPostulantes ? postulantesApi.list().catch(() => []) : [],
        verComisiones ? groupsApi.commissions().catch(() => []) : [],
      ])
      // Las solicitudes viven por comisión: una petición por comisión, que son pocas.
      const porComision = await Promise.all(
        comisiones.map((c) => groupsApi.joinRequests(c.id).then((ss) => ss.map((s) => ({ ...s, comision: c }))).catch(() => [])),
      )
      if (!vivo) return
      const solicitudes = porComision.flat()
      const sinCoordinador = comisiones.filter((c) => !c.coordinatorName)
      // Un postulante sin correo verificado todavía no se puede decidir (RF-PUB-13b).
      const decidibles = postulantes.filter((p) => p.emailVerified)
      setEstado({
        cargando: false,
        postulantes,
        solicitudes,
        sinCoordinador,
        total: decidibles.length + solicitudes.length + sinCoordinador.length,
      })
    })()
    return () => { vivo = false }
  }, [activo, version, hasPermission])

  return estado
}
