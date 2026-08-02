import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import ReenviarVerificacion from '../components/ReenviarVerificacion'
import { authApi } from '../api/auth'

const btnPrimario =
  'inline-block rounded-full bg-caribbean px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,230,188,0.35)]'
const btnGhost =
  'inline-block rounded-full border border-tea/40 px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-tea transition hover:border-caribbean hover:text-caribbean'

/**
 * Aterrizaje del enlace de verificación del correo (RF-PUB-13b).
 * El correo apunta aquí (no a la API) para que el usuario vea una página de la
 * marca en lugar de la respuesta JSON del endpoint.
 */
export default function VerificarCorreo() {
  const [params] = useSearchParams()
  const token = params.get('token')
  // La API redirige aquí con ?estado= cuando el enlace se abrió contra ella
  // directamente: en ese caso ya verificó y el token está consumido, así que
  // volver a llamarla daría "inválido" sobre un éxito.
  const yaResuelto = params.get('estado')

  const [estado, setEstado] = useState(
    yaResuelto === 'ok' ? 'ok'
      : yaResuelto === 'invalido' ? 'error'
        : token ? 'verificando' : 'sin-token',
  )
  const [error, setError] = useState(
    yaResuelto === 'invalido' ? 'El enlace no es válido o ya se usó.' : null,
  )
  // StrictMode monta dos veces en desarrollo; sin esto el token se consume dos
  // veces y la segunda llamada responde "inválido o expirado" sobre un éxito.
  const yaEnviado = useRef(false)

  useEffect(() => {
    if (!token || yaResuelto || yaEnviado.current) return
    yaEnviado.current = true

    let activo = true
    authApi
      .verify(token)
      .then(() => activo && setEstado('ok'))
      .catch((e) => {
        if (!activo) return
        setError(e.message || 'No se pudo verificar el correo.')
        setEstado('error')
      })
    return () => { activo = false }
  }, [token, yaResuelto])

  return (
    <section className="bg-dorace-pattern relative flex min-h-screen items-center overflow-hidden bg-jungle pt-16">
      <div className="pointer-events-none absolute -right-32 top-10 h-[38rem] w-[38rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[34rem] w-[34rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />

      <div className="relative mx-auto w-full max-w-2xl px-4 py-16 sm:px-5">
        <Reveal className="rounded-3xl border border-tea/10 bg-jungle-deep/60 p-7 text-center backdrop-blur sm:p-10 md:p-12">

          {estado === 'verificando' && (
            <>
              <FrogIcon className="mx-auto h-16 w-16 animate-pulse text-caribbean sm:h-20 sm:w-20" />
              <h1 className="mt-6 font-display text-2xl font-semibold uppercase tracking-wide text-cream sm:text-3xl">
                Verificando tu correo…
              </h1>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-tea/70">
                Un momento, estamos confirmando tu dirección.
              </p>
            </>
          )}

          {estado === 'ok' && (
            <>
              <FrogIcon className="mx-auto h-16 w-16 text-caribbean sm:h-20 sm:w-20" />
              <p className="mt-6 font-display text-xs uppercase tracking-[0.3em] text-caribbean">Correo confirmado</p>
              <h1 className="mt-3 font-display text-3xl font-semibold uppercase leading-tight tracking-wide text-cream sm:text-4xl">
                ¡Listo! Ya eres postulante
              </h1>
              <p className="mx-auto mt-5 max-w-md leading-relaxed text-tea/80">
                Tu dirección quedó confirmada y tu postulación pasó a revisión de la Junta.
                Te avisaremos por aquí mismo cuando haya una decisión; mientras tanto puedes
                iniciar sesión para ver su estado.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link to="/login" className={btnPrimario}>Iniciar sesión</Link>
                <Link to="/explorar" className={btnGhost}>Explorar el colectivo</Link>
              </div>
            </>
          )}

          {estado === 'error' && (
            <>
              <FrogIcon className="mx-auto h-16 w-16 text-terracotta sm:h-20 sm:w-20" />
              <p className="mt-6 font-display text-xs uppercase tracking-[0.3em] text-terracotta">No se pudo confirmar</p>
              <h1 className="mt-3 font-display text-2xl font-semibold uppercase leading-tight tracking-wide text-cream sm:text-3xl">
                El enlace no es válido
              </h1>
              <p className="mx-auto mt-5 max-w-md leading-relaxed text-tea/80">{error}</p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-tea/50">
                Los enlaces caducan a las 24 horas y solo sirven una vez. Si ya lo habías
                abierto antes, tu correo puede estar confirmado: prueba a iniciar sesión.
              </p>

              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-tea/10 bg-jungle/60 p-5 text-left">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-caribbean">
                  ¿Caducó tu enlace?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-tea/60">
                  Escribe tu correo y te mandamos uno nuevo.
                </p>
                <ReenviarVerificacion />
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/login" className={btnPrimario}>Iniciar sesión</Link>
                <Link to="/contacto" className={btnGhost}>Escríbenos</Link>
              </div>
            </>
          )}

          {estado === 'sin-token' && (
            <>
              <FrogIcon className="mx-auto h-16 w-16 text-tea/40 sm:h-20 sm:w-20" />
              <h1 className="mt-6 font-display text-2xl font-semibold uppercase tracking-wide text-cream sm:text-3xl">
                Falta el enlace de verificación
              </h1>
              <p className="mx-auto mt-4 max-w-md leading-relaxed text-tea/70">
                Esta página se abre desde el correo que te enviamos al registrarte. Ábrela
                desde ahí, o postúlate si aún no tienes cuenta.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link to="/postularme" className={btnPrimario}>Postularme</Link>
                <Link to="/login" className={btnGhost}>Iniciar sesión</Link>
              </div>
            </>
          )}

        </Reveal>
      </div>
    </section>
  )
}
