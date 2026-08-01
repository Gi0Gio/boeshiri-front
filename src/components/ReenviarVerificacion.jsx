import { useState } from 'react'
import { authApi } from '../api/auth'
import { useToast } from './Toast'

/**
 * Pide un enlace de verificación nuevo (RF-PUB-13b).
 *
 * La API responde lo mismo exista o no la cuenta —para no revelar quién está
 * registrado—, así que aquí tampoco se promete que el correo vaya a llegar: se
 * repite el mensaje condicional que devuelve el servidor.
 *
 * `email` inicial: en Login ya se conoce; en la página de verificación no, y hay
 * que pedirlo.
 */
export default function ReenviarVerificacion({ email: emailInicial = '', compacto = false }) {
  const toast = useToast()
  const [email, setEmail] = useState(emailInicial)
  const [busy, setBusy] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function reenviar(e) {
    e?.preventDefault()
    if (!email.trim()) { toast.error('Escribe tu correo.'); return }

    setBusy(true)
    try {
      const res = await authApi.resendVerification(email.trim())
      setEnviado(true)
      toast.success(res?.mensaje || 'Si esa dirección tiene una cuenta sin verificar, te enviamos un enlace nuevo.')
    } catch (err) {
      toast.error(err.message || 'No se pudo reenviar el enlace.')
    } finally {
      setBusy(false)
    }
  }

  if (enviado) {
    return (
      <p className="text-sm leading-relaxed text-tea/70">
        Listo. Si esa dirección tiene una cuenta sin verificar, el enlace nuevo va en camino.
        Revisa también la carpeta de spam.
      </p>
    )
  }

  // En Login el correo ya está escrito arriba: pedirlo otra vez sería absurdo.
  if (compacto) {
    return (
      <button
        type="button"
        onClick={reenviar}
        disabled={busy}
        className="font-semibold text-caribbean underline-offset-4 transition hover:underline disabled:opacity-60"
      >
        {busy ? 'Enviando…' : 'Reenviar enlace de verificación'}
      </button>
    )
  }

  return (
    <form onSubmit={reenviar} className="mt-4 flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        className="w-full rounded-xl border border-tea/15 bg-jungle-deep/50 px-4 py-3 text-base text-cream placeholder:text-tea/40 transition focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/30"
      />
      <button
        type="submit"
        disabled={busy}
        className="flex-none rounded-full bg-caribbean px-7 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Enviando…' : 'Reenviar'}
      </button>
    </form>
  )
}
