import { apiFetch } from './client'

/** Comunidad: perfiles públicos (RF-PUB-09). Lectura anónima. */
export const communityApi = {
  /** Con `rol` se acota a quienes lo llevan (así se arma la Junta en "Sobre"). */
  list: (rol) => apiFetch(`/comunidad${rol ? `?rol=${encodeURIComponent(rol)}` : ''}`, { auth: false }),
  get: (id) => apiFetch(`/comunidad/${id}`, { auth: false }),
}
