import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from './FrogIcon'
import { GritoPieza, GritoVelado } from './Gritos'
import { gradientFor } from '../utils/gradient'

/**
 * El Mural: la pared de Explorar. Una retícula de módulos cuadrados donde
 * conviven publicaciones, noticias, gritos y mercado.
 *
 * No lleva filtros propios: para ver una sola cosa están las pestañas de
 * Explorar. Unos chips «Destacar» aquí dentro eran un segundo sistema de filtro
 * que se parecía demasiado al primero y obligaba a aprender la diferencia.
 */

/* ── Composición ─────────────────────────────────────────────── */

const FAM_PUB = { Article: 'articulo', Photo: 'foto', Video: 'video', Music: 'musica' }

/** Módulos permitidos. En móvil (2 columnas) todo lo ancho ocupa la fila entera. */
const SPANS = {
  ancha: 'col-span-2 md:col-span-3',
  grande: 'col-span-2 row-span-2',
  doble: 'col-span-2',
  alta: 'row-span-2',
  simple: '',
}

/** Celdas que ocupa cada módulo, para saber cuánto llena la pared. */
const AREA = { ancha: 3, grande: 4, doble: 2, alta: 2, simple: 1 }

/**
 * Por debajo de dos filas de seis, la pared no llena el ancho y quedan huecos
 * de fondo que se leen como piezas que faltan. Con poco contenido la retícula
 * pasa a cuatro columnas en escritorio, y las piezas crecen en vez de dispersarse.
 */
const AREA_PARA_SEIS_COLUMNAS = 13

/** Cuántas piezas caben en la pared antes de que deje de ser una pared. */
const TOPE = 24

/** Cada cuántas piezas se reinicia el cupo de piezas grandes (≈ una pantalla). */
const VENTANA = 12
const MAX_GRANDES = 2

/**
 * Mezcla por turnos entre familias. El orden dentro de cada una es el que trae
 * la API (recencia), pero se reparte de a una por ronda: sin este reparto las
 * publicaciones inundan la pared solo por ser las más numerosas, y el mural
 * vuelve a ser el feed de antes.
 */
function mezclar(colas) {
  const salida = []
  const mayor = Math.max(0, ...colas.map((c) => c.length))
  for (let i = 0; i < mayor && salida.length < TOPE; i++) {
    for (const cola of colas) {
      if (cola[i] && salida.length < TOPE) salida.push(cola[i])
    }
  }
  return salida
}

/** El módulo de cada pieza. `permiteGrande` viene del cupo de la ventana actual. */
function spanPara(pieza, i, permiteGrande, esPrimerGrito) {
  switch (pieza.fam) {
    case 'grito':
      return esPrimerGrito && permiteGrande ? SPANS.ancha : SPANS.doble
    case 'articulo':
      // Sin portada, una pieza 2×2 es un bloque oscuro casi vacío: solo crece si
      // tiene imagen que enseñar.
      return permiteGrande && pieza.dato?.coverImage ? SPANS.grande : SPANS.doble
    case 'noticia':
      return i % 3 === 2 ? SPANS.simple : SPANS.doble
    case 'foto':
      return i % 2 === 0 ? SPANS.alta : SPANS.simple
    case 'video':
    case 'musica':
      return SPANS.doble
    default:
      return SPANS.simple
  }
}

