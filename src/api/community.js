import { apiFetch } from './client'

/** Comunidad: perfiles públicos (RF-PUB-09). Lectura anónima. */
export const communityApi = {
  list: () => apiFetch('/comunidad', { auth: false }),
  get: (id) => apiFetch(`/comunidad/${id}`, { auth: false }),
}
