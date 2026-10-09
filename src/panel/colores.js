import { useEffect, useState } from 'react'
import { groupsApi } from '../api/groups'

/**
 * Color propio de cada comisión. La comisión lo lleva en su cabecera, en su
 * ficha y en cada tarea suya que aparece en «Lo mío», así que una tarea se
 * reconoce por su grupo antes de leer el nombre. Cada equipo hereda el color
 * de su comisión madre, para que se vea de dónde cuelga.
 *
 * Son los colores de la paleta oficial. Cada uno trae un tinte para el fondo y
 * una tinta que cumple contraste AA sobre ese tinte y sobre blanco.
 */
export const COLORES_GRUPO = [
  { id: 'caribe', solido: '#00e6bc', tinte: '#d4f8ef', tinta: '#00594a' },
  { id: 'terracota', solido: '#d67a63', tinte: '#f8e3dc', tinta: '#8f3b26' },
  { id: 'te', solido: '#9fd47a', tinte: '#e9f6dc', tinta: '#335c17' },
  { id: 'candy', solido: '#e60035', tinte: '#fcdbe2', tinta: '#a10026' },
  { id: 'selva', solido: '#00735e', tinte: '#d2e9e3', tinta: '#00473a' },
]

const NEUTRO = { id: 'neutro', solido: '#7f9a90', tinte: '#e8efe9', tinta: '#2c403a' }

/*
 * El color sale del orden alfabético de las comisiones, no de un hash del id:
 * con un hash, dos de cuatro comisiones acaban fácilmente en el mismo tono.
 * Hasta cinco comisiones no se repite ninguno. La lista se pide una sola vez
 * por visita y se comparte entre las pantallas que la usan.
 */
let pedido = null
function comisionesCompartidas() {
  if (!pedido) pedido = groupsApi.commissions().catch(() => { pedido = null; return [] })
  return pedido
}

function paleta(comisiones) {
  const orden = [...comisiones].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  return new Map(orden.map((c, i) => [c.id, COLORES_GRUPO[i % COLORES_GRUPO.length]]))
}

/**
 * Devuelve `colorDe(grupo)`. Acepta una comisión `{ id }` o un equipo
 * `{ id, type: 'Team', parentCommissionId }`; también un id suelto de comisión.
 */
export function useColoresGrupos() {
  const [mapa, setMapa] = useState(() => new Map())
  useEffect(() => {
    let vivo = true
    comisionesCompartidas().then((cs) => { if (vivo) setMapa(paleta(cs ?? [])) })
    return () => { vivo = false }
  }, [])

  return function colorDe(grupo) {
    if (!grupo) return NEUTRO
    const id = typeof grupo === 'string' ? grupo : grupo.type === 'Team' ? grupo.parentCommissionId : grupo.id
    return mapa.get(id) ?? NEUTRO
  }
}

/** Variables CSS para pintar un bloque con el color de su grupo. */
export function varsDeColor(c) {
  return { '--g-solido': c.solido, '--g-tinte': c.tinte, '--g-tinta': c.tinta }
}
