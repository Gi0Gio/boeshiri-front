# Boesh Irí — Web (Frontend)

SPA del colectivo cultural **Boesh Irí** (Chiriquí, Panamá). Sitio público +
panel privado. Consume la API de [`boeshiri-api`](../boeshiri-api).

- **Stack:** React 19 · Vite · Tailwind CSS 4 · React Router 7
- **Deploy:** Netlify
- **Backend:** repo separado `boeshiri-api` (ASP.NET Core en Railway)
- **Documentación de ingeniería:** vault Obsidian → `1. Proyectos/Boeshiri/Web/v1/`

## Qué es Boesh Irí

Boesh Irí es un colectivo cultural independiente de Chiriquí, Panamá, formado por
artistas, diseñadores y mentes alternativas. Toma los símbolos de las raíces de la
región, como los Doraces y la rana, y les da un sentido nuevo en el presente.
Organiza encuentros y eventos en espacios aliados donde quien crea distinto puede
sentirse visto e integrado.

Esta web es su casa en internet. Hacia fuera muestra quiénes son y qué están
haciendo, y por dentro es la herramienta con la que los miembros y la Junta
Directiva organizan el colectivo.

## Qué se puede hacer

### Cualquier visitante

- **Conocer el colectivo** (`/sobre`): misión, visión, valores, historia y la Junta
  Directiva con el cargo de cada quien.
- **Explorar** (`/explorar`): el Mural, una pared donde conviven publicaciones,
  noticias, artículos, fotos, video, música y productos de los miembros.
- **Ver la comunidad** (`/comunidad`): el directorio de miembros, filtrable por
  disciplina, con un perfil público por persona (`/perfil/:slug`).
- **Seguir la agenda** (`/eventos`): los próximos eventos y el historial.
- **Comprar o contratar** (`/marketplace`): los productos y servicios que ofrecen
  los miembros.
- **Escribir al colectivo** (`/contacto`) o **postularse como miembro**
  (`/postularme`): crear una cuenta y contar qué se crea y por qué se quiere entrar.
- **Compartir** cualquier publicación o evento con un enlace que se ve bien en
  redes.

### Miembros (con sesión iniciada, en `/panel`)

- Editar su perfil público y su portafolio.
- Publicar en el Mural: noticias, artículos, fotos, video y música.
- **Echar gritos**: llamados abiertos a otros miembros (buscar colaboradores,
  armar un plan, pedir una mano) con cupos y fecha de vencimiento.
- Participar en grupos y comisiones.
- Consultar la biblioteca de documentos del colectivo según lo que su rol puede abrir.
- Publicar y gestionar sus productos y servicios en el marketplace.

### Junta Directiva y administración

- Revisar postulaciones y gestionar miembros.
- Organizar las comisiones, crear eventos y llevar la asistencia.
- Moderar el contenido publicado.
- Llevar las finanzas y publicar informes de transparencia.
- Trabajar en el Espacio Junta, reservado a la directiva.

### Superadministración

- Definir roles y permisos.
- Revisar la auditoría de acciones.
- Gestionar los archivos subidos.

## Desarrollo

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo (Vite) → la API que diga .env
npm run dev:local # servidor de desarrollo → API local (http://localhost:8080)
npm run build     # build de producción → dist/
npm run preview   # previsualizar el build
```

## Estado

Prototipo visual conectándose progresivamente a la API. Ver el plan de migración
en el SDD (`v1/Diseno_Tecnico_Boeshiri.md` §10).

## MCP / trabajo asistido por IA

La configuración MCP de este repo (front) usa **Playwright** para pruebas E2E.
Copiar `.mcp.json.example` → `.mcp.json` para activarla. Ver la guía completa en
el vault: `v1/04-Entorno-y-Flujo-Asistido-IA.md`.
