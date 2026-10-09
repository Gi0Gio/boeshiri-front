import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../auth/SessionContext'
import { authApi } from '../api/auth'
import { useToast } from '../components/Toast'
import FrogIcon from '../components/FrogIcon'

const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })

/** Qué decir según el estado. La API solo deja entrar a postulantes e inactivos además de activos. */
function textos(user) {
  if (user.solicitudEstado === 'Rechazada') {
    const desde = user.puedePostularseDesde ? new Date(user.puedePostularseDesde) : null
    const yaPuede = !desde || desde <= new Date()
    return {
      titulo: 'Tu solicitud no fue aprobada',
      cuerpo: yaPuede
        ? 'La Junta revisó tu postulación y esta vez no fue aprobada. Ya pasó el tiempo de espera: si quieres, puedes volver a postularte y tu solicitud regresará a revisión.'
        : `La Junta revisó tu postulación y esta vez no fue aprobada. Podrás volver a postularte a partir del ${fmtFecha(desde)}.`,
      repostular: yaPuede,
    }
  }
  if (user.status === 'Applicant') {
    return {
      titulo: 'Tu solicitud está en revisión',
      cuerpo: 'La Junta está revisando tu postulación. Cuando la apruebe, este panel se abrirá con tus grupos, tareas y publicaciones. Te avisaremos.',
    }
  }
  return {
    titulo: 'Tu cuenta está inactiva',
    cuerpo: 'Mientras tu cuenta esté inactiva no tienes acceso al panel. Si quieres volver a participar, escribe a la Junta.',
    contacto: true,
  }
}

/**
 * Lo que ve quien inició sesión pero aún no es miembro activo. Antes entraba al
 * panel completo y cada sección le respondía con un error.
 */
export default function EstadoCuenta() {
  const { user, logout, recargar } = useSession()
  const toast = useToast()
  const [enviando, setEnviando] = useState(false)
  const t = textos(user)

  const repostular = async () => {
    setEnviando(true)
    try {
      const r = await authApi.reapply()
      toast.success(r?.mensaje || 'Tu postulación vuelve a estar en revisión.')
      await recargar()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="modo-mio flex min-h-screen items-center bg-jungle-deep text-tea">
      <div className="mx-auto w-full max-w-lg px-4 py-16">
        <FrogIcon className="h-12 w-12 text-caribbean" />
        <p className="mt-6 text-sm text-tea/70">Hola, {user.fullName.split(' ')[0]}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold uppercase tracking-wide text-cream">{t.titulo}</h1>
        <p className="mt-4 leading-relaxed text-tea/80">{t.cuerpo}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {t.repostular && (
            <button
              type="button"
              onClick={repostular}
              disabled={enviando}
              className="min-h-11 rounded-full bg-caribbean px-6 font-display text-sm font-semibold uppercase tracking-[0.15em] text-jungle disabled:opacity-60"
            >
              {enviando ? 'Enviando…' : 'Volver a postularme'}
            </button>
          )}
          {t.contacto && (
            <Link to="/contacto" className="inline-flex min-h-11 items-center rounded-full bg-caribbean px-6 font-display text-sm font-semibold uppercase tracking-[0.15em] text-jungle">
              Escribir a la Junta
            </Link>
          )}
          <Link to="/" className="inline-flex min-h-11 items-center rounded-full border border-tea/20 px-6 text-sm font-semibold text-cream">
            Volver al sitio público
          </Link>
        </div>

        <button type="button" onClick={logout} className="mt-10 inline-flex min-h-11 items-center text-sm text-tea/70 underline-offset-4 hover:underline">
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
