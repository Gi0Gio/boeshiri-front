/**
 * Datos de ejemplo del área autenticada (panel).
 * Prototipo sin backend — todo es placeholder.
 */

/* Usuario "conectado" en la demo */
export const usuarioActual = {
  nombre: 'Ana López',
  iniciales: 'AL',
  disciplina: 'Muralismo',
  correo: 'ana.lopez@correo.com',
  colores: ['#00735e', '#00e6bc'],
}

/* ── Miembros (gestión administrativa) ──────────────────────── */
export const miembros = [
  { nombre: 'Ana López', disciplina: 'Muralismo', estado: 'Activo', comision: 'Comunicación y Diseño', roles: ['Miembro', 'Coordinadora'] },
  { nombre: 'Marco Vega', disciplina: 'Música', estado: 'Activo', comision: 'Cultura, Inv. y Eventos', roles: ['Miembro', 'Periodista'] },
  { nombre: 'Kim Araúz', disciplina: 'Fotografía', estado: 'Inactivo', comision: 'Comunicación y Diseño', roles: ['Miembro'] },
  { nombre: 'Sol Medina', disciplina: 'Danza', estado: 'Activo', comision: '—', roles: ['Miembro'] },
  { nombre: 'Darío Pinto', disciplina: 'Diseño', estado: 'Activo', comision: 'Tecnología', roles: ['Miembro', 'Tesorero'] },
  { nombre: 'Lía Cruz', disciplina: 'Poesía', estado: 'Suspendido', comision: 'Cultura, Inv. y Eventos', roles: ['Miembro', 'Periodista'] },
  { nombre: 'Beto Sanjur', disciplina: 'Ilustración', estado: 'Retirado', comision: '—', roles: ['Miembro'] },
]

export const postulantes = [
  { nombre: 'Nadia Ortega', correo: 'nadia.o@correo.com', telefono: '+507 6123-4567', fecha: '18 jul 2026', razon: 'Soy ilustradora y quiero aportar a la comunidad y sus eventos.' },
  { nombre: 'Iván Ríos', correo: 'ivan.rios@correo.com', telefono: '+507 6987-6543', fecha: '16 jul 2026', razon: 'Productor musical interesado en colaborar con el colectivo.' },
  { nombre: 'Paula Him', correo: 'paula.him@correo.com', telefono: '+507 6222-1188', fecha: '14 jul 2026', razon: 'Gestora cultural; me identifico con la misión de Boesh Irí.' },
]

export const estadoTono = {
  Activo: 'caribbean',
  Inactivo: 'gris',
  Suspendido: 'terracotta',
  Retirado: 'tea',
  Expulsado: 'candy',
}

/* ── Publicaciones del miembro ──────────────────────────────── */
export const misPublicaciones = [
  { tipo: 'Artículo', titulo: 'Qué significa ser un refugio cultural', estado: 'Pública', fecha: '24 jun 2026', edit: '25 jun 2026' },
  { tipo: 'Foto', titulo: 'Montaje del mural', estado: 'Pública', fecha: '20 jun 2026', edit: '—' },
  { tipo: 'Foto', titulo: 'Bocetos de espirales', estado: 'Oculta', fecha: '12 jun 2026', edit: '13 jun 2026' },
  { tipo: 'Video', titulo: 'Time-lapse: La rana que volvió', estado: 'Pública', fecha: '2 jun 2026', edit: '—' },
]

export const tiposPublicacion = [
  { tipo: 'Artículo', desc: 'Título, tags, cuerpo, hasta 3 links y 3 imágenes.', tono: 'rainforest' },
  { tipo: 'Foto', desc: 'Imágenes (JPG/PNG/WebP, máx 5 MB). Sin YouTube.', tono: 'caribbean' },
  { tipo: 'Video', desc: 'Enlace de YouTube, sin límite de duración.', tono: 'terracotta' },
  { tipo: 'Música', desc: 'Enlace externo (Spotify, YouTube, SoundCloud).', tono: 'candy' },
  { tipo: 'Noticia', desc: 'Solo Periodistas y Junta. Igual que artículo.', tono: 'jungle' },
]

/* ── Grupos: comisiones y equipos ───────────────────────────── */
export const comisiones = [
  { nombre: 'Tecnología', coordinador: 'Darío Pinto', miembros: 4, equipos: 1, permanente: true },
  { nombre: 'Cultura, Investigación y Eventos', coordinador: 'Marco Vega', miembros: 7, equipos: 3, permanente: true },
  { nombre: 'Comunicación y Diseño', coordinador: 'Ana López', miembros: 5, equipos: 2, permanente: true },
  { nombre: 'Finanzas', coordinador: 'Darío Pinto', miembros: 3, equipos: 0, permanente: true },
]

