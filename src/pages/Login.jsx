import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import ReenviarVerificacion from '../components/ReenviarVerificacion'
import { useSession } from '../auth/SessionContext'
import { useToast } from '../components/Toast'

const inputBase =
  'w-full rounded-xl border border-tea/15 bg-jungle-deep/50 px-4 py-3 text-cream placeholder:text-tea/40 backdrop-blur transition focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/30'
const labelBase = 'font-display text-xs font-semibold uppercase tracking-[0.2em] text-caribbean'

export default function Login() {
  const { login } = useSession()
  const navigate = useNavigate()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  // La API responde 403 con este motivo cuando la cuenta existe pero el correo
  // sigue sin confirmar: es el único caso en que ofrecer el reenvío tiene sentido.
  const [sinVerificar, setSinVerificar] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setSinVerificar(false)
    try {
      await login(email.trim(), password)
      toast.success('¡Bienvenido de vuelta!')
      navigate('/panel')
    } catch (err) {
      toast.error(err.message || 'No se pudo iniciar sesión.')
      if (err.status === 403 && /verificar tu correo/i.test(err.message || '')) setSinVerificar(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="bg-dorace-pattern relative flex min-h-screen items-center overflow-hidden bg-jungle pt-16">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[40rem] w-[40rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
      <div className="relative mx-auto w-full max-w-md px-5 py-20">
        <Reveal className="text-center">
          <FrogIcon className="mx-auto h-16 w-16 text-caribbean" />
          <p className="mt-6 font-display text-sm uppercase tracking-[0.3em] text-caribbean">
            Panel del colectivo
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-cream md:text-5xl">
            Iniciar sesión
          </h1>
        </Reveal>

        <Reveal delay={120} as="form" onSubmit={submit} className="mt-10 space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={labelBase}>Correo</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className={inputBase}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className={labelBase}>Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              className={inputBase}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-caribbean px-7 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </Reveal>

        {sinVerificar && (
          <div className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/10 p-5 text-center">
            <p className="text-sm leading-relaxed text-tea/80">
              Tu cuenta existe, pero el correo sigue sin confirmar. Sin eso no puedes entrar.
            </p>
            <div className="mt-3">
              <ReenviarVerificacion email={email} compacto />
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-tea/60">
          ¿No tienes cuenta?{' '}
          <Link to="/postularme" className="font-semibold text-caribbean underline-offset-4 hover:underline">
            Postúlate aquí
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-tea/50">
          <Link to="/" className="underline-offset-4 hover:underline">Volver al sitio público</Link>
        </p>
      </div>
    </section>
  )
}
