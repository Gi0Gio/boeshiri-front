import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * `VITE_API_URL` se incrusta en el bundle al compilar: definirla DESPUÉS del build
 * no cambia nada, hay que reconstruir. Y si falta, el sitio se publica igualmente
 * y cae al respaldo `http://localhost:8080`, con lo que cada visitante intenta
 * llamar a su propio equipo. Ese fallo es invisible en el despliegue y solo se ve
 * en la consola del navegador del usuario, así que aquí se corta el build.
 */
function validarApiUrl(env) {
  const url = env.VITE_API_URL

  if (!url) {
    throw new Error(
      'Falta VITE_API_URL.\n' +
      'Defínela en las variables de entorno del hosting (en Netlify: Site configuration →\n' +
      'Environment variables) y vuelve a construir. Ejemplo:\n' +
      '  VITE_API_URL=https://boeshiri-api-production.up.railway.app',
    )
  }

  // El sitio se sirve por HTTPS: una API en HTTP la bloquea el navegador por
  // contenido mixto, sin aviso útil.
  if (!url.startsWith('https://')) {
    throw new Error(
      `VITE_API_URL debe usar https:// en producción (recibido: ${url}).\n` +
      'Con http:// el navegador bloquea las llamadas por contenido mixto.',
    )
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (command === 'build') validarApiUrl(env)

  return {
    plugins: [react(), tailwindcss()],
    // Puerto fijo: la API solo permite CORS desde 5173/4173. Si Vite saltara a otro
    // puerto (p. ej. por sockets en TIME_WAIT), el front quedaría bloqueado por CORS.
    server: { host: 'localhost', port: 5173, strictPort: true },
  }
})
