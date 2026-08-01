import { createContext, useContext, useState, useCallback } from 'react'

const ConfirmCtx = createContext(null)

/**
 * Diálogo de confirmación de marca (reemplaza window.confirm).
 * Uso: const confirm = useConfirm(); if (!(await confirm({ message, danger }))) return
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null) // { opts, resolve }

  const confirm = useCallback((opts) => new Promise((resolve) => {
    setState({ opts: typeof opts === 'string' ? { message: opts } : (opts || {}), resolve })
  }), [])

  const cerrar = (val) => {
    state?.resolve(val)
    setState(null)
  }

  const o = state?.opts ?? {}
  const danger = !!o.danger

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-jungle-deep/70 backdrop-blur-sm" onClick={() => cerrar(false)} />
          <div className="toast-in relative w-full max-w-md rounded-2xl border border-tea/10 bg-jungle p-7 shadow-2xl">
            <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-cream">{o.title || (danger ? '¿Estás seguro?' : 'Confirmar')}</h3>
            {o.message && <p className="mt-2 text-sm leading-relaxed text-tea/70">{o.message}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => cerrar(false)} className="rounded-full border border-tea/20 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-tea/70 transition hover:border-tea/40 hover:text-tea">
                {o.cancelLabel || 'Cancelar'}
              </button>
              <button
                onClick={() => cerrar(true)}
                autoFocus
                className={`rounded-full px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition hover:-translate-y-0.5 ${danger ? 'bg-candy text-white hover:bg-terracotta' : 'bg-caribbean text-jungle'}`}
              >
                {o.confirmLabel || (danger ? 'Eliminar' : 'Confirmar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx)
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ConfirmProvider')
  return ctx
}
