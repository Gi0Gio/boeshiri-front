import { Link, useNavigate } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'
import { useSession, ROLES } from '../auth/SessionContext'

const orden = ['miembro', 'junta', 'superadmin']
const acento = {
  miembro: 'group-hover:border-caribbean',
  junta: 'group-hover:border-terracotta',
  superadmin: 'group-hover:border-candy',
}

export default function Login() {
  const { setRol } = useSession()
  const navigate = useNavigate()

  const entrar = (rol) => {
    setRol(rol)
    navigate('/panel')
  }

  return (
    <section className="bg-dorace-pattern relative flex min-h-screen items-center overflow-hidden bg-jungle pt-16">
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[40rem] w-[40rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />
      <div className="relative mx-auto w-full max-w-3xl px-5 py-20">
        <Reveal className="text-center">
          <FrogIcon className="mx-auto h-16 w-16 text-caribbean" />
          <p className="mt-6 font-display text-sm uppercase tracking-[0.3em] text-caribbean">
            Panel del colectivo
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-cream md:text-5xl">
            Iniciar sesión
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-tea/70">
            Demo sin backend: elige con qué rol quieres entrar para explorar cada vista del sistema.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {orden.map((rol, i) => (
            <Reveal
              as="button"
              key={rol}
              delay={i * 120}
              onClick={() => entrar(rol)}
              className={`group rounded-2xl border border-tea/15 bg-jungle-deep/50 p-6 text-left backdrop-blur transition hover:-translate-y-1 ${acento[rol]}`}
            >
              <FrogIcon className="h-9 w-9 text-tea/40 transition-colors group-hover:text-caribbean" />
              <h2 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-cream">
                {ROLES[rol].label}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-tea/60">{ROLES[rol].desc}</p>
              <span className="mt-4 inline-block font-display text-xs font-semibold uppercase tracking-[0.18em] text-caribbean">
                Entrar →
              </span>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-tea/50">
          ¿Solo mirando?{' '}
          <Link to="/" className="font-semibold text-caribbean underline-offset-4 hover:underline">
            Volver al sitio público
          </Link>
        </p>
      </div>
    </section>
  )
}
