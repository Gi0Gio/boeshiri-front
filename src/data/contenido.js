/**
 * Contenido de ejemplo para la versión de revisión.
 * TODO: reemplazar por contenido real (y más adelante, por el backend).
 */

export const pilares = [
  {
    titulo: 'Identidad con intención',
    texto:
      'Creemos en la estética con trasfondo. Resignificamos los símbolos de nuestras raíces —como los Doraces y la rana— y los sembramos con orgullo en el presente.',
  },
  {
    titulo: 'Refugios culturales',
    texto:
      'No solo hacemos eventos: diseñamos espacios donde artistas, diseñadores y mentes alternativas se sienten vistos, respetados e integrados.',
  },
  {
    titulo: 'Espíritu comunitario',
    texto:
      'El colectivo se debe a la gente. Creamos con la comunidad y para la comunidad, validando siempre su voz.',
  },
]

export const publicaciones = [
  {
    tipo: 'Evento',
    fecha: '19 de julio',
    titulo: 'Arte en Kara Coffe',
    resumen:
      'Una tarde de arte en Kara Coffe: exposición, creación en vivo y comunidad alrededor del café.',
  },
  {
    tipo: 'Noticia',
    fecha: '4 de julio',
    titulo: 'Karaoke: Fuera de Tono',
    resumen:
      'Menos pose, más canto. Existe karaoke y cantamos, no juzgamos. Ambiente musical y selección abierta.',
  },
  {
    tipo: 'Blog',
    fecha: 'Serie cultural',
    titulo: '¿Quiénes fueron los Doraces?',
    resumen:
      'Cuando se borra la historia, se debilita el alma de un pueblo. Descubre la historia detrás de nuestros símbolos.',
  },
]

export const colaboradores = [
  'Kara Coffe',
  'Tu negocio aquí',
  'Café aliado',
  'Estudio creativo',
  'Marca local',
  'Espacio cultural',
]

/* ─────────────────────────────────────────────────────────────
 * SOBRE — misión, visión, valores, historia y equipo
 * ──────────────────────────────────────────────────────────── */

export const misionVision = {
  mision:
    'Tejer una comunidad donde el arte y la memoria de Chiriquí se encuentren: crear espacios, experiencias y contenido que resignifiquen nuestras raíces y den refugio a las mentes creativas de la región.',
  vision:
    'Ser el puente vivo entre el pasado ancestral y la escena cultural contemporánea de Panamá — un colectivo referente que la gente reconoce, en el que confía y al que quiere pertenecer.',
}

export const valores = [
  { titulo: 'Raíz', texto: 'Todo lo que hacemos nace de nuestra historia y nuestro territorio.' },
  { titulo: 'Refugio', texto: 'Un lugar seguro para quien crea distinto y piensa distinto.' },
  { titulo: 'Verdad', texto: 'Estética con trasfondo: nada es decorativo por decorar.' },
  { titulo: 'Comunidad', texto: 'La voz de la gente valida y da forma a cada proyecto.' },
]

export const hitos = [
  {
    año: '2023',
    titulo: 'La primera chispa',
    texto: 'Un grupo de amigos artistas empieza a reunirse para hablar de identidad chiricana.',
  },
  {
    año: '2024',
    titulo: 'Nace Boesh Irí',
    texto: 'Se define el nombre, la rana Dorace como símbolo y los primeros pilares del colectivo.',
  },
  {
    año: '2025',
    titulo: 'Primeros refugios',
    texto: 'Arrancan los eventos en espacios aliados: exposiciones, karaoke y creación en vivo.',
  },
  {
    año: '2026',
    titulo: 'La comunidad crece',
    texto: 'Se abre la convocatoria a nuevos miembros y se estructura el colectivo hacia el futuro.',
  },
]

/* ─────────────────────────────────────────────────────────────
 * PERFILES — galería de miembros (cada uno con página propia)
 * `colores` = par de la paleta para el gradiente del retrato.
 * ──────────────────────────────────────────────────────────── */