export const misGrupos = [
  { id: 'com-comunicacion', nombre: 'Comunicación y Diseño', tipo: 'Comisión', rol: 'Coordinadora' },
  { id: 'eq-noche-raiz-diseno', nombre: 'Noche Raíz · Equipo de Diseño', tipo: 'Equipo', rol: 'Líder' },
  { id: 'eq-mural-logistica', nombre: 'Mural en vivo · Logística', tipo: 'Equipo', rol: 'Integrante' },
]

/* Tablero Kanban de un equipo */
export const kanbanColumnas = ['Pendiente', 'En proceso', 'En revisión', 'Completado']

export const kanbanTareas = [
  { id: 't1', estado: 'Pendiente', titulo: 'Diseñar afiche principal', responsables: ['Ana L.'], enlaces: 1 },
  { id: 't2', estado: 'Pendiente', titulo: 'Definir paleta del evento', responsables: ['Darío P.'], enlaces: 0 },
  { id: 't3', estado: 'En proceso', titulo: 'Plantillas para redes', responsables: ['Ana L.', 'Kim A.'], enlaces: 2 },
  { id: 't4', estado: 'En proceso', titulo: 'Guion del video teaser', responsables: ['Marco V.'], enlaces: 1 },
  { id: 't5', estado: 'En revisión', titulo: 'Banner del sitio web', responsables: ['Darío P.'], enlaces: 3 },
  { id: 't6', estado: 'Completado', titulo: 'Moodboard aprobado', responsables: ['Ana L.'], enlaces: 1 },
  { id: 't7', estado: 'Completado', titulo: 'Reserva de espacio', responsables: ['Sol M.'], enlaces: 0 },
]

/* ── Documentos / biblioteca ────────────────────────────────── */
export const documentos = [
  { nombre: 'Estatutos del colectivo.pdf', categoria: 'Institucional', autor: 'Junta Directiva', fecha: '10 ene 2026', acceso: 'Miembros', biblioteca: 'Administración' },
  { nombre: 'Plantilla carta membretada.docx', categoria: 'Plantilla', autor: 'Junta Directiva', fecha: '2 feb 2026', acceso: 'Miembros', biblioteca: 'Administración' },
  { nombre: 'Instructivo evento.pdf', categoria: 'Plantilla', autor: 'Junta Directiva', fecha: '2 feb 2026', acceso: 'Miembros', biblioteca: 'Administración' },
  { nombre: 'Anteproyecto muralismo urbano.pdf', categoria: 'Investigación', autor: 'Ana López', fecha: '15 mar 2026', acceso: 'Miembros', biblioteca: 'Comunidad' },
  { nombre: 'Ensayo — memoria Dorace.pdf', categoria: 'Ensayo', autor: 'Lía Cruz', fecha: '20 abr 2026', acceso: 'Miembros', biblioteca: 'Comunidad' },
  { nombre: 'Balance Q2 2026.xlsx', categoria: 'Finanzas', autor: 'Tesorero', fecha: '1 jul 2026', acceso: 'Administración', biblioteca: 'Administración' },
]

/* ── Marketplace ────────────────────────────────────────────── */
export const productos = [
  { id: 'lamina-rana', nombre: 'Lámina "La rana que volvió"', categoria: 'Arte', precio: 25, miembro: 'Ana López', ubicacion: 'David', colores: ['#00735e', '#00e6bc'], estado: 'Publicado', descripcion: 'Lámina fine-art numerada, 30×40 cm, impresa en papel algodón.' },
  { id: 'ep-raiz', nombre: 'EP "Raíz" — vinilo', categoria: 'Música', precio: 40, miembro: 'Marco Vega', ubicacion: 'Boquete', colores: ['#002420', '#00735e'], estado: 'Publicado', descripcion: 'Vinilo de edición limitada con el EP debut. Incluye descarga digital.' },
  { id: 'print-doraces', nombre: 'Serie de prints "Doraces"', categoria: 'Arte', precio: 18, miembro: 'Darío Pinto', ubicacion: 'David', colores: ['#00735e', '#d9f2c2'], estado: 'Publicado', descripcion: 'Set de 3 prints A5 con motivos ancestrales resignificados.' },
  { id: 'tote-boeshiri', nombre: 'Tote bag serigrafiado', categoria: 'Textil', precio: 12, miembro: 'Ana López', ubicacion: 'David', colores: ['#d67a63', '#e60035'], estado: 'Publicado', descripcion: 'Bolsa de tela con estampado a mano. 100% algodón.' },
  { id: 'foto-analoga', nombre: 'Print fotográfico analógico', categoria: 'Fotografía', precio: 30, miembro: 'Kim Araúz', ubicacion: 'David', colores: ['#d67a63', '#002420'], estado: 'Publicado', descripcion: 'Copia en gelatina de plata, 20×25 cm, firmada.' },
  { id: 'poemario', nombre: 'Poemario "Tierra roja"', categoria: 'Editorial', precio: 15, miembro: 'Lía Cruz', ubicacion: 'Boquete', colores: ['#e60035', '#d67a63'], estado: 'Vendido', descripcion: 'Edición artesanal cosida a mano, 60 páginas.' },
]

