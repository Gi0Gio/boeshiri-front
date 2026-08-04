import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Metadatos por ruta.
 *
 * En una SPA el navegador descarga UN solo index.html: sin esto, /sobre,
 * /marketplace y /eventos comparten título y descripción, y para un buscador
 * son la misma página repetida. Google sí ejecuta JavaScript, así que ve lo que
 * escribimos aquí; lo que no lo ejecuta (WhatsApp, Instagram) se queda con lo
 * que trae index.html, que por eso también está bien puesto.
 *
 * No usamos react-helmet: son ocho páginas y cuatro etiquetas, no hace falta
 * meter una dependencia con su propio ciclo de vida en medio.
 */

const SITIO = 'Boesh Irí'
const IMAGEN_POR_DEFECTO = '/compartir/marca/imagen.png'

/** Escribe (o crea) una etiqueta meta del head. */
function meta(selector, attr, valor) {
  if (!valor) return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [clave, contenido] = selector.replace(/^meta\[|\]$/g, '').split('=')
    el.setAttribute(clave, contenido.replace(/["']/g, ''))
    document.head.appendChild(el)
  }
  el.setAttribute(attr, valor)
}

/**
 * @param {object} o
 * @param {string} o.titulo        Sin la marca: se le añade " — Boesh Irí".
 * @param {string} o.descripcion   150-160 caracteres; es lo que se lee en el resultado.
 * @param {string} [o.imagen]      URL absoluta o ruta del sitio. Por defecto, la tarjeta de marca.
 * @param {string} [o.tipo]        og:type — "article" en publicaciones, "website" en el resto.
 * @param {object} [o.datos]       JSON-LD específico de la página (evento, artículo, persona…).
 * @param {boolean} [o.noindex]    Pide al buscador que no la indexe (404, pantallas de un solo uso).
 */
export function useSeo({ titulo, descripcion, imagen, tipo = 'website', datos, noindex = false } = {}) {
  const { pathname } = useLocation()

  useEffect(() => {
    const origen = window.location.origin
    const url = origen + pathname
    const completo = titulo ? `${titulo} — ${SITIO}` : SITIO
    const img = imagen
      ? imagen.startsWith('http') ? imagen : origen + imagen
      : origen + IMAGEN_POR_DEFECTO

    document.title = completo
    meta('meta[name="description"]', 'content', descripcion)
    meta('meta[property="og:title"]', 'content', completo)
    meta('meta[property="og:description"]', 'content', descripcion)
    meta('meta[property="og:url"]', 'content', url)
    meta('meta[property="og:type"]', 'content', tipo)
    meta('meta[property="og:image"]', 'content', img)
    meta('meta[name="twitter:title"]', 'content', completo)
    meta('meta[name="twitter:description"]', 'content', descripcion)
    meta('meta[name="twitter:image"]', 'content', img)

    // La canónica le dice al buscador cuál es la dirección buena de esta página.
    // Sin ella, /marketplace?cat=Arte y /marketplace compiten entre sí y ninguna
    // acumula señal.
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    // El servidor devuelve 200 en todas las rutas (es una SPA), así que un 404
    // se ve como una página normal. Esto es lo que evita que Google lo indexe
    // como si fuera contenido.
    meta('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow')
  }, [pathname, titulo, descripcion, imagen, tipo, noindex])

  // Los datos estructurados propios de la página se montan y desmontan con ella:
  // si se quedaran, una publicación seguiría "siendo" un artículo al navegar a
  // la portada.
  // La dependencia es el JSON, no el objeto: quien llama lo construye en línea y
  // cada render daría una referencia nueva, remontando el script sin necesidad.
  const datosJson = datos ? JSON.stringify(datos) : null
  useEffect(() => {
    if (!datosJson) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.pagina = 'true'
    script.textContent = datosJson
    document.head.appendChild(script)
    return () => script.remove()
  }, [datosJson])
}
