/**
 * Textos institucionales del sitio público. Cada bloque dice de qué documento sale
 * (vault de Obsidian, `1. Proyectos/Boeshiri`): nada de aquí se inventa. Si un
 * documento cambia, se cambia aquí a mano.
 *
 * Pendiente del colectivo: misión y visión aprobadas (la nota «Identidad Boeshiri»
 * tiene los títulos pero aún no el texto) y la historia con fechas reales.
 */

/* ─────────────────────────────────────────────────────────────
 * HOME — «¿Qué es Boesh Irí?»
 * Estatutos, art. 3 (objetivos) y la intención de Garabateo.
 * ──────────────────────────────────────────────────────────── */

export const pilares = [
  {
    titulo: 'Cultura y artes',
    texto:
      'Promovemos la cultura y las artes en Chiriquí con proyectos culturales y comunitarios, hechos con la gente y para la gente.',
  },
  {
    titulo: 'Espacios para crear',
    texto:
      'Abrimos espacios de expresión y aprendizaje donde nadie mide tu nivel: lo que importa es crear, compartir y disfrutar el proceso.',
  },
  {
    titulo: 'Participación',
    texto:
      'Fortalecemos la participación ciudadana mediante actividades artísticas. Quien se suma no solo asiste: propone, organiza y crea con el colectivo.',
  },
]

/** Garabateo: ARCANA se hace en KARA COFFEE SHOP & DELI (David). */
export const colaboradores = ['Kara Coffee']

/* ─────────────────────────────────────────────────────────────
 * SOBRE
 * ──────────────────────────────────────────────────────────── */

/** Estatutos, arts. 2 y 3. */
export const identidad = {
  naturaleza:
    'Boesh Irí es un colectivo cultural independiente y participativo, dedicado a promover el arte, la cultura y el desarrollo creativo de la comunidad.',
  objetivos: [
    'Promover la cultura y las artes.',
    'Fomentar espacios de expresión y aprendizaje.',
    'Impulsar proyectos culturales y comunitarios.',
    'Fortalecer la participación ciudadana mediante actividades artísticas.',
  ],
}

/** Código de Ética, «Principios». */
export const principios = [
  { titulo: 'Respeto', texto: 'Por las personas y por la diversidad.' },
  { titulo: 'Honestidad', texto: 'Integridad en todo lo que hacemos en nombre del colectivo.' },
  { titulo: 'Transparencia', texto: 'En la toma de decisiones y en el manejo de los recursos.' },
  { titulo: 'Responsabilidad', texto: 'Con el patrimonio cultural y artístico.' },
  { titulo: 'Colaboración', texto: 'Trabajamos en equipo.' },
  { titulo: 'Compromiso', texto: 'Con el desarrollo del colectivo y de la comunidad.' },
]

/** Eventos/Garabateando/Garabateo.md: qué es y cómo transcurre una edición. */
export const garabateo = {
  resumen:
    'Garabateo es nuestro evento de dibujo y pintura: un espacio accesible, creativo y seguro para expresarse sin sentirse juzgado por el nivel. Cada edición tiene su propia temática, los materiales están incluidos y un tallerista acompaña sin dirigir.',
  momentos: [
    { titulo: 'Bienvenida', texto: 'El tallerista presenta Boesh Irí y la temática de la edición.' },
    { titulo: 'Tiempo de creación', texto: 'Cada quien desarrolla libremente su dibujo o pintura, con el tallerista cerca para dudas y consejos.' },
    { titulo: 'Cierre', texto: 'Se comparten las obras: lo importante es lo que cada quien se lleva.' },
    { titulo: 'Concurso opcional', texto: 'Categorías y premios simbólicos para quien quiera participar. Es un extra, no el objetivo.' },
  ],
}