export const perfiles = [
  {
    slug: 'ana-lopez',
    nombre: 'Ana López',
    disciplina: 'Muralismo',
    rol: 'Cofundadora',
    ubicacion: 'David, Chiriquí',
    colores: ['#00735e', '#00e6bc'],
    bio: 'Traduce símbolos ancestrales a muros de gran escala.',
    bioLarga:
      'Ana pinta la memoria en las paredes de la ciudad. Su trabajo parte de la iconografía Dorace —la rana, el sol, las espirales— para llenar de color los espacios públicos de David. Cree que un mural no decora: recuerda.',
    obras: [
      { titulo: 'La rana que volvió', tipo: 'Mural · 12m', año: '2025' },
      { titulo: 'Sol de guerra', tipo: 'Mural · fachada', año: '2024' },
      { titulo: 'Espirales', tipo: 'Serie de bocetos', año: '2024' },
    ],
    redes: { instagram: '@ana.murales', web: 'analopez.art' },
    destacado: true,
  },
  {
    slug: 'marco-vega',
    nombre: 'Marco Vega',
    disciplina: 'Música',
    rol: 'Productor',
    ubicacion: 'Boquete, Chiriquí',
    colores: ['#002420', '#00735e'],
    bio: 'Fusiona percusión tradicional con texturas electrónicas.',
    bioLarga:
      'Marco produce paisajes sonoros donde el tambor chiricano se encuentra con el sintetizador. Cada pista es un experimento sobre cómo suena la identidad cuando mira al futuro sin soltar la raíz.',
    obras: [
      { titulo: 'Raíz (EP)', tipo: 'Producción musical', año: '2025' },
      { titulo: 'Tambor eléctrico', tipo: 'Sencillo', año: '2025' },
    ],
    redes: { instagram: '@marcovega.snd', web: 'marcovega.fm' },
    destacado: true,
  },
  {
    slug: 'kim-arauz',
    nombre: 'Kim Araúz',
    disciplina: 'Fotografía',
    rol: 'Documentalista',
    ubicacion: 'David, Chiriquí',
    colores: ['#d67a63', '#e60035'],
    bio: 'Retrata la vida cultural de Chiriquí en película.',
    bioLarga:
      'Kim documenta el colectivo desde adentro: los ensayos, los montajes, las manos que crean. Trabaja en película porque cree que el grano guarda algo que lo digital no alcanza.',
    obras: [
      { titulo: 'Detrás del mural', tipo: 'Ensayo fotográfico', año: '2025' },
      { titulo: 'Gente de café', tipo: 'Serie documental', año: '2024' },
    ],
    redes: { instagram: '@kim.film' },
    destacado: false,
  },
  {
    slug: 'sol-medina',
    nombre: 'Sol Medina',
    disciplina: 'Danza',
    rol: 'Coreógrafa',
    ubicacion: 'David, Chiriquí',
    colores: ['#00e6bc', '#d9f2c2'],
    bio: 'Movimiento contemporáneo con memoria de tierra.',
    bioLarga:
      'Sol crea coreografías que dialogan con el territorio. Su lenguaje mezcla danza contemporánea con gestos rituales, buscando cómo se mueve un cuerpo que carga una historia.',
    obras: [
      { titulo: 'Territorio', tipo: 'Pieza escénica', año: '2025' },
      { titulo: 'Barro', tipo: 'Improvisación filmada', año: '2024' },
    ],
    redes: { instagram: '@sol.mueve' },
    destacado: false,
  },
  {
    slug: 'dario-pinto',
    nombre: 'Darío Pinto',
    disciplina: 'Diseño gráfico',
    rol: 'Director de arte',
    ubicacion: 'David, Chiriquí',
    colores: ['#00735e', '#d9f2c2'],
    bio: 'Da forma a la identidad visual del colectivo.',
    bioLarga:
      'Darío es la mano detrás del sistema visual de Boesh Irí. Vectorizó la rana, definió la paleta y construye la coherencia gráfica que hace que todo se sienta parte de lo mismo.',
    obras: [
      { titulo: 'Identidad Boesh Irí', tipo: 'Branding', año: '2024' },
      { titulo: 'Carteles de temporada', tipo: 'Serie de afiches', año: '2025' },
    ],
    redes: { instagram: '@dario.dsgn', web: 'dariopinto.co' },
    destacado: true,
  },
  {
    slug: 'lia-cruz',
    nombre: 'Lía Cruz',
    disciplina: 'Poesía',
    rol: 'Gestora de contenido',
    ubicacion: 'Boquete, Chiriquí',
    colores: ['#e60035', '#d67a63'],
    bio: 'Escribe la voz del colectivo y sus historias.',
    bioLarga:
      'Lía pone en palabras lo que el colectivo siente. Escribe los textos, cura las historias y sostiene la serie cultural sobre los Doraces. La memoria, para ella, también es literatura.',
    obras: [
      { titulo: 'Cuando se borra la historia', tipo: 'Ensayo', año: '2025' },
      { titulo: 'Poemas de tierra roja', tipo: 'Poemario', año: '2024' },
    ],
    redes: { instagram: '@lia.escribe' },
    destacado: false,
  },
]

