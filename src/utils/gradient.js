/** Pares de la paleta de marca para gradientes de avatares/portadas. */
const PARES = [
  ['#00735e', '#00e6bc'],
  ['#002420', '#00735e'],
  ['#d67a63', '#e60035'],
  ['#00e6bc', '#d9f2c2'],
  ['#00735e', '#d9f2c2'],
  ['#e60035', '#d67a63'],
]

/** Gradiente estable a partir de una semilla (id/nombre). */
export function gradientFor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const [a, b] = PARES[h % PARES.length]
  return `linear-gradient(150deg, ${a}, ${b})`
}

/** Iniciales a partir de un nombre completo. */
export function iniciales(nombre = '') {
  return nombre.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}