function componer({ publicaciones, productos, gritos, gritosVelados, puedeGritar }) {
  const noticias = publicaciones.filter((p) => p.type === 'News')
  const resto = publicaciones.filter((p) => p.type !== 'News')

  const piezasGrito = gritos.length
    ? gritos.map((g) => ({ key: `g-${g.id}`, fam: 'grito', dato: g }))
    : Array.from({ length: Math.min(gritosVelados, 3) }, (_, i) => ({
        key: `gv-${i}`,
        fam: 'grito',
        velado: true,
      }))

  const mezcla = mezclar([
    piezasGrito,
    resto.map((p) => ({ key: `p-${p.id}`, fam: FAM_PUB[p.type] ?? 'articulo', dato: p })),
    noticias.map((p) => ({ key: `n-${p.id}`, fam: 'noticia', dato: p })),
    productos.map((p) => ({ key: `m-${p.id}`, fam: 'mercado', dato: p })),
  ])

  // El hueco va dentro de la retícula, no en un botón flotante: es un espacio
  // libre en la pared y así se entiende que ahí se pega algo.
  const hueco = { key: 'hueco', fam: 'hueco', puedeGritar }
  mezcla.splice(Math.min(9, mezcla.length), 0, hueco)

  let grandes = 0
  let vistoGrito = false
  return mezcla.map((pieza, i) => {
    if (i % VENTANA === 0) grandes = 0
    const permiteGrande = grandes < MAX_GRANDES
    const primerGrito = pieza.fam === 'grito' && !vistoGrito
    if (pieza.fam === 'grito') vistoGrito = true

    const span = pieza.fam === 'hueco' ? SPANS.simple : spanPara(pieza, i, permiteGrande, primerGrito)
    if (span === SPANS.ancha || span === SPANS.grande) grandes++

    const modulo = Object.keys(SPANS).find((k) => SPANS[k] === span)
    return { ...pieza, span, area: AREA[modulo] }
  })
}

/* ── Piezas ──────────────────────────────────────────────────── */

function Cobertura({ semilla, imagen, alt }) {
  return (
    <span className="absolute inset-0" style={imagen ? undefined : { background: gradientFor(semilla) }}>
      {imagen ? (
        <img src={imagen} alt={alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <FrogIcon className="absolute bottom-[6%] right-[8%] h-[38%] w-[38%] text-white/15" />
      )}
    </span>
  )
}

function PiezaVisual({ p, conPlay, etiqueta }) {
  return (
    <Link to={`/publicaciones/${p.id}`} className="group relative block h-full overflow-hidden rounded-2xl">
      <Cobertura semilla={p.id} imagen={p.coverImage} alt={p.title} />
      {etiqueta && (
        <span className="absolute left-4 top-4 rounded-full bg-jungle-deep/80 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-tea">
          {etiqueta}
        </span>
      )}
      {conPlay && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 pl-1 text-jungle transition-transform duration-300 group-hover:scale-110">
            ▶
          </span>
        </span>
      )}
      <span className="relative flex h-full flex-col justify-end bg-gradient-to-t from-jungle-deep/90 via-jungle-deep/15 to-transparent p-4">
        <h3 className="font-display text-base font-semibold uppercase leading-tight tracking-wide text-white">{p.title}</h3>
        <span className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-white/75">{p.authorName}</span>
      </span>
    </Link>
  )
}