/* ─────────────────────────────────────────────────────────────
 * EXPLORAR — noticias, artículos, fotos, video y música
 * ──────────────────────────────────────────────────────────── */

export const noticias = [
  {
    tipo: 'Evento',
    fecha: '19 jul 2026',
    titulo: 'Arte en Kara Coffe',
    resumen:
      'Una tarde de exposición, creación en vivo y comunidad alrededor del café. Cupos limitados.',
    lugar: 'Kara Coffe, David',
  },
  {
    tipo: 'Noticia',
    fecha: '4 jul 2026',
    titulo: 'Karaoke: Fuera de Tono',
    resumen: 'Menos pose, más canto. Existe karaoke y cantamos, no juzgamos. Entrada libre.',
    lugar: 'Espacio aliado',
  },
  {
    tipo: 'Convocatoria',
    fecha: '1 jul 2026',
    titulo: 'Abrimos postulaciones 2026',
    resumen: 'Buscamos artistas, diseñadores y mentes alternativas para sumar al colectivo.',
    lugar: 'En línea',
  },
  {
    tipo: 'Evento',
    fecha: '20 jun 2026',
    titulo: 'Jam de tambor y sintes',
    resumen: 'Una noche donde la percusión tradicional se encuentra con la electrónica.',
    lugar: 'Boquete',
  },
]

export const articulos = [
  {
    categoria: 'Serie cultural',
    titulo: '¿Quiénes fueron los Doraces?',
    resumen:
      'Cuando se borra la historia, se debilita el alma de un pueblo. Un recorrido por el pueblo originario detrás de nuestros símbolos.',
    autor: 'Lía Cruz',
    lectura: '6 min',
    fecha: '10 jul 2026',
  },
  {
    categoria: 'Proceso',
    titulo: 'Cómo vectorizamos la rana',
    resumen:
      'Del brand sheet al ícono que ves en toda la web: el proceso de convertir un símbolo ancestral en identidad viva.',
    autor: 'Darío Pinto',
    lectura: '4 min',
    fecha: '2 jul 2026',
  },
  {
    categoria: 'Comunidad',
    titulo: 'Qué significa ser un refugio cultural',
    resumen:
      'No basta con hacer eventos. Reflexionamos sobre lo que implica diseñar espacios donde la gente creativa se sienta vista.',
    autor: 'Ana López',
    lectura: '5 min',
    fecha: '24 jun 2026',
  },
]

export const fotos = [
  { titulo: 'Montaje del mural', autor: 'Kim Araúz', colores: ['#00735e', '#00e6bc'], alto: true },
  { titulo: 'Café y creación', autor: 'Kim Araúz', colores: ['#d67a63', '#e60035'], alto: false },
  { titulo: 'Ensayo de Territorio', autor: 'Kim Araúz', colores: ['#002420', '#00735e'], alto: false },
  { titulo: 'Tambor eléctrico', autor: 'Kim Araúz', colores: ['#00e6bc', '#d9f2c2'], alto: true },
  { titulo: 'Manos de barro', autor: 'Kim Araúz', colores: ['#d9f2c2', '#00735e'], alto: false },
  { titulo: 'Sol de guerra', autor: 'Kim Araúz', colores: ['#e60035', '#d67a63'], alto: true },
  { titulo: 'Comunidad en Kara', autor: 'Kim Araúz', colores: ['#00735e', '#002420'], alto: false },
  { titulo: 'Detrás del cartel', autor: 'Kim Araúz', colores: ['#00e6bc', '#00735e'], alto: false },
]

export const videos = [
  {
    titulo: 'Territorio — pieza escénica',
    autor: 'Sol Medina',
    duracion: '4:12',
    categoria: 'Danza',
    colores: ['#00e6bc', '#002420'],
  },
  {
    titulo: 'Detrás del mural',
    autor: 'Kim Araúz',
    duracion: '2:48',
    categoria: 'Documental',
    colores: ['#d67a63', '#002420'],
  },
  {
    titulo: 'Jam de tambor y sintes',
    autor: 'Marco Vega',
    duracion: '6:30',
    categoria: 'Música en vivo',
    colores: ['#00735e', '#002420'],
  },
]

