import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastCtx = createContext(null)

const TIPOS = {
  success: { color: '#00e6bc', icon: '✓' },
  error: { color: '#e60035', icon: '✕' },
  info: { color: '#9fb3ad', icon: 'i' },
  warning: { color: '#d67a63', icon: '!' },
}

/**
 * Sistema de avisos (toasts) global. Pila arriba-derecha, auto-cierre,
 * con la estética de marca. Uso: const toast = useToast(); toast.success('…').
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback((type, text, opts = {}) => {
    if (!text) return
    const id = ++idRef.current
    setToasts((t) => [...t.slice(-3), { id, type, text }])
    const ms = opts.duration ?? (type === 'error' ? 6000 : 4000)
    if (ms > 0) setTimeout(() => remove(id), ms)
    return id
  }, [remove])

  const toast = useRef({
    success: (t, o) => push('success', t, o),
    error: (t, o) => push('error', t, o),
    info: (t, o) => push('info', t, o),
    warning: (t, o) => push('warning', t, o),
  }).current

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const tipo = TIPOS[t.type] ?? TIPOS.info
          return (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className="toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-l-4 border-tea/10 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur"
              style={{ backgroundColor: 'rgba(0,17,14,0.92)', borderLeftColor: tipo.color }}
            >
              <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[0.7rem] font-bold" style={{ backgroundColor: tipo.color + '22', color: tipo.color }}>{tipo.icon}</span>
              <p className="flex-1 text-sm leading-snug text-cream">{t.text}</p>
              <button onClick={() => remove(t.id)} className="flex-none text-lg leading-none text-tea/40 transition hover:text-tea" aria-label="Cerrar">×</button>
            </div>
          )
        })}
      </div>
      {/* Entra desde arriba, no desde el lado: en móvil la pila ocupa casi todo
          el ancho y un desplazamiento lateral se sale de la pantalla. */}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-0.75rem) scale(.98)}to{opacity:1;transform:none}}.toast-in{animation:toastIn .24s cubic-bezier(.16,1,.3,1)}`}</style>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
