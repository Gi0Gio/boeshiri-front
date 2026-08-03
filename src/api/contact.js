import { apiFetch } from './client'

/** Formulario público de contacto (RF-PUB-12). Anónimo. */
export const contactApi = {
  send: (data) => apiFetch('/contacto', { method: 'POST', body: data, auth: false }),
}
