/**
 * Qué permiso abre cada página de la Junta y del Sistema (RBAC aditivo, ADR-0002).
 * Basta con uno de la lista. Es lo mismo que exige la API en cada endpoint, así que
 * el menú y el guard enseñan exactamente lo que la API va a dejar hacer: un Tesorero
 * ve Finanzas y nada más, y Recursos Humanos ve Pendientes y Personas.
 *
 * Las páginas de «Lo mío» no están aquí: las abre cualquier miembro activo, y
 * PanelLayout ya deja fuera a quien no lo es.
 */
const ACCESO = {
  '/panel/admin': ['postulantes.decidir', 'comisiones.ver_todas'],
  '/panel/admin/miembros': ['postulantes.decidir', 'miembros.gestionar_estado'],
  '/panel/admin/comisiones': ['comisiones.ver_todas'],
  '/panel/admin/eventos': ['eventos.gestionar'],
  '/panel/admin/moderacion': ['publicaciones.moderar', 'productos.moderar'],
  '/panel/admin/finanzas': ['finanzas.ver'],
  '/panel/admin/transparencia': ['transparencia.gestionar'],
  '/panel/admin/convocatorias': ['convocatorias.gestionar'],
  '/panel/super/roles': ['roles.gestionar'],
  '/panel/super/auditoria': ['auditoria.ver'],
  '/panel/super/archivos': ['archivos.gestionar'],
}

/**
 * ¿Puede abrir esta ruta? Manda la entrada más larga que la contenga: así
 * /panel/admin/convocatorias/123/editar hereda el permiso de su sección.
 * Las rutas fuera de ACCESO son de cualquier miembro activo.
 */
export function puedeVer(ruta, hasPermission) {
  const limpia = ruta.replace(/\/+$/, '')
  const clave = Object.keys(ACCESO)
    .filter((k) => limpia === k || limpia.startsWith(`${k}/`))
    .sort((a, b) => b.length - a.length)[0]
  return !clave || ACCESO[clave].some(hasPermission)
}
