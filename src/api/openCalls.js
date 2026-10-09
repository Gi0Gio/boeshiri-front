import { apiFetch } from './client'

/**
 * Convocatorias. Lo público (ver y responder) funciona sin sesión; si la hay, el
 * token viaja y la API toma nombre y contacto del perfil. Lo de la Junta exige
 * convocatorias.gestionar.
 */
export const openCallsApi = {
  // ── Público ──
  open: () => apiFetch('/convocatorias'),
  get: (id) => apiFetch(`/convocatorias/${id}`),
  submit: (id, data) => apiFetch(`/convocatorias/${id}/respuestas`, { method: 'POST', body: data }),

  // ── Junta ──
  list: () => apiFetch('/admin/convocatorias'),
  detail: (id) => apiFetch(`/admin/convocatorias/${id}`),
  create: (data) => apiFetch('/admin/convocatorias', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/admin/convocatorias/${id}`, { method: 'PUT', body: data }),
  // status: 'Draft' | 'Open' | 'Closed'
  changeStatus: (id, status) => apiFetch(`/admin/convocatorias/${id}/estado`, { method: 'PATCH', body: { status } }),
  remove: (id) => apiFetch(`/admin/convocatorias/${id}`, { method: 'DELETE' }),
  // status: 'New' | 'Shortlisted' | 'Accepted' | 'Rejected'
  review: (responseId, status, note) => apiFetch(`/admin/convocatorias/respuestas/${responseId}`, { method: 'PATCH', body: { status, note } }),
}

export const TIPOS_PREGUNTA = [
  { id: 'ShortText', label: 'Texto corto', ico: 'pluma', ayuda: 'Una línea: nombre del proyecto, disciplina…' },
  { id: 'LongText', label: 'Texto largo', ico: 'list', ayuda: 'Un párrafo o más: la propuesta, la experiencia.' },
  { id: 'Link', label: 'Enlace', ico: 'enlace', ayuda: 'Para ver su trabajo: portafolio, redes, un video.' },
  { id: 'Amount', label: 'Monto', ico: 'dollar', ayuda: 'En dólares: honorarios, costo de materiales.' },
]

export const ESTADO_RESPUESTA = {
  New: { label: 'Nueva', tono: 'candy' },
  Shortlisted: { label: 'Preseleccionada', tono: 'caribbean' },
  Accepted: { label: 'Aceptada', tono: 'rainforest' },
  Rejected: { label: 'Descartada', tono: 'gris' },
}

/** Lo que hay que decir de la convocatoria: borrador, abierta, cerrada (o vencida aunque siga «abierta»). */
export function estadoConvocatoria(c) {
  if (c.status === 'Draft') return { label: 'Borrador', tono: 'gris' }
  if (c.isOpen) return { label: 'Abierta', tono: 'caribbean' }
  return { label: 'Cerrada', tono: 'terracotta' }
}

/** Primera plantilla: lo que se le pregunta a quien propone un taller. */
export const PLANTILLA_TALLERISTA = [
  { label: '¿Qué taller propones?', help: 'La idea, a quién va dirigido y cómo lo guiarías.', type: 'LongText', required: true },
  { label: 'Muestra de tu trabajo', help: 'Portafolio, Instagram o un video.', type: 'Link', required: true },
  { label: 'Experiencia guiando talleres', help: 'Si es tu primera vez, cuéntanos igual.', type: 'LongText', required: false },
  { label: 'Honorarios', help: 'Lo que cobrarías por la sesión, en dólares. Pon 0 si lo haces sin costo.', type: 'Amount', required: true },
]

/** «$120» o «$80.50». Con es-PA, Intl escribe «USD 80»; aquí se usa el signo como en la calle. */
export const dinero = (n) =>
  n == null ? '' : `$${Number(n).toLocaleString('es-PA', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`

export const fechaLarga = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
