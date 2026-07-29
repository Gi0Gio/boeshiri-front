# Boesh Irí — Web (Frontend)

SPA del colectivo cultural **Boesh Irí** (Chiriquí, Panamá). Sitio público +
panel privado. Consume la API de [`boeshiri-api`](../boeshiri-api).

- **Stack:** React 19 · Vite · Tailwind CSS 4 · React Router 7
- **Deploy:** Netlify
- **Backend:** repo separado `boeshiri-api` (ASP.NET Core en Railway)
- **Documentación de ingeniería:** vault Obsidian → `1. Proyectos/Boeshiri/Web/v1/`

## Desarrollo

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo (Vite)
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
