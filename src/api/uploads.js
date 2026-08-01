import { API_BASE, getToken, ApiError } from './client'

/**
 * Sube un archivo a través del API (multipart) y devuelve su URL pública.
 * folder: avatars | publicaciones | documentos | productos | misc
 */
export async function uploadFile(file, folder = 'misc') {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)

  const token = getToken()
  const res = await fetch(`${API_BASE}/archivos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd, // el navegador pone el Content-Type multipart con boundary
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new ApiError(data?.detail || data?.title || `Error ${res.status}`, res.status, data)
  }
  return data.url
}
