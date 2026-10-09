import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { authApi } from '../api/auth'

const inputBase =
  'w-full rounded-xl border border-tea/15 bg-jungle-deep/50 px-4 py-3 text-base text-cream placeholder:text-tea/40 backdrop-blur transition focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/30'
const labelBase = 'font-display text-xs font-semibold uppercase tracking-[0.2em] text-caribbean'
const boton =
  'w-full rounded-full bg-caribbean px-7 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60'

function Marco({ eyebrow, titulo, children }) {
  return (
    <section className="bg-dorace-pattern relative flex min-h-screen items-center overflow-hidden bg-jungle pt-16">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[40rem] w-[40rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
      <div className="relative mx-auto w-full max-w-md px-5 py-20">
        <Reveal className="text-center">
          <FrogIcon className="mx-auto h-16 w-16 text-caribbean" />
          <p className="mt-6 font-display text-sm uppercase tracking-[0.3em] text-caribbean">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-cream md:text-5xl">{titulo}</h1>
        </Reveal>
        {children}
        <p className="mt-8 text-center text-sm text-tea/70">
          <Link to="/login" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Volver a iniciar sesión</Link>
        </p>
      </div>
    </section>
  )
}

/** Pedir el enlace para elegir una contraseña nueva. */
export function Recuperar() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [enviado, setEnviado] = useState(null)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const r = await authApi.forgotPassword(email.trim())
      setEnviado(r?.mensaje || 'Si esa dirección tiene una cuenta, te enviamos un enlace. Revisa tu correo.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Marco eyebrow="Panel del colectivo" titulo="Recuperar acceso">
      {enviado ? (
        <Reveal delay={120} className="mt-10 rounded-2xl border border-caribbean/30 bg-caribbean/10 p-6 text-center">
          <p className="leading-relaxed text-tea/90">{enviado}</p>
          <p className="mt-3 text-sm text-tea/70">El enlace sirve una vez y vence en una hora. Mira también en spam.</p>
        </Reveal>
      ) : (
        <Reveal delay={120} as="form" onSubmit={submit} className="mt-10 space-y-5">
          <p className="text-center leading-relaxed text-tea/80">
            Escribe el correo con el que entras y te mandamos un enlace para elegir una contraseña nueva.
          </p>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={labelBase}>Correo</label>
            <input id="email" type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className={inputBase} />
          </div>
          {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}
          <button type="submit" disabled={busy} className={boton}>{busy ? 'Enviando…' : 'Enviar enlace'}</button>
        </Reveal>
      )}
    </Marco>
  )
}

/** Elegir la contraseña nueva con el token del correo. */
export function Restablecer() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [clave, setClave] = useState('')
  const [repetida, setRepetida] = useState('')
  const [busy, setBusy] = useState(false)
  const [hecho, setHecho] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (clave !== repetida) {
      setError('Las dos contraseñas no coinciden.')
      return
    }
    setBusy(true)
    try {
      await authApi.resetPassword(token, clave)
      setHecho(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <Marco eyebrow="Panel del colectivo" titulo="Enlace incompleto">
        <Reveal delay={120} className="mt-10 text-center">
          <p className="leading-relaxed text-tea/80">A este enlace le falta una parte. Ábrelo de nuevo desde el correo o pide uno nuevo.</p>
          <Link to="/recuperar" className="mt-6 inline-flex min-h-11 items-center font-semibold text-caribbean underline-offset-4 hover:underline">Pedir un enlace nuevo</Link>
        </Reveal>
      </Marco>
    )
  }

  return (
    <Marco eyebrow="Panel del colectivo" titulo={hecho ? 'Listo' : 'Contraseña nueva'}>
      {hecho ? (
        <Reveal delay={120} className="mt-10 text-center">
          <p className="leading-relaxed text-tea/80">Tu contraseña cambió. Cerramos las sesiones que tenías abiertas: entra de nuevo con la nueva.</p>
          <Link to="/login" className={`${boton} mt-6 inline-block`}>Iniciar sesión</Link>
        </Reveal>
      ) : (
        <Reveal delay={120} as="form" onSubmit={submit} className="mt-10 space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="clave" className={labelBase}>Contraseña nueva</label>
            <input id="clave" type="password" required minLength={8} autoComplete="new-password" value={clave}
              onChange={(e) => setClave(e.target.value)} placeholder="Mínimo 8 caracteres" className={inputBase} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="repetida" className={labelBase}>Repítela</label>
            <input id="repetida" type="password" required minLength={8} autoComplete="new-password" value={repetida}
              onChange={(e) => setRepetida(e.target.value)} className={inputBase} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-terracotta">
              {error}{' '}
              {/vencí|válido/i.test(error) && <Link to="/recuperar" className="font-semibold underline">Pedir otro enlace</Link>}
            </p>
          )}
          <button type="submit" disabled={busy} className={boton}>{busy ? 'Guardando…' : 'Guardar contraseña'}</button>
        </Reveal>
      )}
    </Marco>
  )
}
