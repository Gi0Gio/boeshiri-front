import { apiFetch, API_BASE, getToken, ApiError } from './client'

/** Biblioteca de documentos (§8). Solo miembros; admin gated por permiso. */
export const documentsApi = {
  list: (biblioteca, categoria) => {
    const q = new URLSearchParams()
    if (biblioteca) q.set('biblioteca', biblioteca)
    if (categoria) q.set('categoria', categoria)
    const s = q.toString()
    return apiFetch(`/documentos${s ? `?${s}` : ''}`)
  },
  get: (id) => apiFetch(`/documentos/${id}`),
  /**
   * Descarga a través de la API. Los objetos de R2 son públicos por URL, así que
   * enlazarlos directo saltaba el control de acceso de la biblioteca (§8).
   *
   * No puede ser un <a href>: el endpoint exige el JWT y un enlace no manda
   * cabeceras. Se descarga con sesión y se vuelca a un blob local, que además
   * fuerza la descarga en vez de abrir el PDF en otra pestaña.
   */
  download: async (id, fileName) => {
    const res = await fetch(`${API_BASE}/documentos/${id}/descargar`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    })
    if (!res.ok) {
      const t = await res.text()
      let d = null
      try { d = t ? JSON.parse(t) : null } catch { /* no-JSON */ }
      throw new ApiError(d?.detail || d?.title || 'No se pudo descargar el documento.', res.status, d)
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'documento'
    document.body.appendChild(a)
    a.click()
    a.remove()
    // Sin revocar, el blob queda en memoria mientras viva la pestaña.
    URL.revokeObjectURL(url)
  },
  create: (data) => apiFetch('/documentos', { method: 'POST', body: data }),
  replace: (id, data) => apiFetch(`/documentos/${id}`, { method: 'PUT', body: data }),
  remove: (id) => apiFetch(`/documentos/${id}`, { method: 'DELETE' }),
}
