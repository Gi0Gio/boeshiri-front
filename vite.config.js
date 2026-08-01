import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Puerto fijo: la API solo permite CORS desde 5173/4173. Si Vite saltara a otro
  // puerto (p. ej. por sockets en TIME_WAIT), el front quedaría bloqueado por CORS.
  server: { host: 'localhost', port: 5173, strictPort: true },
})
