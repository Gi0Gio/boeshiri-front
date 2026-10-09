/**
 * Cómo se dicen la fecha, la franja y la entrada de un evento, también cuando
 * está en planeación y todavía faltan («Fecha por confirmar», «Costo por definir»).
 * Lo comparten el sitio público, la Agenda de la Junta y el editor.
 */

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const hora = (d) => d.toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit' })

/** Piezas de la fecha para los bloques del calendario; null si aún no hay fecha. */
export function partesFecha(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return {
    dia: String(d.getDate()).padStart(2, '0'),
    mes: MESES[d.getMonth()],
    anio: d.getFullYear(),
    dow: d.toLocaleDateString('es-PA', { weekday: 'long' }),
    hora: hora(d),
    fecha: d.toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' }),
    larga: d.toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  }
}

/** «1:00 p. m. – 4:00 p. m.» o solo la hora de inicio. */
export function franja(inicio, fin) {
  if (!inicio) return ''
  const a = hora(new Date(inicio))
  return fin ? `${a} – ${hora(new Date(fin))}` : a
}

/** «3 h», «1 h 30 min»… entre inicio y fin; vacío si falta alguno. */
export function duracion(inicio, fin) {
  if (!inicio || !fin) return ''
  const min = Math.round((new Date(fin) - new Date(inicio)) / 60000)
  if (min <= 0) return ''
  const h = Math.floor(min / 60), m = min % 60
  return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(' ')
}

/** 0 → «Entrada libre»; null → «Costo por definir». */
export const entrada = (cost) =>
  cost == null ? 'Costo por definir' : cost > 0 ? `$${Number(cost).toLocaleString('es-PA', { maximumFractionDigits: 2 })}` : 'Entrada libre'

/** Qué le falta a un evento en planeación para poder confirmarlo. */
export function faltaParaConfirmar(e) {
  return [!e.date && 'fecha', e.cost == null && 'costo'].filter(Boolean)
}