export const canciones = [
  { titulo: 'Raíz', artista: 'Marco Vega', duracion: '3:41', genero: 'Electrónica raíz' },
  { titulo: 'Tambor eléctrico', artista: 'Marco Vega', duracion: '4:05', genero: 'Fusión' },
  { titulo: 'Tierra roja', artista: 'Lía Cruz & Marco Vega', duracion: '2:57', genero: 'Spoken word' },
  { titulo: 'Boquete de noche', artista: 'Marco Vega', duracion: '5:12', genero: 'Ambient' },
]

/* ─────────────────────────────────────────────────────────────
 * EVENTOS — próximos e historial de realizados
 * `categoria` mapea a un color de chip en la página de eventos.
 * ──────────────────────────────────────────────────────────── */

export const eventosProximos = [
  {
    slug: 'noche-raiz',
    titulo: 'Noche Raíz — lanzamiento del EP',
    categoria: 'Música',
    dia: '09',
    mes: 'Ago',
    diaSemana: 'Sábado',
    año: '2026',
    hora: '7:00 PM',
    lugar: 'Kara Coffe',
    ciudad: 'David, Chiriquí',
    entrada: 'Entrada libre',
    colores: ['#00735e', '#00e6bc'],
    descripcion:
      'Marco Vega presenta en vivo su EP "Raíz": percusión tradicional y texturas electrónicas, con visuales del colectivo y café hasta tarde.',
    destacado: true,
  },
  {
    slug: 'mural-vivo',
    titulo: 'Mural en vivo: La rana que volvió',
    categoria: 'Exposición',
    dia: '23',
    mes: 'Ago',
    diaSemana: 'Domingo',
    año: '2026',
    hora: '4:00 PM',
    lugar: 'Parque Cervantes',
    ciudad: 'David, Chiriquí',
    entrada: 'Gratis · todo público',
    colores: ['#d67a63', '#e60035'],
    descripcion:
      'Ana López pinta un mural de 12 metros frente al público. Ven a ver cómo un símbolo ancestral cobra vida sobre la pared.',
    destacado: false,
  },
  {
    slug: 'taller-serigrafia',
    titulo: 'Taller de serigrafía chiricana',
    categoria: 'Taller',
    dia: '06',
    mes: 'Sep',
    diaSemana: 'Sábado',
    año: '2026',
    hora: '10:00 AM',
    lugar: 'Estudio Boesh Irí',
    ciudad: 'David, Chiriquí',
    entrada: 'Cupos limitados · $15',
    colores: ['#00735e', '#002420'],
    descripcion:
      'Aprende a estampar tus propios diseños con motivos Dorace. Materiales incluidos; te llevas una pieza a casa.',
    destacado: false,
  },
]

export const eventosPasados = [
  {
    titulo: 'Arte en Kara Coffe',
    categoria: 'Exposición',
    fecha: '19 jul 2026',
    lugar: 'Kara Coffe, David',
    asistentes: 90,
    colores: ['#00735e', '#00e6bc'],
    recap: 'Exposición, creación en vivo y comunidad alrededor del café. Sala llena toda la tarde.',
  },
  {
    titulo: 'Karaoke: Fuera de Tono',
    categoria: 'Comunidad',
    fecha: '04 jul 2026',
    lugar: 'Espacio aliado',
    asistentes: 65,
    colores: ['#e60035', '#d67a63'],
    recap: 'Menos pose, más canto. Una noche sin juicios donde todos se animaron al micrófono.',
  },
  {
    titulo: 'Jam de tambor y sintes',
    categoria: 'Música',
    fecha: '20 jun 2026',
    lugar: 'Boquete',
    asistentes: 120,
    colores: ['#00735e', '#002420'],
    recap: 'La percusión tradicional se encontró con la electrónica en una sesión improvisada.',
  },
  {
    titulo: 'Charla: ¿Quiénes fueron los Doraces?',
    categoria: 'Charla',
    fecha: '31 may 2026',
    lugar: 'Biblioteca regional',
    asistentes: 70,
    colores: ['#d9f2c2', '#00735e'],
    recap: 'Lía Cruz abrió la serie cultural con un recorrido por el pueblo detrás de nuestros símbolos.',
  },
]

/* Cifras acumuladas del colectivo (ejemplo) */
export const cifrasEventos = [
  { valor: '14', etiqueta: 'Eventos realizados' },
  { valor: '+800', etiqueta: 'Asistentes' },
  { valor: '6', etiqueta: 'Espacios aliados' },
  { valor: '3', etiqueta: 'Años activos' },
]
