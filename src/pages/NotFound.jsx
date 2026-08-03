import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'

/**
 * Página de "no existe". Sirve tanto de ruta comodín como de estado de error de
 * las fichas (producto, publicación…): un enlace viejo de WhatsApp lleva a un id
 * que ya no está, y eso merece la misma cara que un 404, no un aviso suelto.
 *
 * Se renderiza en el sitio en lugar de redirigir para no perder la URL: si la
 * persona recarga o comparte, sigue viendo lo mismo.
 */
export default function NotFound({
  eyebrow = 'Error 404',
  title = 'Te perdiste en la selva',
  description = 'La página que buscas no existe o cambió de lugar. Sigue el canto de Boesh de vuelta al inicio.',
  volverA = '/',
  volverTexto = 'Volver al inicio',
}) {
  return (
    <section className="bg-dorace-pattern relative flex min-h-screen items-center justify-center overflow-hidden bg-jungle pt-16 text-tea">
      <div className="relative mx-auto max-w-xl px-6 py-24 text-center">
        <Reveal>
          <FrogIcon className="mx-auto h-24 w-24 text-caribbean" />
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-8 font-display text-sm uppercase tracking-[0.3em] text-caribbean">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-cream md:text-5xl">{title}</h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-5 leading-relaxed text-tea/80">{description}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={volverA}
              className="rounded-full border border-caribbean px-6 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-caribbean transition hover:bg-caribbean hover:text-jungle"
            >
              {volverTexto}
            </Link>
            {volverA !== '/' && (
              <Link to="/" className="font-display text-sm uppercase tracking-[0.18em] text-tea/60 transition hover:text-tea">
                Ir al inicio
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
