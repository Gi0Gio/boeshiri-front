import { useState } from 'react'
import { Link } from 'react-router-dom'
import FrogIcon from '../components/FrogIcon'
import Reveal from '../components/Reveal'

const pasos = [
  { id: 1, titulo: 'Tu cuenta', desc: 'Cómo entrarás al colectivo' },
  { id: 2, titulo: 'Tu arte', desc: 'Qué haces y dónde te vemos' },
  { id: 3, titulo: 'Tu porqué', desc: 'Por qué quieres sumarte' },
]

const disciplinas = [
  'Música',
  'Muralismo',
  'Fotografía',
  'Danza',
  'Diseño gráfico',
  'Poesía / escritura',
  'Otra',
]

const inputBase =
  'w-full rounded-xl border border-rainforest/20 bg-white px-4 py-3 text-jungle placeholder:text-jungle/40 transition focus:border-caribbean focus:outline-none focus:ring-2 focus:ring-caribbean/30'
const labelBase = 'font-display text-xs font-semibold uppercase tracking-[0.2em] text-rainforest'

export default function Postularme() {
  const [paso, setPaso] = useState(1)
  const [listo, setListo] = useState(false)

  const avanzar = (e) => {
    e.preventDefault()
    if (paso < 3) setPaso((p) => p + 1)
    else setListo(true)
  }

  return (
    <section className="bg-dorace-pattern relative min-h-screen overflow-hidden bg-jungle pt-16">
      <div className="pointer-events-none absolute -right-32 top-10 h-[38rem] w-[38rem] bg-[radial-gradient(closest-side,rgba(0,230,188,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[34rem] w-[34rem] bg-[radial-gradient(closest-side,rgba(0,115,94,0.4),transparent_70%)]" />

      <div className="relative mx-auto max-w-2xl px-5 py-16 md:py-24">
        <Reveal className="text-center">
          <p className="font-display text-sm uppercase tracking-[0.35em] text-caribbean">
            Únete al colectivo
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-tight tracking-wide text-cream md:text-5xl">
            Crea tu cuenta y postúlate
          </h1>
        </Reveal>

        {listo ? (
          <Reveal className="mt-12 rounded-3xl border border-caribbean/40 bg-jungle-deep/60 p-12 text-center backdrop-blur">
            <FrogIcon className="mx-auto h-20 w-20 text-caribbean" />
            <h2 className="mt-6 font-display text-3xl font-semibold uppercase tracking-wide text-cream">
              ¡Postulación recibida!
            </h2>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-tea/80">
              Gracias por querer ser parte de Boesh Irí. El equipo revisará tu solicitud y te
              escribirá pronto. (Demo — aún no se guarda nada de verdad.)
            </p>
            <Link
              to="/"
              className="mt-8 inline-block rounded-full bg-caribbean px-7 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-jungle transition hover:-translate-y-0.5"
            >
              Volver al inicio
            </Link>
          </Reveal>
        ) : (
          <Reveal delay={140} className="mt-12">
            {/* Indicador de pasos */}
            <ol className="mb-8 flex items-center justify-between gap-2">
              {pasos.map((p, i) => {
                const activo = paso === p.id
                const hecho = paso > p.id
                return (
                  <li key={p.id} className="flex flex-1 items-center gap-2 last:flex-none">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 flex-none items-center justify-center rounded-full font-display text-sm font-semibold transition ${
                          activo
                            ? 'bg-caribbean text-jungle'
                            : hecho
                              ? 'bg-rainforest text-cream'
                              : 'bg-jungle-deep/60 text-tea/50'
                        }`}
                      >
                        {hecho ? '✓' : p.id}
                      </span>
                      <span className="hidden sm:block">
                        <span
                          className={`block font-display text-xs font-semibold uppercase tracking-[0.15em] ${activo || hecho ? 'text-cream' : 'text-tea/45'}`}
                        >
                          {p.titulo}
                        </span>
                      </span>
                    </div>
                    {i < pasos.length - 1 && (
                      <span
                        className={`h-px flex-1 ${paso > p.id ? 'bg-rainforest' : 'bg-tea/15'}`}
                      />
                    )}
                  </li>
                )
              })}
            </ol>

            <form
              onSubmit={avanzar}
              className="rounded-3xl border border-tea/10 bg-cream p-8 md:p-10"
            >
              {/* Paso 1 — cuenta */}
              {paso === 1 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="nombre" className={labelBase}>
                      Nombre completo
                    </label>
                    <input id="nombre" required placeholder="Tu nombre" className={inputBase} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="correo" className={labelBase}>
                      Correo
                    </label>
                    <input
                      id="correo"
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      className={inputBase}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="clave" className={labelBase}>
                      Contraseña
                    </label>
                    <input
                      id="clave"
                      type="password"
                      required
                      placeholder="Crea una contraseña"
                      className={inputBase}
                    />
                    <p className="text-xs text-jungle/50">Mínimo 8 caracteres.</p>
                  </div>
                </div>
              )}

              {/* Paso 2 — arte */}
              {paso === 2 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="disciplina" className={labelBase}>
                      Disciplina principal
                    </label>
                    <select id="disciplina" className={inputBase} defaultValue="">
                      <option value="" disabled>
                        ¿Qué creas?
                      </option>
                      {disciplinas.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="instagram" className={labelBase}>
                      Instagram / redes
                    </label>
                    <input id="instagram" placeholder="@tuusuario" className={inputBase} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="portafolio" className={labelBase}>
                      Portafolio o enlace (opcional)
                    </label>
                    <input id="portafolio" placeholder="https://…" className={inputBase} />
                  </div>
                </div>
              )}

              {/* Paso 3 — porqué */}
              {paso === 3 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="motivacion" className={labelBase}>
                      ¿Por qué quieres unirte?
                    </label>
                    <textarea
                      id="motivacion"
                      required
                      rows={5}
                      placeholder="Cuéntanos qué te mueve del arte, la cultura y la comunidad…"
                      className={`${inputBase} resize-none`}
                    />
                  </div>
                  <label className="flex items-start gap-3 text-sm text-jungle/70">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 flex-none accent-[#00735e]"
                    />
                    <span>
                      Acepto que Boesh Irí guarde estos datos para revisar mi postulación.
                    </span>
                  </label>
                </div>
              )}

              {/* Navegación */}
              <div className="mt-8 flex items-center justify-between gap-4">
                {paso > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPaso((p) => p - 1)}
                    className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-rainforest transition hover:text-jungle"
                  >
                    ← Atrás
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  className="rounded-full bg-candy px-8 py-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-terracotta hover:shadow-[0_8px_30px_rgba(229,0,49,0.3)]"
                >
                  {paso < 3 ? 'Continuar' : 'Enviar postulación'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-tea/60">
              ¿Ya tienes cuenta?{' '}
              <span className="cursor-pointer font-semibold text-caribbean underline-offset-4 hover:underline">
                Inicia sesión
              </span>
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}