function PiezaArticulo({ p }) {
  if (p.coverImage) return <PiezaVisual p={p} etiqueta="Artículo" />
  return (
    // El filo claro es lo que hace que la pieza se lea como azulejo y no como un
    // hueco en la pared: jungle-deep sobre jungle casi no tiene borde propio.
    <Link
      to={`/publicaciones/${p.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-jungle-deep p-4 text-tea"
    >
      <FrogIcon className="pointer-events-none absolute -bottom-10 -right-8 h-40 w-40 text-white/5" />
      <span className="relative font-mono text-xs font-semibold uppercase tracking-[0.16em] text-tea/70">
        Artículo
      </span>
      <h3 className="relative mt-auto font-display text-lg font-semibold uppercase leading-tight tracking-wide text-cream">
        {p.title}
      </h3>
      <span className="relative mt-2 font-mono text-xs uppercase tracking-[0.1em] text-tea/70">
        {p.authorName}
        {p.readingMinutes ? ` · ${p.readingMinutes} min` : ''}
      </span>
    </Link>
  )
}

function PiezaNoticia({ p }) {
  return (
    <Link
      to={`/publicaciones/${p.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border-t-4 border-terracotta bg-white p-4"
    >
      {/* Tinta jungle sobre terracota, no blanca: blanco sobre este tono queda
          por debajo del contraste mínimo legible. */}
      <span className="self-start rounded-full bg-terracotta px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.18em] text-jungle">
        Noticia
      </span>
      <h3 className="mt-auto font-display text-base font-semibold uppercase leading-tight tracking-wide text-jungle transition-colors group-hover:text-rainforest">
        {p.title}
      </h3>
      <span className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-jungle/70">{p.authorName}</span>
    </Link>
  )
}

function PiezaMercado({ p }) {
  const precio = p.priceMax != null ? `$${p.price}–${p.priceMax}` : `$${p.price}`
  return (
    <Link
      to={`/marketplace/${p.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-caribbean to-tea p-4 text-jungle"
    >
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-jungle/70">Mercado</span>
      <h3 className="mt-auto font-display text-base font-semibold uppercase leading-tight tracking-wide">{p.name}</h3>
      <span className="mt-1 font-display text-xl font-semibold tracking-wide">{precio}</span>
      <span className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-jungle/70">{p.sellerName}</span>
    </Link>
  )
}

function Hueco({ puedeGritar, onEchar }) {
  const contenido = (
    <>
      <span className="font-display text-3xl leading-none">+</span>
      <span className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.12em]">
        {puedeGritar ? 'Echa un grito' : 'Quiero ser parte'}
      </span>
      <span className="mt-1 font-mono text-xs uppercase tracking-[0.1em] opacity-70">
        {puedeGritar ? 'tú también puedes pegar algo' : 'para publicar en esta pared'}
      </span>
    </>
  )
  const clases =
    'flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/40 p-4 text-center text-white/85 transition hover:border-white/70 hover:text-white'

  return puedeGritar ? (
    <button type="button" onClick={onEchar} className={clases}>
      {contenido}
    </button>
  ) : (
    <Link to="/postularme" className={clases}>
      {contenido}
    </Link>
  )
}

export default function Mural({
  publicaciones = [],
  productos = [],
  gritos = [],
  gritosVelados = 0,
  puedeGritar = false,
  onEchar,
  onVerGritos,
}) {
  const piezas = useMemo(
    () => componer({ publicaciones, productos, gritos, gritosVelados, puedeGritar }),
    [publicaciones, productos, gritos, gritosVelados, puedeGritar],
  )

  const area = piezas.reduce((total, p) => total + p.area, 0)
  const columnasEscritorio = area >= AREA_PARA_SEIS_COLUMNAS ? 'lg:grid-cols-6' : 'lg:grid-cols-4'

  return (
    <div className="bg-dorace-pattern overflow-hidden rounded-3xl bg-jungle p-3 shadow-[0_4px_20px_rgba(0,37,32,0.06)] sm:p-5">
      <div
        className={`grid auto-rows-[142px] grid-cols-2 gap-2.5 md:auto-rows-[152px] md:grid-cols-4 lg:auto-rows-[172px] ${columnasEscritorio}`}
        style={{ gridAutoFlow: 'row dense' }}
      >
        {piezas.map((pieza) => (
          <div key={pieza.key} className={pieza.span}>
            <Contenido pieza={pieza} onEchar={onEchar} onVerGritos={onVerGritos} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Contenido({ pieza, onEchar, onVerGritos }) {
  if (pieza.fam === 'hueco') return <Hueco puedeGritar={pieza.puedeGritar} onEchar={onEchar} />

  if (pieza.fam === 'grito') {
    if (pieza.velado) return <GritoVelado compacta />
    // El botón va encima de la tarjeta, no alrededor: un <article> dentro de un
    // <button> no es HTML válido, y anidarlo rompe la semántica del lector de
    // pantalla justo en la pieza que más queremos que se entienda.
    return (
      <div className="relative h-full">
        <GritoPieza grito={pieza.dato} compacta />
        <button
          type="button"
          onClick={onVerGritos}
          aria-label={`Ver el grito: ${pieza.dato.title}`}
          className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caribbean"
        />
      </div>
    )
  }

  switch (pieza.fam) {
    case 'articulo':
      return <PiezaArticulo p={pieza.dato} />
    case 'noticia':
      return <PiezaNoticia p={pieza.dato} />
    case 'mercado':
      return <PiezaMercado p={pieza.dato} />
    default:
      return <PiezaVisual p={pieza.dato} conPlay={pieza.fam === 'video' || pieza.fam === 'musica'} />
  }
}
