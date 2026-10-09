/** Dónde vive un grupo: la comisión en su página, el equipo en la suya. */
export const rutaGrupo = (g) =>
  g.type === 'Team' ? `/panel/grupos/equipos/${g.id}` : `/panel/grupos/${g.id}`
