# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Miembros del colectivo**: artistas, diseñadores y mentes alternativas de Chiriquí (unas 15–20 personas hoy). Entran al panel para ver sus grupos y tareas, publicar en el Mural y enterarse de gritos y avisos.
- **Junta Directiva**: los mismos miembros con cargo (Presidencia, Vicepresidencia, Tesorería, Secretaría). Además administran postulantes, miembros, comisiones, eventos, moderación, finanzas y transparencia.
- Miembros y Junta usan el panel con la misma frecuencia: tiene que servir igual de bien a los dos.
- **Visitantes** del sitio público: conocen el colectivo, exploran el Mural y la Comunidad, y pueden postularse.

## Product Purpose

Boesh Irí es un colectivo cultural independiente de Chiriquí, Panamá, que resignifica los símbolos de las raíces de la región (los Doraces, la rana) y crea refugios culturales para quien crea distinto. El sitio público muestra quiénes son y qué hacen; el panel es la herramienta con la que el colectivo se organiza por dentro. Éxito: que un miembro entre desde el celular, vea en segundos qué le toca en sus grupos y qué hay de nuevo, y pueda publicar sin perderse.

## Positioning

No es una red social ni un gestor de proyectos genérico: es la casa de un colectivo concreto, con su propia forma de organizarse (comisiones permanentes y equipos temporales) y su propio lenguaje (el Mural, los gritos).

## Operating Context

- El panel se usa **sobre todo desde el celular**.
- Tareas más frecuentes: grupos y tablero de tareas, publicar, gritos y avisos. Administrar es frecuente para la Junta.
- Organización: las **comisiones** son grupos permanentes con un coordinador; los **equipos** son grupos temporales dentro de una comisión. Cada grupo tiene un tablero de tareas (kanban).
- **Gritos**: planes abiertos que lanza un miembro, con lugar, hora, cupos y a veces cuota; caducan solos.
- Permisos por rol: miembro, Junta Directiva y superadministración (roles, auditoría, archivos).

## Capabilities and Constraints

- Stack existente: React 19, Vite, Tailwind CSS 4, React Router 7; API ASP.NET Core en Railway (`boeshiri-api`); despliegue en Netlify.
- Sesión con JWT corto renovado por cookie HttpOnly (30 días deslizantes), pendiente de desplegar.
- Disciplinas de los perfiles son texto libre; en la web se agrupan en familias por palabras clave hasta que la API tenga una lista cerrada.
- Quejas confirmadas sobre el panel actual: monótono, demasiada información, cosas repetidas, navegación complicada; en los grupos, demasiados datos, todo se ve igual y el tablero de tareas cuesta.

## Brand Commitments

- Nombre: **Boesh Irí**. Símbolos: la rana (patas espatulares) y el sol Dorace; patrón Dorace en secciones oscuras.
- Paleta oficial: jungle `#002420`, rainforest `#00735e`, caribbean `#00e6bc`, tea `#d9f2c2`, terracotta `#d67a63`, candy `#e60035`, cream `#f6fbef`.
- Tipografías: Oswald (display, sustituta de Alegre Sans), Montserrat (texto), JetBrains Mono (datos).
- Voz en español, cercana y con carácter («La rana escucha», «Te perdiste en la selva»).

## Evidence on Hand

- Contenido real en producción: 15 perfiles públicos (13 con foto), 3 publicaciones, 1 producto, 1 aliado (Kara Coffe), Junta con cargos.
- No hay todavía: eventos realizados, testimonios, WhatsApp ni Instagram oficiales. No inventarlos.

## Product Principles

1. Lo que le toca a cada quien primero: el panel abre en lo que la persona tiene que hacer o mirar hoy, no en un resumen de todo.
2. Cada cosa en un solo sitio: nada se repite entre secciones.
3. Pensado para el pulgar: el celular es el dispositivo principal.
4. El colectivo se reconoce: el panel es la misma casa que el sitio público, no una herramienta aparte.
5. Honestidad sobre el estado: con pocos datos o con errores, el panel lo dice en vez de rellenar.

## Accessibility & Inclusion

WCAG AA: contraste de texto ≥ 4.5:1, objetivos táctiles de 44px, nada por debajo de 12px, foco visible con teclado.
