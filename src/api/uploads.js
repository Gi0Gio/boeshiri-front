import { API_BASE, fetchConSesion, ApiError } from './client'

/**
 * Sube un archivo a través del API (multipart) y devuelve su URL pública.
 * folder: avatars | publicaciones | documentos | productos | misc
 */
export async function uploadFile(file, folder = 'misc') {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)

  const res = await fetchConSesion(`${API_BASE}/archivos`, {
    method: 'POST',
    body: fd, // el navegador pone el Content-Type multipart con boundary
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new ApiError(data?.detail || data?.title || `Error ${res.status}`, res.status, data)
  }
  return data.url
}
