import { Link } from 'react-router-dom'
import FrogIcon from './FrogIcon'
import Reveal from './Reveal'

/** Página provisional para las secciones que aún están en construcción. */
export default function ComingSoon({ title, description, illustration: Illustration = FrogIcon }) {
  return (
    <section className="bg-dorace-pattern relative flex min-h-screen items-center justify-center overflow-hidden bg-jungle pt-16 text-tea">
      <div className="relative mx-auto max-w-xl px-6 py-24 text-center">
        <Reveal>
          <Illustration className="mx-auto h-24 w-24 text-caribbean" />
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-8 font-display text-sm uppercase tracking-[0.3em] text-caribbean">
            Próximamente
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-cream md:text-5xl">
            {title}
          </h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-5 leading-relaxed text-tea/80">{description}</p>
          <Link
            to="/"
            className="mt-10 inline-block rounded-full border border-caribbean px-6 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-caribbean transition hover:bg-caribbean hover:text-jungle"
          >
            Volver al inicio
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