export const categoriasProducto = ['Todo', 'Arte', 'Música', 'Textil', 'Fotografía', 'Editorial']

/* ── Finanzas ───────────────────────────────────────────────── */
export const finanzas = {
  balance: 1840.5,
  ingresos: 3200,
  egresos: 1359.5,
  movimientos: [
    { fecha: '19 jul 2026', concepto: 'Aporte evento Kara Coffe', tipo: 'Ingreso', monto: 250 },
    { fecha: '12 jul 2026', concepto: 'Materiales de mural', tipo: 'Egreso', monto: -180 },
    { fecha: '5 jul 2026', concepto: 'Cuotas de miembros', tipo: 'Ingreso', monto: 420 },
    { fecha: '1 jul 2026', concepto: 'Impresión de afiches', tipo: 'Egreso', monto: -95 },
    { fecha: '28 jun 2026', concepto: 'Venta de láminas', tipo: 'Ingreso', monto: 300 },
  ],
}

/* ── Transparencia (artículos oficiales de la Junta) ────────── */
export const articulosOficiales = [
  { titulo: 'Resultados del primer semestre 2026', categoria: 'Informe', fecha: '15 jul 2026', estado: 'Publicado', cuerpo: 'Resumen de actividades, alcance y aprendizajes del semestre.' },
  { titulo: 'Nuevas comisiones abiertas', categoria: 'Aviso', fecha: '1 jul 2026', estado: 'Publicado', cuerpo: 'Se abre convocatoria interna para coordinar la comisión de Tecnología.' },
  { titulo: 'Actualización del reglamento interno', categoria: 'Normativa', fecha: '10 jun 2026', estado: 'Oculto', cuerpo: 'Borrador de ajustes al reglamento, pendiente de aprobación.' },
]

/* ── Roles y permisos (Super Admin) ─────────────────────────── */
export const permisos = [
  'Ver panel de administración',
  'Aprobar / rechazar postulantes',
  'Publicar noticias',
  'Gestionar eventos',
  'Editar finanzas',
  'Moderar publicaciones',
  'Gestionar roles y permisos',
  'Ver auditoría',
]

export const roles = [
  { nombre: 'Miembro', usuarios: 24, permisos: [], color: 'tea' },
  { nombre: 'Periodista', usuarios: 3, permisos: ['Publicar noticias'], color: 'terracotta' },
  { nombre: 'Recursos Humanos', usuarios: 2, permisos: ['Aprobar / rechazar postulantes'], color: 'caribbean' },
  { nombre: 'Tesorero', usuarios: 1, permisos: ['Ver panel de administración', 'Editar finanzas'], color: 'rainforest' },
  { nombre: 'Junta Directiva', usuarios: 4, permisos: ['Ver panel de administración', 'Aprobar / rechazar postulantes', 'Publicar noticias', 'Gestionar eventos', 'Moderar publicaciones'], color: 'jungle' },
  { nombre: 'Super Administrador', usuarios: 1, permisos: ['Todos'], color: 'candy' },
]

/* ── Auditoría (Super Admin) ────────────────────────────────── */
export const auditoria = [
  { fecha: '20 jul 2026 · 14:32', actor: 'Ana López', accion: 'Publicó', objeto: 'Artículo "Refugio cultural"' },
  { fecha: '20 jul 2026 · 11:05', actor: 'Junta Directiva', accion: 'Aprobó postulante', objeto: 'Nadia Ortega' },
  { fecha: '19 jul 2026 · 18:20', actor: 'Darío Pinto', accion: 'Editó finanzas', objeto: 'Movimiento +$300' },
  { fecha: '19 jul 2026 · 09:12', actor: 'Super Admin', accion: 'Asignó rol', objeto: 'Periodista → Marco Vega' },
  { fecha: '18 jul 2026 · 16:47', actor: 'Junta Directiva', accion: 'Ocultó', objeto: 'Publicación fuera de lineamientos' },
]
