/**
 * Reconoce enlaces de YouTube, Spotify y SoundCloud y da la URL para incrustar su
 * reproductor. Lo usan el compositor (vista previa y para deducir el tipo) y el
 * detalle de la publicación, así los dos muestran exactamente lo mismo.
 *
 * Devuelve `{ tipo: 'Video' | 'Music', proveedor, embed, alto }` o null.
 */
export function detectarMedio(url) {
  if (!url) return null
  let u
  try { u = new URL(url.trim()) } catch { return null }
  const host = u.hostname.replace(/^www\.|^m\./, '')

  // YouTube: watch?v=, youtu.be/, shorts/, embed/, live/
  let yt = null
  if (host === 'youtu.be') yt = u.pathname.slice(1, 12)
  else if (host === 'youtube.com' || host === 'music.youtube.com') {
    yt = u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1] || null
  }
  if (yt && /^[\w-]{11}$/.test(yt)) {
    // YouTube Music sigue siendo audio: se publica como Música.
    return { tipo: host === 'music.youtube.com' ? 'Music' : 'Video', proveedor: 'YouTube', embed: `https://www.youtube.com/embed/${yt}`, alto: null }
  }

  // Spotify: open.spotify.com/(intl-xx/)?(track|album|playlist|episode|show|artist)/id
  if (host === 'open.spotify.com') {
    const m = u.pathname.match(/^\/(?:intl-[\w-]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/)
    if (m) return { tipo: 'Music', proveedor: 'Spotify', embed: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, alto: m[1] === 'track' || m[1] === 'episode' ? 152 : 352 }
  }

  // SoundCloud: cualquier ruta de artista/pista/lista pasa por su reproductor.
  if (host === 'soundcloud.com' || host === 'on.soundcloud.com') {
    if (u.pathname.split('/').filter(Boolean).length >= 1) {
      return { tipo: 'Music', proveedor: 'SoundCloud', embed: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&color=%2300735e&visual=false`, alto: 166 }
    }
  }
  return null
}

/** ¿El texto entero es un solo enlace? Sirve para notar que alguien pegó un video en el cuerpo. */
export const esSoloEnlace = (texto) => /^https?:\/\/\S+$/.test((texto ?? '').trim())
